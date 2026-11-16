-- Additive curated library. Raw content stays in the existing PRIVATE curriculum bucket.
CREATE TABLE IF NOT EXISTS public.course_library_candidates (
  classroom_id text PRIMARY KEY,
  cache_key text NOT NULL,
  curriculum_track text NOT NULL CHECK (curriculum_track IN ('china','bc')),
  canonical_id text NOT NULL,
  title text NOT NULL,
  owner_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  kind text NOT NULL DEFAULT 'generated' CHECK (kind IN ('generated','prepared')),
  entry_path text NOT NULL,
  storage_path text,
  artifact_sha256 text,
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','testing','recommended','retired')),
  is_public boolean NOT NULL DEFAULT false,
  submitted boolean NOT NULL DEFAULT false,
  checks jsonb NOT NULL DEFAULT '{}'::jsonb,
  review_checklist jsonb NOT NULL DEFAULT '{}'::jsonb,
  reviewed_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  reviewed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS course_library_topic_idx ON public.course_library_candidates(curriculum_track,canonical_id);
CREATE UNIQUE INDEX IF NOT EXISTS course_library_one_default_idx ON public.course_library_candidates(cache_key) WHERE status='recommended';
CREATE TABLE IF NOT EXISTS public.course_library_feedback (
  classroom_id text NOT NULL REFERENCES public.course_library_candidates(classroom_id),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  kind text CHECK (kind IN ('understood','difficult','another_way','content_issue','interaction_issue')),
  recommend boolean NOT NULL DEFAULT false,
  updated_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (classroom_id,user_id)
);
ALTER TABLE public.course_library_candidates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_library_feedback ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.course_library_candidates,public.course_library_feedback FROM PUBLIC,anon,authenticated;
GRANT ALL ON public.course_library_candidates,public.course_library_feedback TO service_role;

CREATE OR REPLACE VIEW public.course_library_summary AS
SELECT c.*,count(f.user_id)::integer AS feedback_count,
  count(*) FILTER (WHERE f.recommend)::integer AS recommendation_count,
  count(*) FILTER (WHERE f.kind='understood')::integer AS understood_count,
  count(*) FILTER (WHERE f.kind='difficult')::integer AS difficult_count,
  count(*) FILTER (WHERE f.kind IN ('content_issue','interaction_issue'))::integer AS issue_count
FROM public.course_library_candidates c LEFT JOIN public.course_library_feedback f USING(classroom_id)
GROUP BY c.classroom_id;
REVOKE ALL ON public.course_library_summary FROM PUBLIC,anon,authenticated;
GRANT SELECT ON public.course_library_summary TO service_role;

CREATE OR REPLACE FUNCTION public.record_course_library_feedback(p_classroom_id text,p_user_id uuid,p_kind text DEFAULT NULL,p_recommend boolean DEFAULT NULL)
RETURNS void LANGUAGE plpgsql SET search_path=public AS $$
BEGIN
  IF NOT EXISTS(SELECT 1 FROM course_library_candidates WHERE classroom_id=p_classroom_id AND (owner_id=p_user_id OR is_public)) THEN
    RAISE EXCEPTION 'Course unavailable';
  END IF;
  INSERT INTO course_library_feedback(classroom_id,user_id,kind,recommend)
  VALUES(p_classroom_id,p_user_id,p_kind,coalesce(p_recommend,false))
  ON CONFLICT(classroom_id,user_id) DO UPDATE SET
    kind=coalesce(p_kind,course_library_feedback.kind),recommend=coalesce(p_recommend,course_library_feedback.recommend),updated_at=now();
  IF p_recommend IS NOT NULL THEN UPDATE course_library_candidates SET submitted=p_recommend WHERE classroom_id=p_classroom_id AND owner_id=p_user_id AND status='draft'; END IF;
END $$;

CREATE OR REPLACE FUNCTION public.review_course_library_candidate(p_classroom_id text,p_status text,p_reviewer uuid,p_checklist jsonb DEFAULT '{}'::jsonb)
RETURNS void LANGUAGE plpgsql SET search_path=public AS $$
DECLARE item course_library_candidates;
BEGIN
  SELECT * INTO item FROM course_library_candidates WHERE classroom_id=p_classroom_id;
  IF NOT FOUND OR p_status NOT IN ('testing','recommended','retired') THEN RAISE EXCEPTION 'Invalid review'; END IF;
  PERFORM pg_advisory_xact_lock(hashtextextended(item.cache_key,0));
  SELECT * INTO item FROM course_library_candidates WHERE classroom_id=p_classroom_id FOR UPDATE;
  IF p_status IN ('testing','recommended') AND item.owner_id IS NOT NULL AND NOT item.submitted AND NOT item.is_public THEN RAISE EXCEPTION 'Author submission required'; END IF;
  IF p_status IN ('testing','recommended') AND coalesce((item.checks->>'pass')::boolean,false)=false THEN RAISE EXCEPTION 'Basic checks required'; END IF;
  IF p_status='recommended' THEN
    IF NOT (coalesce((p_checklist->>'accurate')::boolean,false) AND coalesce((p_checklist->>'ageAppropriate')::boolean,false) AND coalesce((p_checklist->>'works')::boolean,false)) THEN RAISE EXCEPTION 'Human review required'; END IF;
    UPDATE course_library_candidates SET status='retired' WHERE cache_key=item.cache_key AND status='recommended' AND classroom_id<>p_classroom_id;
  END IF;
  UPDATE course_library_candidates SET status=p_status,is_public=(is_public OR p_status IN ('testing','recommended')),
    reviewed_by=p_reviewer,reviewed_at=now(),review_checklist=p_checklist WHERE classroom_id=p_classroom_id;
END $$;
REVOKE ALL ON FUNCTION public.record_course_library_feedback(text,uuid,text,boolean),public.review_course_library_candidate(text,text,uuid,jsonb) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.record_course_library_feedback(text,uuid,text,boolean),public.review_course_library_candidate(text,text,uuid,jsonb) TO service_role;

-- Preserve already shared versions and their existing learner links; they are trials,
-- not silently certified as recommended courses. No raw learner history is imported.
INSERT INTO public.course_library_candidates(classroom_id,cache_key,curriculum_track,canonical_id,title,entry_path,storage_path,artifact_sha256,status,is_public,checks)
SELECT classroom_id,cache_key,curriculum_track,canonical_id,'既有试用课程 · '||canonical_id,'/classroom/'||classroom_id,storage_path,artifact_sha256,'testing',true,
  jsonb_build_object('pass',true,'source','legacy structural cache','humanReviewRequired',true)
FROM public.curriculum_lesson_artifacts WHERE status='ready'
ON CONFLICT(classroom_id) DO NOTHING;

INSERT INTO public.course_library_candidates(classroom_id,cache_key,curriculum_track,canonical_id,title,kind,entry_path,status,is_public,checks,review_checklist)
VALUES('prepared-multiplication-v5','prepared:china:pep:cnm_p038:v5','china','pep:cnm_p038','二年级数学 · 海边乘法探索课','prepared','/school-learning/china/multiplication-lab','recommended',true,
  '{"pass":true,"source":"existing shared Grade-2 pilot with browser checks"}',
  '{"accurate":true,"ageAppropriate":true,"works":true,"source":"existing user-approved shared pilot"}')
ON CONFLICT(classroom_id) DO NOTHING;
NOTIFY pgrst,'reload schema';
