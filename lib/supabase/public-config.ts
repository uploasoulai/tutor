const PRERENDER_SUPABASE_URL = 'http://127.0.0.1:54321';
const PRERENDER_SUPABASE_KEY = 'prerender-placeholder-key';

export function getSupabasePublicConfig() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (supabaseUrl && supabaseKey) {
    return { supabaseUrl, supabaseKey };
  }

  if (typeof window === 'undefined') {
    return {
      supabaseUrl: supabaseUrl ?? PRERENDER_SUPABASE_URL,
      supabaseKey: supabaseKey ?? PRERENDER_SUPABASE_KEY,
    };
  }

  throw new Error('Supabase public URL and publishable key are required.');
}
