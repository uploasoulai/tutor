const PRERENDER_SUPABASE_URL = 'http://127.0.0.1:54321';
const PRERENDER_SUPABASE_KEY = 'prerender-placeholder-key';

export function getSupabasePublicConfig() {
  const supabaseUrl = normalizeEnvValue(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    'NEXT_PUBLIC_SUPABASE_URL',
  );
  const supabaseKey =
    normalizeEnvValue(
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
      'NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY',
    ) ??
    normalizeEnvValue(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY, 'NEXT_PUBLIC_SUPABASE_ANON_KEY');

  if (isValidHttpUrl(supabaseUrl) && supabaseKey) {
    return { configured: true, supabaseUrl, supabaseKey };
  }

  return {
    configured: false,
    supabaseUrl: isValidHttpUrl(supabaseUrl) ? supabaseUrl : PRERENDER_SUPABASE_URL,
    supabaseKey: supabaseKey ?? PRERENDER_SUPABASE_KEY,
  };
}

export function isSupabasePublicConfigured() {
  return getSupabasePublicConfig().configured;
}

function normalizeEnvValue(value: string | undefined, key: string) {
  if (!value) return undefined;

  const trimmed = value.trim().replace(/^['"]|['"]$/g, '');
  const assignmentPrefix = `${key}=`;
  if (trimmed.startsWith(assignmentPrefix)) {
    return trimmed
      .slice(assignmentPrefix.length)
      .trim()
      .replace(/^['"]|['"]$/g, '');
  }

  return trimmed;
}

function isValidHttpUrl(value: string | undefined): value is string {
  if (!value) return false;
  try {
    const parsed = new URL(value);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
}
