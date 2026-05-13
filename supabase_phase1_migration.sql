-- CoastalTutor Phase 1 migration
-- Run this in the Supabase SQL Editor before running scripts/seed-bc.ts.

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS vector;

ALTER TABLE bc_subjects
  ADD COLUMN IF NOT EXISTS subject_area TEXT,
  ADD COLUMN IF NOT EXISTS source_file TEXT,
  ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL;

ALTER TABLE bc_learning_outcomes
  ADD COLUMN IF NOT EXISTS elaboration TEXT,
  ADD COLUMN IF NOT EXISTS chunk_text TEXT,
  ADD COLUMN IF NOT EXISTS source_file TEXT,
  ADD COLUMN IF NOT EXISTS chunk_index INTEGER,
  ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL;

-- Phase 1 uses Voyage voyage-3-lite embeddings, which are 512-dimensional.
-- Existing mock/OpenAI-sized embeddings cannot be cast safely, so this clears
-- the old embedding values and changes the pgvector column type.
ALTER TABLE bc_learning_outcomes
  ALTER COLUMN embedding TYPE vector(512) USING NULL::vector(512);

CREATE INDEX IF NOT EXISTS bc_learning_outcomes_subject_idx
  ON bc_learning_outcomes(subject_id);

CREATE INDEX IF NOT EXISTS bc_learning_outcomes_embedding_idx
  ON bc_learning_outcomes USING ivfflat (embedding vector_cosine_ops)
  WITH (lists = 100);

CREATE OR REPLACE FUNCTION match_bc_learning_outcomes(
    query_embedding vector(512),
    match_count integer DEFAULT 5,
    filter_grade integer DEFAULT NULL,
    filter_subject_area text DEFAULT NULL
)
RETURNS TABLE (
    id uuid,
    subject_id uuid,
    outcome_code text,
    big_idea text,
    content_knowledge text,
    elaboration text,
    chunk_text text,
    grade_level integer,
    subject_area text,
    similarity float
)
LANGUAGE sql STABLE
AS $$
    SELECT
        o.id,
        o.subject_id,
        o.outcome_code,
        o.big_idea,
        o.content_knowledge,
        o.elaboration,
        o.chunk_text,
        s.grade_level,
        s.subject_area,
        1 - (o.embedding <=> query_embedding) AS similarity
    FROM bc_learning_outcomes o
    JOIN bc_subjects s ON s.id = o.subject_id
    WHERE o.embedding IS NOT NULL
      AND (filter_grade IS NULL OR s.grade_level = filter_grade)
      AND (filter_subject_area IS NULL OR s.subject_area = filter_subject_area)
    ORDER BY o.embedding <=> query_embedding
    LIMIT match_count;
$$;

ALTER TABLE learning_sessions
  ADD COLUMN IF NOT EXISTS lesson_title TEXT,
  ADD COLUMN IF NOT EXISTS lesson_payload JSONB,
  ADD COLUMN IF NOT EXISTS reuse_key TEXT,
  ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'planned';

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'learning_sessions_status_check'
  ) THEN
    ALTER TABLE learning_sessions
      ADD CONSTRAINT learning_sessions_status_check
      CHECK (status IN ('planned', 'generated', 'started', 'completed'));
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS learning_sessions_student_started_idx
  ON learning_sessions(student_id, started_at DESC);

CREATE INDEX IF NOT EXISTS learning_sessions_reuse_key_idx
  ON learning_sessions(student_id, reuse_key);
