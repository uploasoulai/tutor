-- Additive storage for the Chinese graph-based school-learning route.
-- Uses the existing platform learner ID and shared learning_sessions history.

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Bring existing production learning history up to the columns used by the
-- shared School Learning session writer. The base schema already has these
-- fields, but older deployed databases may not.
ALTER TABLE learning_sessions
  ADD COLUMN IF NOT EXISTS coastaltutor_lesson_id TEXT,
  ADD COLUMN IF NOT EXISTS bc_outcome_ids UUID[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS lesson_title TEXT,
  ADD COLUMN IF NOT EXISTS lesson_payload JSONB,
  ADD COLUMN IF NOT EXISTS reuse_key TEXT,
  ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'planned';

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'learning_sessions_status_check'
      AND conrelid = 'learning_sessions'::regclass
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

CREATE TABLE IF NOT EXISTS student_curriculum_mastery (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  curriculum_track TEXT NOT NULL,
  topic_id TEXT NOT NULL,
  mastery_level FLOAT NOT NULL DEFAULT 0 CHECK (mastery_level >= 0 AND mastery_level <= 1),
  attempts INTEGER NOT NULL DEFAULT 0 CHECK (attempts >= 0),
  correct_attempts INTEGER NOT NULL DEFAULT 0 CHECK (correct_attempts >= 0),
  last_studied_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  UNIQUE (student_id, curriculum_track, topic_id)
);

CREATE INDEX IF NOT EXISTS student_curriculum_mastery_lookup_idx
  ON student_curriculum_mastery(student_id, curriculum_track, topic_id);

CREATE TABLE IF NOT EXISTS student_curriculum_attempts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  learning_session_id UUID REFERENCES learning_sessions(id) ON DELETE SET NULL,
  curriculum_track TEXT NOT NULL,
  topic_id TEXT NOT NULL,
  question_id TEXT NOT NULL,
  is_correct BOOLEAN NOT NULL,
  response_latency_ms INTEGER CHECK (response_latency_ms IS NULL OR response_latency_ms >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS student_curriculum_attempts_history_idx
  ON student_curriculum_attempts(student_id, curriculum_track, created_at DESC);

ALTER TABLE student_curriculum_mastery ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_curriculum_attempts ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION record_student_curriculum_attempt(
  p_student_id UUID,
  p_learning_session_id UUID,
  p_curriculum_track TEXT,
  p_topic_id TEXT,
  p_question_id TEXT,
  p_is_correct BOOLEAN,
  p_response_latency_ms INTEGER DEFAULT NULL
)
RETURNS student_curriculum_mastery
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  saved_mastery student_curriculum_mastery;
BEGIN
  INSERT INTO student_curriculum_attempts (
    student_id, learning_session_id, curriculum_track, topic_id, question_id,
    is_correct, response_latency_ms
  ) VALUES (
    p_student_id, p_learning_session_id, p_curriculum_track, p_topic_id, p_question_id,
    p_is_correct, p_response_latency_ms
  );

  INSERT INTO student_curriculum_mastery (
    student_id, curriculum_track, topic_id, attempts, correct_attempts,
    mastery_level, last_studied_at, updated_at
  ) VALUES (
    p_student_id, p_curriculum_track, p_topic_id, 1, CASE WHEN p_is_correct THEN 1 ELSE 0 END,
    CASE WHEN p_is_correct THEN 0.35 ELSE 0 END, now(), now()
  )
  ON CONFLICT (student_id, curriculum_track, topic_id) DO UPDATE SET
    attempts = student_curriculum_mastery.attempts + 1,
    correct_attempts = student_curriculum_mastery.correct_attempts + CASE WHEN p_is_correct THEN 1 ELSE 0 END,
    mastery_level = LEAST(1, GREATEST(0, student_curriculum_mastery.mastery_level + CASE WHEN p_is_correct THEN 0.2 ELSE -0.1 END)),
    last_studied_at = now(),
    updated_at = now()
  RETURNING * INTO saved_mastery;

  RETURN saved_mastery;
END;
$$;

REVOKE ALL ON FUNCTION record_student_curriculum_attempt(UUID, UUID, TEXT, TEXT, TEXT, BOOLEAN, INTEGER) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION record_student_curriculum_attempt(UUID, UUID, TEXT, TEXT, TEXT, BOOLEAN, INTEGER) TO service_role;

-- Existing OpenMAIC/BC history remains in learning_sessions. The JSON payload
-- stores the Chinese graph topic and generated classroom URL in that same history.
-- These tables are accessed through authenticated server routes only.
