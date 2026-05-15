export function formatAuthError(error: unknown, fallback: string) {
  const message = error instanceof Error ? error.message : '';
  if (/supabase public url and publishable key are required/i.test(message)) {
    return 'Supabase Auth is not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY in the deployment environment.';
  }
  if (/failed to fetch|networkerror|load failed/i.test(message)) {
    return 'Cannot reach Supabase Auth. Check NEXT_PUBLIC_SUPABASE_URL, the publishable key, and Supabase Auth URL/CORS settings.';
  }

  return message || fallback;
}
