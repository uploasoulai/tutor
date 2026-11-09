-- Vercel functions have a read-only deployment filesystem. Keep generated
-- classroom jobs and scene JSON in Supabase so separate function instances
-- can read the same progress/result.

CREATE TABLE IF NOT EXISTS classroom_generation_jobs (
  id TEXT PRIMARY KEY,
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  job_data JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS classroom_generation_jobs_owner_created_idx
  ON classroom_generation_jobs(owner_id, created_at DESC);

CREATE TABLE IF NOT EXISTS generated_classrooms (
  id TEXT PRIMARY KEY,
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  classroom_data JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

ALTER TABLE classroom_generation_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE generated_classrooms ENABLE ROW LEVEL SECURITY;

-- The app accesses these tables only from authenticated server routes using
-- its Supabase service credential. No browser role receives direct access.
REVOKE ALL ON TABLE classroom_generation_jobs FROM PUBLIC, anon, authenticated;
REVOKE ALL ON TABLE generated_classrooms FROM PUBLIC, anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE classroom_generation_jobs TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE generated_classrooms TO service_role;
