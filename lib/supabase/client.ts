import { createBrowserClient } from '@supabase/ssr';

import { getSupabasePublicConfig } from '@/lib/supabase/public-config';

export function createClient() {
  const { supabaseUrl, supabaseKey } = getSupabasePublicConfig();

  return createBrowserClient(supabaseUrl, supabaseKey);
}
