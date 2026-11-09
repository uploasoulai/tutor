-- Shared, immutable curriculum lesson artifacts. Learner sessions and mastery
-- remain in learning_sessions / student_curriculum_mastery and are never shared.

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'curriculum-lessons',
  'curriculum-lessons',
  false,
  52428800,
  ARRAY['application/json', 'application/gzip']
)
ON CONFLICT (id) DO UPDATE
SET public = false,
    file_size_limit = EXCLUDED.file_size_limit,
    allowed_mime_types = EXCLUDED.allowed_mime_types;

CREATE TABLE IF NOT EXISTS curriculum_lesson_artifacts (
  cache_key TEXT PRIMARY KEY,
  classroom_id TEXT NOT NULL UNIQUE,
  storage_path TEXT NOT NULL UNIQUE,
  curriculum_track TEXT NOT NULL CHECK (curriculum_track IN ('bc', 'china')),
  canonical_id TEXT NOT NULL,
  source_revision TEXT NOT NULL,
  schema_version INTEGER NOT NULL,
  artifact_bytes BIGINT NOT NULL CHECK (artifact_bytes > 0),
  artifact_sha256 TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'ready' CHECK (status IN ('ready', 'invalidated')),
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS curriculum_lesson_artifacts_track_canonical_idx
  ON curriculum_lesson_artifacts(curriculum_track, canonical_id, updated_at DESC);

ALTER TABLE curriculum_lesson_artifacts ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE curriculum_lesson_artifacts FROM PUBLIC, anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE curriculum_lesson_artifacts TO service_role;

-- The bucket is private. The application accesses it only from server routes
-- with the service credential; no learner browser receives direct bucket access.
