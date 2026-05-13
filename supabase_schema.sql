CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS vector;

-- Profiles (Base account for all roles)
CREATE TABLE profiles (
    id UUID PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('student', 'teacher', 'parent', 'admin')),
    full_name TEXT,
    preferred_name TEXT,
    language_preference TEXT DEFAULT 'zh',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Students
CREATE TABLE students (
    id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
    grade_level INTEGER CHECK (grade_level BETWEEN 1 AND 12),
    school_name TEXT,
    school_district TEXT,
    avatar_preferences JSONB DEFAULT '{"favorite_animal": null, "favorite_color": null, "teacher_style": null}'::jsonb,
    daily_target_minutes INTEGER DEFAULT 30,
    streak_days INTEGER DEFAULT 0,
    total_xp INTEGER DEFAULT 0
);

-- Parents
CREATE TABLE parents (
    id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
    notification_email TEXT,
    notification_wechat TEXT,
    report_frequency TEXT CHECK (report_frequency IN ('daily', 'weekly', 'off')) DEFAULT 'daily'
);

-- Teachers
CREATE TABLE teachers (
    id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
    subject_specialties TEXT[]
);

-- Relationships
CREATE TABLE parent_student_links (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    parent_id UUID REFERENCES parents(id) ON DELETE CASCADE,
    student_id UUID REFERENCES students(id) ON DELETE CASCADE,
    UNIQUE(parent_id, student_id)
);

CREATE TABLE teacher_student_links (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    teacher_id UUID REFERENCES teachers(id) ON DELETE CASCADE,
    student_id UUID REFERENCES students(id) ON DELETE CASCADE,
    subjects TEXT[],
    UNIQUE(teacher_id, student_id)
);

-- BC Curriculum System
CREATE TABLE bc_subjects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code TEXT UNIQUE NOT NULL, -- e.g. MATH-4
    name TEXT NOT NULL,
    grade_level INTEGER,
    subject_area TEXT,
    is_ap_course BOOLEAN DEFAULT false,
    source_file TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE bc_learning_outcomes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    subject_id UUID REFERENCES bc_subjects(id) ON DELETE CASCADE,
    outcome_code TEXT UNIQUE NOT NULL,
    big_idea TEXT,
    content_knowledge TEXT,
    elaboration TEXT,
    chunk_text TEXT,
    unit_name TEXT,
    sequence_order INTEGER,
    difficulty_level INTEGER CHECK (difficulty_level BETWEEN 1 AND 5),
    source_file TEXT,
    chunk_index INTEGER,
    metadata JSONB DEFAULT '{}'::jsonb,
    embedding vector(512), -- Voyage voyage-3-lite dimensionality
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX bc_learning_outcomes_subject_idx ON bc_learning_outcomes(subject_id);
CREATE INDEX bc_learning_outcomes_embedding_idx
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

-- Mastery System
CREATE TABLE student_mastery (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID REFERENCES students(id) ON DELETE CASCADE,
    outcome_id UUID REFERENCES bc_learning_outcomes(id) ON DELETE CASCADE,
    mastery_level FLOAT DEFAULT 0.0 CHECK (mastery_level >= 0.0 AND mastery_level <= 1.0),
    ease_factor FLOAT DEFAULT 2.5,
    interval_days INTEGER DEFAULT 0,
    next_review_at TIMESTAMP WITH TIME ZONE,
    consecutive_correct INTEGER DEFAULT 0,
    attempts INTEGER DEFAULT 0,
    correct_attempts INTEGER DEFAULT 0,
    is_flagged_for_tutor BOOLEAN DEFAULT false,
    UNIQUE(student_id, outcome_id)
);

-- Session System
CREATE TABLE learning_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID REFERENCES students(id) ON DELETE CASCADE,
    session_type TEXT CHECK (session_type IN ('lesson', 'quiz', 'review', 'ap_mock')),
    started_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    ended_at TIMESTAMP WITH TIME ZONE,
    duration_seconds INTEGER,
    coastaltutor_lesson_id TEXT,
    bc_outcome_ids UUID[],
    lesson_title TEXT,
    lesson_payload JSONB,
    reuse_key TEXT,
    status TEXT CHECK (status IN ('planned', 'generated', 'started', 'completed')) DEFAULT 'planned',
    accuracy_rate FLOAT,
    emotion_trajectory JSONB,
    xp_earned INTEGER DEFAULT 0,
    needs_tutor_review BOOLEAN DEFAULT false
);

CREATE INDEX learning_sessions_student_started_idx ON learning_sessions(student_id, started_at DESC);
CREATE INDEX learning_sessions_reuse_key_idx ON learning_sessions(student_id, reuse_key);

CREATE TABLE question_attempts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id UUID REFERENCES learning_sessions(id) ON DELETE CASCADE,
    student_id UUID REFERENCES students(id) ON DELETE CASCADE,
    outcome_id UUID REFERENCES bc_learning_outcomes(id),
    is_correct BOOLEAN,
    attempt_number INTEGER,
    hint_level_used INTEGER DEFAULT 0,
    response_latency_ms INTEGER,
    ai_feedback TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Gamification System
CREATE TABLE xp_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID REFERENCES students(id) ON DELETE CASCADE,
    amount INTEGER NOT NULL,
    reason TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

CREATE TABLE badges (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    description TEXT,
    icon_url TEXT,
    trigger_condition TEXT
);

CREATE TABLE student_badges (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID REFERENCES students(id) ON DELETE CASCADE,
    badge_id UUID REFERENCES badges(id) ON DELETE CASCADE,
    earned_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    UNIQUE(student_id, badge_id)
);

-- Reports & Alerts
CREATE TABLE parent_reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    parent_id UUID REFERENCES parents(id) ON DELETE CASCADE,
    student_id UUID REFERENCES students(id) ON DELETE CASCADE,
    report_type TEXT CHECK (report_type IN ('daily', 'weekly', 'monthly', 'report_card')),
    summary_text TEXT,
    metrics JSONB,
    delivery_status TEXT DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

CREATE TABLE tutor_alerts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID REFERENCES students(id) ON DELETE CASCADE,
    teacher_id UUID REFERENCES teachers(id),
    alert_type TEXT CHECK (alert_type IN ('triple_failure', 'missed_sessions', 'low_engagement', 'mastery_plateau')),
    is_resolved BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    resolved_at TIMESTAMP WITH TIME ZONE
);
