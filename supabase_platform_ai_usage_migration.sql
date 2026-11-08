-- Platform-hosted AI usage ledger. Apply with the Supabase SQL editor or CLI.
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS platform_ai_usage (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  request_id TEXT NOT NULL,
  source TEXT NOT NULL,
  provider_id TEXT NOT NULL,
  model_id TEXT NOT NULL,
  input_tokens BIGINT NOT NULL DEFAULT 0 CHECK (input_tokens >= 0),
  output_tokens BIGINT NOT NULL DEFAULT 0 CHECK (output_tokens >= 0),
  cost_usd NUMERIC(14, 8) NOT NULL CHECK (cost_usd >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (request_id, source)
);

CREATE INDEX IF NOT EXISTS platform_ai_usage_user_month_idx
  ON platform_ai_usage (user_id, created_at DESC);

ALTER TABLE platform_ai_usage ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON platform_ai_usage FROM anon, authenticated;
GRANT SELECT, INSERT ON platform_ai_usage TO service_role;

CREATE OR REPLACE FUNCTION platform_ai_monthly_usage(p_user_id UUID, p_month_start TIMESTAMPTZ)
RETURNS TABLE (cost_usd NUMERIC, input_tokens BIGINT, output_tokens BIGINT)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT COALESCE(SUM(u.cost_usd), 0),
         COALESCE(SUM(u.input_tokens), 0),
         COALESCE(SUM(u.output_tokens), 0)
  FROM platform_ai_usage AS u
  WHERE u.user_id = p_user_id AND u.created_at >= p_month_start;
$$;

REVOKE ALL ON FUNCTION platform_ai_monthly_usage(UUID, TIMESTAMPTZ) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION platform_ai_monthly_usage(UUID, TIMESTAMPTZ) TO service_role;
