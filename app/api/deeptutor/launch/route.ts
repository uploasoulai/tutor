import { createHmac, randomBytes, randomUUID } from 'node:crypto';
import { NextRequest, NextResponse } from 'next/server';

import { resolveAccountRole } from '@/lib/auth/account-role';
import { getDeepTutorConfig } from '@/lib/server/deeptutor-config';
import { createSupabaseAdminClient } from '@/lib/supabase/admin';
import { createClient } from '@/lib/supabase/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function b64url(value: string | Buffer) {
  return Buffer.from(value).toString('base64url');
}

function escapeHtml(value: string) {
  const entities: Record<string, string> = {
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  };
  return value.replace(/[&<>"']/g, (character) => entities[character]);
}

function learnerProfileFromMetadata(metadata: unknown): Record<string, string> {
  if (!metadata || typeof metadata !== 'object') return {};
  const values = metadata as Record<string, unknown>;
  const profile: Record<string, string> = {};
  const fields = [
    ['grade_level', values.grade],
    ['curriculum', values.curriculum],
    ['language', values.language ?? values.preferred_language],
  ] as const;
  for (const [field, raw] of fields) {
    if (typeof raw !== 'string') continue;
    const value = raw.trim();
    if (value && value.length <= 80 && !/[\u0000-\u001f\u007f-\u009f]/.test(value)) {
      profile[field] = value;
    }
  }
  return profile;
}

async function createLaunchResponse(
  request: NextRequest,
  mode: string,
  handoffPrompt?: string,
) {
  try {
    const config = getDeepTutorConfig();
    if (!config.enabled || !config.publicUrl || !config.hostSsoSecret) {
      return NextResponse.json({ error: 'Learning service is unavailable' }, { status: 503 });
    }

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Authentication required' }, { status: 401 });

    const accountRole = await resolveAccountRole(user);
    const role =
      accountRole !== 'teacher' &&
      config.adminEmail &&
      user.email?.trim().toLowerCase() === config.adminEmail
        ? 'admin'
        : accountRole;
    if (role === 'teacher') {
      return NextResponse.json({ error: 'Teacher access is not enabled' }, { status: 403 });
    }

    let learnerIds = role === 'student' ? [user.id] : [];
    const learnerProfiles: Record<string, Record<string, string>> = {};
    if (role === 'parent') {
      const admin = createSupabaseAdminClient();
      const { data, error } = await admin
        .from('parent_student_links')
        .select('student_id')
        .eq('parent_id', user.id);
      if (error) throw new Error('Unable to verify family relationships');
      learnerIds = [...new Set((data ?? []).map((row) => row.student_id).filter(Boolean))];
      const profiles = await Promise.all(
        learnerIds.map(async (learnerId) => {
          const { data: learnerData, error: learnerError } =
            await admin.auth.admin.getUserById(learnerId);
          return [
            learnerId,
            learnerError ? {} : learnerProfileFromMetadata(learnerData.user?.user_metadata),
          ] as const;
        }),
      );
      for (const [learnerId, profile] of profiles) {
        if (Object.keys(profile).length) learnerProfiles[learnerId] = profile;
      }
    }

    const now = Math.floor(Date.now() / 1000);
    const allowedModes: Record<string, string[]> = {
      student: ['personal', 'school', 'practice', 'mastery', 'progress', 'profile'],
      parent: ['personal', 'guardian'],
      admin: ['personal', 'school'],
    };
    if (!allowedModes[role]?.includes(mode)) {
      return NextResponse.json(
        { error: 'This learning space is unavailable for your account' },
        { status: 403 },
      );
    }
    if (handoffPrompt && (role !== 'student' || mode !== 'personal')) {
      return NextResponse.json({ error: 'Mistake tutoring is available for learners only' }, { status: 403 });
    }
    const learnerProfile = role === 'student' ? learnerProfileFromMetadata(user.user_metadata) : {};
    const header = b64url(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
    const payload = b64url(JSON.stringify({
      iss: 'coastaltutor', aud: 'deeptutor', sub: user.id, role,
      learner_ids: learnerIds,
      ...(Object.keys(learnerProfile).length ? { learner_profile: learnerProfile } : {}),
      ...(Object.keys(learnerProfiles).length ? { learner_profiles: learnerProfiles } : {}),
      ...(handoffPrompt ? { handoff_prompt: handoffPrompt } : {}),
      mode, iat: now, exp: now + 60, jti: randomUUID(),
    }));
    const signingInput = `${header}.${payload}`;
    const signature = createHmac('sha256', config.hostSsoSecret).update(signingInput).digest('base64url');
    const ticket = `${signingInput}.${signature}`;

    const nonce = randomBytes(18).toString('base64');
    const action = escapeHtml(`${config.publicUrl}/api/auth/host-sso/exchange`);
    const html = `<!doctype html><html lang="en"><meta charset="utf-8"><title>Opening learning space</title><body><form id="sso" method="post" action="${action}"><input type="hidden" name="ticket" value="${escapeHtml(ticket)}"><noscript><button type="submit">Continue</button></noscript></form><script nonce="${nonce}">document.getElementById('sso').submit()</script></body></html>`;
    return new NextResponse(html, {
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'no-store, max-age=0',
        'Pragma': 'no-cache',
        'Referrer-Policy': 'no-referrer',
        'X-Content-Type-Options': 'nosniff',
        'Content-Security-Policy': `default-src 'none'; script-src 'nonce-${nonce}'; form-action ${config.publicUrl}; base-uri 'none'; frame-ancestors 'none'`,
      },
    });
  } catch {
    return NextResponse.json({ error: 'Unable to start a learning session' }, { status: 503 });
  }
}

export async function GET(request: NextRequest) {
  return createLaunchResponse(request, request.nextUrl.searchParams.get('mode') || 'personal');
}

export async function POST(request: NextRequest) {
  const contentLength = Number(request.headers.get('content-length') ?? 0);
  if (contentLength > 30_000) {
    return NextResponse.json({ error: 'Tutoring request is too long' }, { status: 413 });
  }
  try {
    const form = await request.formData();
    const mode = String(form.get('mode') || 'personal');
    const prompt = String(form.get('prompt') || '');
    if (!prompt.trim() || prompt.length > 5000) {
      return NextResponse.json({ error: 'Invalid tutoring request' }, { status: 400 });
    }
    return createLaunchResponse(request, mode, prompt.trim());
  } catch {
    return NextResponse.json({ error: 'Invalid tutoring request' }, { status: 400 });
  }
}
