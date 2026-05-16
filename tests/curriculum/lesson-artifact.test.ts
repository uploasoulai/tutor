import { describe, expect, it } from 'vitest';
import {
  attachLessonEngineJob,
  buildLessonEngineRequirement,
  buildLessonPayloadFromMatches,
  buildLessonReuseKey,
  evaluateLessonEngineGenerationQuality,
  mergeLessonEngineJobStatus,
} from '@/lib/curriculum/lesson-artifact';
import { getTeacherPersonaById } from '@/lib/curriculum/teacher-personas';

describe('Grade 2 lesson artifact builder', () => {
  it('builds stable reuse keys from student, grade, subject, and outcome', () => {
    expect(
      buildLessonReuseKey({
        studentId: 'student-1',
        grade: 'Grade 2',
        subject: 'Math',
        outcomeCode: 'MATH-2-04-addition-and-subtraction-to-100',
        title: 'Addition and subtraction to 100',
      }),
    ).toBe('student-1:Grade 2:Math:MATH-2-04-addition-and-subtraction-to-100');
  });

  it('injects Grade 2 BC matches into prompt, slides, and quiz', () => {
    const payload = buildLessonPayloadFromMatches({
      grade: 'Grade 2',
      subject: 'Math',
      title: 'Addition and subtraction to 100',
      outcomeCode: 'MATH-2-04-addition-and-subtraction-to-100',
      matches: [
        {
          id: 'outcome-1',
          subject_id: 'subject-1',
          outcome_code: 'MATH-2-04-addition-and-subtraction-to-100',
          big_idea: null,
          content_knowledge: 'Addition and subtraction to 100',
          elaboration: 'Use personal strategies, place value, and concrete materials.',
          chunk_text: 'Knowledge point plus elaboration',
          grade_level: 2,
          subject_area: 'Math',
          similarity: 0.91,
        },
      ],
    });

    expect(payload.bc_context).toMatchObject({
      grade: 'Grade 2',
      subject: 'Math',
      outcome_code: 'MATH-2-04-addition-and-subtraction-to-100',
      knowledge_point: 'Addition and subtraction to 100',
    });
    expect(payload.teacher).toMatchObject({
      id: 'mira',
      name: 'Mira',
      style: 'Patient coach',
    });
    expect(payload.prompt).toContain('Voyage query-retrieved BC curriculum context');
    expect(payload.prompt).toContain('Instructional blueprint');
    expect(payload.prompt).toContain('Teacher persona');
    expect(payload.prompt).toContain('Use personal strategies');
    expect(payload.blueprint).toMatchObject({
      learningGoal: 'Addition and subtraction to 100',
      gradeBand: 'early-elementary',
    });
    expect(payload.quality).toMatchObject({
      passed: true,
    });
    expect(payload.slides).toHaveLength(3);
    expect(payload.slides[0].visualCue).toContain('ten-frame');
    expect(payload.slides[0].repairMove).toContain('touch or count');
    expect(payload.slides[0].widget).toMatchObject({
      kind: 'ten-frame',
      target: 7,
    });
    expect(payload.slides[1].widget).toMatchObject({
      kind: 'number-line',
      max: 100,
    });
    expect(payload.slides[2].widget).toMatchObject({
      kind: 'place-value-builder',
      target: 73,
    });
    expect(payload.slides[1].interaction).toContain('Tutor highlights');
    expect(payload.quiz.every((item) => item.outcomeCode === payload.bc_context.outcome_code)).toBe(
      true,
    );
    expect(payload.quiz[0]).toMatchObject({
      gameType: 'choice-card',
      correctChoice: 'Draw it',
    });
    expect(payload.quiz[0].choices).toContain('Draw it');
    expect(payload.generator).toMatchObject({
      retrieval: 'voyage-query-pgvector',
      estimatedDurationSeconds: 120,
    });
  });

  it('injects the selected teacher persona into lesson generation', () => {
    const payload = buildLessonPayloadFromMatches({
      grade: 'Grade 2',
      subject: 'Math',
      title: 'Number concepts to 100',
      teacherPersona: getTeacherPersonaById('leo'),
      matches: [],
    });

    expect(payload.teacher).toMatchObject({
      id: 'leo',
      name: 'Leo',
      style: 'Game guide',
      riveState: 'playful',
    });
    expect(payload.prompt).toContain('Leo');
    expect(buildLessonEngineRequirement(payload)).toContain('Game guide');
  });

  it('creates a CoastalTutor requirement from Grade 2 lesson payload', () => {
    const payload = buildLessonPayloadFromMatches({
      grade: 'Grade 2',
      subject: 'Math',
      title: 'Addition and subtraction to 100',
      matches: [
        {
          id: 'outcome-1',
          subject_id: 'subject-1',
          outcome_code: 'MATH-2-04-addition-and-subtraction-to-100',
          big_idea: null,
          content_knowledge: 'Addition and subtraction to 100',
          elaboration: 'Use personal strategies and concrete materials.',
          chunk_text: 'chunk',
          grade_level: 2,
          subject_area: 'Math',
          similarity: 0.91,
        },
      ],
    });

    const requirement = buildLessonEngineRequirement(payload);

    expect(requirement).toContain('CoastalTutor interactive classroom lesson');
    expect(requirement).toContain('Grade: Grade 2');
    expect(requirement).toContain('MATH-2-04-addition-and-subtraction-to-100');
    expect(requirement).toContain('Instructional design blueprint');
    expect(requirement).toContain('Scene blueprint');
    expect(requirement).toContain('Required quiz checks');
    expect(requirement).toContain('active mini-games');
  });

  it('attaches CoastalTutor job metadata without losing the structured lesson', () => {
    const payload = buildLessonPayloadFromMatches({
      grade: 'Grade 2',
      subject: 'Math',
      title: 'Number concepts to 100',
      matches: [],
    });
    const nextPayload = attachLessonEngineJob(payload, {
      jobId: 'job-123',
      status: 'queued',
      pollUrl: 'https://app.example.com/api/generate-classroom/job-123',
      pollIntervalMs: 5000,
      requirement: 'Create a lesson',
      createdAt: '2026-05-14T00:00:00.000Z',
    });

    expect(nextPayload.slides).toHaveLength(3);
    expect(nextPayload.lessonEngine).toMatchObject({
      jobId: 'job-123',
      status: 'queued',
    });
  });

  it('merges succeeded CoastalTutor job result back into lesson payload', () => {
    const payload = attachLessonEngineJob(
      buildLessonPayloadFromMatches({
        grade: 'Grade 2',
        subject: 'Math',
        title: 'Number concepts to 100',
        matches: [],
      }),
      {
        jobId: 'job-123',
        status: 'running',
        pollUrl: 'https://app.example.com/api/generate-classroom/job-123',
        pollIntervalMs: 5000,
        requirement: 'Create a lesson',
        createdAt: '2026-05-14T00:00:00.000Z',
      },
    );

    const nextPayload = mergeLessonEngineJobStatus(payload, {
      id: 'job-123',
      status: 'succeeded',
      step: 'completed',
      progress: 100,
      message: 'done',
      createdAt: '2026-05-14T00:00:00.000Z',
      updatedAt: '2026-05-14T00:01:00.000Z',
      inputSummary: {
        requirementPreview: 'Create a lesson',
        hasPdf: false,
        pdfTextLength: 0,
        pdfImageCount: 0,
      },
      scenesGenerated: 3,
      result: {
        classroomId: 'classroom-1',
        url: 'https://app.example.com/classroom/classroom-1',
        scenesCount: 3,
      },
    });

    expect(nextPayload.lessonEngine).toMatchObject({
      status: 'succeeded',
      classroomId: 'classroom-1',
      classroomUrl: 'https://app.example.com/classroom/classroom-1',
    });
    expect(nextPayload.quality.lessonEngine).toMatchObject({
      status: 'succeeded',
      scenesGenerated: 3,
      expectedScenes: 4,
      score: 93,
      passed: true,
      classroomUrl: 'https://app.example.com/classroom/classroom-1',
    });
    expect(nextPayload.slides).toHaveLength(3);
  });

  it('merges failed CoastalTutor job status without removing lesson content', () => {
    const payload = attachLessonEngineJob(
      buildLessonPayloadFromMatches({
        grade: 'Grade 2',
        subject: 'Math',
        title: 'Number concepts to 100',
        matches: [],
      }),
      {
        jobId: 'job-123',
        status: 'running',
        pollUrl: 'https://app.example.com/api/generate-classroom/job-123',
        pollIntervalMs: 5000,
        requirement: 'Create a lesson',
        createdAt: '2026-05-14T00:00:00.000Z',
      },
    );

    const nextPayload = mergeLessonEngineJobStatus(payload, {
      id: 'job-123',
      status: 'failed',
      step: 'failed',
      progress: 20,
      message: 'failed',
      createdAt: '2026-05-14T00:00:00.000Z',
      updatedAt: '2026-05-14T00:01:00.000Z',
      inputSummary: {
        requirementPreview: 'Create a lesson',
        hasPdf: false,
        pdfTextLength: 0,
        pdfImageCount: 0,
      },
      scenesGenerated: 0,
      error: 'model unavailable',
    });

    expect(nextPayload.lessonEngine?.status).toBe('failed');
    expect(nextPayload.quality.lessonEngine).toMatchObject({
      status: 'failed',
      scenesGenerated: 0,
      passed: false,
    });
    expect(nextPayload.quality.lessonEngine?.revisionNotes.length).toBeGreaterThan(0);
    expect(nextPayload.quiz).toHaveLength(3);
  });

  it('scores partial CoastalTutor generations below the ready threshold', () => {
    const payload = buildLessonPayloadFromMatches({
      grade: 'Grade 2',
      subject: 'Math',
      title: 'Number concepts to 100',
      matches: [],
    });

    const quality = evaluateLessonEngineGenerationQuality(payload, {
      id: 'job-123',
      status: 'running',
      step: 'generating_scenes',
      progress: 55,
      message: 'Generating',
      createdAt: '2026-05-14T00:00:00.000Z',
      updatedAt: '2026-05-14T00:01:00.000Z',
      inputSummary: {
        requirementPreview: 'Create a lesson',
        hasPdf: false,
        pdfTextLength: 0,
        pdfImageCount: 0,
      },
      scenesGenerated: 2,
      totalScenes: 4,
    });

    expect(quality.passed).toBe(false);
    expect(quality.score).toBeLessThan(85);
    expect(quality.revisionNotes).toContain('Generated 2/4 expected scenes.');
  });
});
