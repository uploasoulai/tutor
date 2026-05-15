import { describe, expect, it } from 'vitest';
import {
  attachOpenMAICJob,
  buildOpenMAICRequirement,
  buildLessonPayloadFromMatches,
  buildLessonReuseKey,
} from '@/lib/curriculum/lesson-artifact';

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
    expect(payload.prompt).toContain('Voyage query-retrieved BC curriculum context');
    expect(payload.prompt).toContain('Use personal strategies');
    expect(payload.slides).toHaveLength(3);
    expect(payload.quiz.every((item) => item.outcomeCode === payload.bc_context.outcome_code)).toBe(
      true,
    );
    expect(payload.generator).toMatchObject({
      retrieval: 'voyage-query-pgvector',
      estimatedDurationSeconds: 120,
    });
  });

  it('creates an OpenMAIC requirement from Grade 2 lesson payload', () => {
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

    const requirement = buildOpenMAICRequirement(payload);

    expect(requirement).toContain('OpenMAIC interactive classroom lesson');
    expect(requirement).toContain('Grade: Grade 2');
    expect(requirement).toContain('MATH-2-04-addition-and-subtraction-to-100');
    expect(requirement).toContain('Required quiz checks');
  });

  it('attaches OpenMAIC job metadata without losing the structured lesson', () => {
    const payload = buildLessonPayloadFromMatches({
      grade: 'Grade 2',
      subject: 'Math',
      title: 'Number concepts to 100',
      matches: [],
    });
    const nextPayload = attachOpenMAICJob(payload, {
      jobId: 'job-123',
      status: 'queued',
      pollUrl: 'https://app.example.com/api/generate-classroom/job-123',
      pollIntervalMs: 5000,
      requirement: 'Create a lesson',
      createdAt: '2026-05-14T00:00:00.000Z',
    });

    expect(nextPayload.slides).toHaveLength(3);
    expect(nextPayload.openmaic).toMatchObject({
      jobId: 'job-123',
      status: 'queued',
    });
  });
});
