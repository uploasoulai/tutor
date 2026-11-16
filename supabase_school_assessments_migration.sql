-- Paper snapshots/keys are server-private. School records use the existing learner ID.
CREATE TABLE IF NOT EXISTS public.school_assessments (
 id uuid PRIMARY KEY REFERENCES public.learning_sessions(id) ON DELETE CASCADE,
 student_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
 config jsonb NOT NULL, questions jsonb NOT NULL,
 answers jsonb,report jsonb,status text NOT NULL DEFAULT 'started' CHECK(status IN('started','completed')),
 created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS school_assessments_student_idx ON public.school_assessments(student_id,created_at DESC);
ALTER TABLE public.school_assessments ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.school_assessments FROM PUBLIC,anon,authenticated;
GRANT ALL ON public.school_assessments TO service_role;
CREATE OR REPLACE FUNCTION public.create_school_assessment(p_student_id uuid,p_title text,p_config jsonb,p_questions jsonb)
RETURNS uuid LANGUAGE plpgsql SET search_path=public AS $$
DECLARE paper_id uuid:=gen_random_uuid();
BEGIN
 IF jsonb_array_length(p_questions) NOT BETWEEN 1 AND 20 THEN RAISE EXCEPTION 'Invalid paper';END IF;
 INSERT INTO learning_sessions(id,student_id,session_type,lesson_title,status,reuse_key,lesson_payload)
 VALUES(paper_id,p_student_id,'lesson',p_title,'started','assessment:'||paper_id,jsonb_build_object('curriculumTrack','china','assessmentId',paper_id,'assessmentConfig',p_config));
 INSERT INTO school_assessments(id,student_id,config,questions) VALUES(paper_id,p_student_id,p_config,p_questions);
 RETURN paper_id;
END $$;
CREATE OR REPLACE FUNCTION public.submit_school_assessment(p_student_id uuid,p_id uuid,p_answers jsonb,p_report jsonb)
RETURNS jsonb LANGUAGE plpgsql SET search_path=public AS $$
DECLARE paper school_assessments;item jsonb;
BEGIN
 SELECT * INTO paper FROM school_assessments WHERE id=p_id AND student_id=p_student_id FOR UPDATE;
 IF NOT FOUND THEN RAISE EXCEPTION 'Assessment unavailable';END IF;
 IF paper.status='completed' THEN RETURN paper.report;END IF;
 IF jsonb_array_length(p_report->'results')<>jsonb_array_length(paper.questions) OR
 (SELECT count(DISTINCT r->>'questionId') FROM jsonb_array_elements(p_report->'results') r)<>jsonb_array_length(paper.questions) THEN RAISE EXCEPTION 'Incomplete report';END IF;
 FOR item IN SELECT * FROM jsonb_array_elements(p_report->'results') LOOP
  IF NOT EXISTS(SELECT 1 FROM jsonb_array_elements(paper.questions) q WHERE q->>'id'=item->>'questionId' AND q->>'topicId'=item->>'topicId') THEN RAISE EXCEPTION 'Question mismatch';END IF;
  IF (item->>'answered')::boolean THEN PERFORM record_student_curriculum_attempt(p_student_id,p_id,'china',item->>'topicId',item->>'questionId',(item->>'correct')::boolean,NULL);END IF;
 END LOOP;
 UPDATE school_assessments SET answers=p_answers,report=p_report,status='completed' WHERE id=p_id;
 UPDATE learning_sessions SET status='completed',accuracy_rate=(p_report->>'correct')::numeric/(p_report->>'total')::numeric,
 lesson_payload=lesson_payload||jsonb_build_object('assessmentStats',jsonb_build_object('total',p_report->'total','answered',p_report->'answered','correct',p_report->'correct'))
 WHERE id=p_id AND student_id=p_student_id;
 RETURN p_report;
END $$;
REVOKE ALL ON FUNCTION public.create_school_assessment(uuid,text,jsonb,jsonb),public.submit_school_assessment(uuid,uuid,jsonb,jsonb) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.create_school_assessment(uuid,text,jsonb,jsonb),public.submit_school_assessment(uuid,uuid,jsonb,jsonb) TO service_role;
NOTIFY pgrst,'reload schema';
