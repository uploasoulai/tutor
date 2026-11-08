-- Per-learner BYOK credential vault. Ciphertext is AES-256-GCM encrypted by
-- the application; the encryption key is kept outside Supabase.
create table if not exists public.learner_ai_credentials (
  user_id uuid primary key references auth.users(id) on delete cascade,
  provider_id text not null,
  encrypted_key text not null,
  encryption_iv text not null,
  encryption_tag text not null,
  key_fingerprint text not null,
  verified_at timestamptz,
  updated_at timestamptz not null default now()
);

alter table public.learner_ai_credentials enable row level security;
revoke all on public.learner_ai_credentials from anon, authenticated;
grant all on public.learner_ai_credentials to service_role;
