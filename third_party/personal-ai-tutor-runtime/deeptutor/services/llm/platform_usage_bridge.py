"""Bridge DeepTutor platform-model accounting into CoastalTutor's shared ledger."""

from __future__ import annotations

import os
import uuid

import httpx


def _platform_user_uuid() -> str:
    from deeptutor.multi_user.context import get_current_user_or_none

    user = get_current_user_or_none()
    user_id = str(getattr(user, "id", "") or "")
    if user_id.startswith("u_") and len(user_id) == 34:
        return str(uuid.UUID(user_id[2:]))
    raise RuntimeError("Platform AI requires a CoastalTutor learner identity")


def _endpoint_and_token() -> tuple[str, str]:
    base_url = os.environ.get("COASTALTUTOR_PLATFORM_AI_URL", "").strip().rstrip("/")
    token = os.environ.get("PLATFORM_AI_INTERNAL_TOKEN", "").strip()
    if not base_url or len(token) < 32:
        raise RuntimeError("CoastalTutor Platform AI usage bridge is not configured")
    return f"{base_url}/api/internal/platform-ai/usage", token


async def _post(payload: dict) -> dict:
    endpoint, token = _endpoint_and_token()
    async with httpx.AsyncClient(timeout=8.0) as client:
        response = await client.post(
            endpoint,
            json=payload,
            headers={"Authorization": f"Bearer {token}"},
        )
    try:
        result = response.json()
    except ValueError as exc:
        raise RuntimeError("CoastalTutor usage service returned an invalid response") from exc
    if response.status_code == 402:
        message = str(result.get("error") or result.get("message") or "")
        raise RuntimeError(message or "本月平台 AI 使用额度已用完，请下月再试。")
    if response.status_code >= 400 or result.get("success") is False:
        raise RuntimeError(str(result.get("error") or "CoastalTutor usage service is unavailable"))
    return result


async def assert_platform_ai_available() -> None:
    await _post({"action": "check", "userId": _platform_user_uuid()})


async def record_platform_ai_usage(
    *, request_id: str, model: str, provider: str, input_tokens: int, output_tokens: int
) -> None:
    await _post(
        {
            "action": "record",
            "userId": _platform_user_uuid(),
            "requestId": request_id,
            "providerId": provider.strip().lower(),
            "modelId": model,
            "inputTokens": max(0, int(input_tokens)),
            "outputTokens": max(0, int(output_tokens)),
            "source": "deeptutor",
        }
    )
