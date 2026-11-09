import { timingSafeEqual } from 'node:crypto';
import { NextRequest, NextResponse } from 'next/server';
import { getLearnerCredential } from '@/lib/server/byok-vault';

/** Internal DeepTutor adapter endpoint. The credential is returned only to a
 * service possessing the shared internal token and is never browser-facing. */
export async function GET(request: NextRequest) {
  const expected = process.env.PLATFORM_AI_INTERNAL_TOKEN;
  const supplied = request.headers.get('authorization')?.replace(/^Bearer\s+/i, '');
  const expectedBytes = Buffer.from(expected || '');
  const suppliedBytes = Buffer.from(supplied || '');
  if (
    !expected ||
    !supplied ||
    expectedBytes.length !== suppliedBytes.length ||
    !timingSafeEqual(expectedBytes, suppliedBytes)
  ) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }
  const userId = request.nextUrl.searchParams.get('user_id');
  if (
    !userId ||
    !(
      /^[0-9a-f]{32}$/i.test(userId) ||
      /^[0-9a-f]{8}(?:-[0-9a-f]{4}){3}-[0-9a-f]{12}$/i.test(userId)
    )
  ) {
    return NextResponse.json({ error: 'invalid_user_id' }, { status: 400 });
  }
  try {
    const credential = await getLearnerCredential(userId);
    if (!credential)
      return NextResponse.json({ configured: false }, { headers: { 'Cache-Control': 'no-store' } });
    let defaults: Record<string, string> = {};
    try {
      defaults = JSON.parse(process.env.BYOK_DEFAULT_MODELS_JSON || '{}') as Record<string, string>;
    } catch {
      return NextResponse.json(
        { error: 'provider_configuration_unavailable' },
        { status: 503, headers: { 'Cache-Control': 'no-store' } },
      );
    }
    const modelId = defaults[credential.providerId];
    if (
      !modelId ||
      !(process.env.BYOK_VERIFIED_PROVIDERS || '')
        .split(',')
        .map((value) => value.trim())
        .includes(credential.providerId)
    ) {
      return NextResponse.json({ configured: false }, { headers: { 'Cache-Control': 'no-store' } });
    }
    return NextResponse.json(
      {
        configured: true,
        provider_id: credential.providerId,
        model_id: modelId,
        api_key: credential.apiKey,
      },
      { headers: { 'Cache-Control': 'no-store, private' } },
    );
  } catch {
    return NextResponse.json(
      { error: 'credential_unavailable' },
      { status: 503, headers: { 'Cache-Control': 'no-store' } },
    );
  }
}
