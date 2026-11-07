"""First-time host SSO onboarding for the platform operator."""

from __future__ import annotations

from pathlib import Path

from deeptutor.api.routers.auth import _admin_needs_llm_setup


class _AdminPathService:
    def __init__(self, settings_path: Path) -> None:
        self.settings_path = settings_path

    def get_settings_file(self, name: str) -> Path:
        assert name == "model_catalog"
        return self.settings_path


def test_admin_without_active_llm_model_needs_setup(tmp_path, monkeypatch) -> None:
    from deeptutor.multi_user import paths

    catalog_path = tmp_path / "model_catalog.json"
    monkeypatch.setattr(
        paths,
        "get_admin_path_service",
        lambda: _AdminPathService(catalog_path),
    )

    assert _admin_needs_llm_setup() is True


def test_admin_with_active_llm_model_can_continue(tmp_path, monkeypatch) -> None:
    from deeptutor.multi_user import paths
    from deeptutor.services.config.model_catalog import ModelCatalogService

    catalog_path = tmp_path / "model_catalog.json"
    monkeypatch.setattr(
        paths,
        "get_admin_path_service",
        lambda: _AdminPathService(catalog_path),
    )
    catalog_service = ModelCatalogService.get_instance(catalog_path)
    catalog = catalog_service.load()
    catalog["services"]["llm"].update(
        {
            "active_profile_id": "platform-llm",
            "active_model_id": "platform-model",
            "profiles": [
                {
                    "id": "platform-llm",
                    "name": "Platform LLM",
                    "binding": "openai",
                    "api_key": "test-key",
                    "models": [
                        {
                            "id": "platform-model",
                            "name": "Platform model",
                            "model": "test-model",
                        }
                    ],
                }
            ],
        }
    )
    catalog_service.save(catalog)

    assert _admin_needs_llm_setup() is False
