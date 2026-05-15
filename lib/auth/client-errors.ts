export function formatAuthError(error: unknown, fallback: string) {
  const message = error instanceof Error ? error.message : '';
  if (/failed to fetch|networkerror|load failed/i.test(message)) {
    return 'Cannot reach Supabase Auth. Check NEXT_PUBLIC_SUPABASE_URL, the publishable key, and Supabase Auth URL/CORS settings.';
  }

  return message || fallback;
}
