import { NextRequest } from 'next/server';

import { resolveAccountRole } from '@/lib/auth/account-role';
import {
  CHINA_SUBJECTS,
  chinaGradeLabel,
  chinaTopicSubject,
  type ChinaTopic,
  getChinaDependencies,
  getChinaTopics,
  getChinaTopicDetails,
  getChinaTextbookMappings,
} from '@/lib/china-curriculum/catalog';
import { apiError, apiSuccess } from '@/lib/server/api-response';
import { createSupabaseAdminClient } from '@/lib/supabase/admin';
import { createClient } from '@/lib/supabase/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return apiError('INVALID_REQUEST', 401, 'Authentication required');

    const role = await resolveAccountRole(user);
    if (!['student', 'parent', 'admin'].includes(role)) {
      return apiError('INVALID_REQUEST', 403, 'School learning access is unavailable');
    }

    const params = request.nextUrl.searchParams;
    const topicId = params.get('topicId');
    const editionId = params.get('edition');
    if (topicId) {
      const details = await getChinaTopicDetails(topicId, editionId);
      if (!details) return apiError('INVALID_REQUEST', 404, 'Learning topic not found');
      const { questions, ...topicDetails } = details;
      return apiSuccess({
        ...topicDetails,
        questions: questions.map((question) => ({
          id: question.id,
          topicId: question.topicId,
          difficulty: question.difficulty,
          type: question.type,
          prompt: question.prompt,
          explanation: question.explanation,
          choices: question.choices,
        })),
      });
    }

    const [allTopics, dependencies, mappings] = await Promise.all([
      getChinaTopics(),
      getChinaDependencies(),
      getChinaTextbookMappings(),
    ]);
    const subject = params.get('subject');
    const mapping = editionId ? mappings.find((item) => item.edition === editionId) : undefined;
    if (editionId && !mapping) return apiError('INVALID_REQUEST', 400, 'Textbook route not found');
    if (
      mapping &&
      subject &&
      !mapping.entries.some((entry) => {
        const topic = allTopics.find((candidate) => candidate.id === entry.topicId);
        return topic && chinaTopicSubject(topic) === subject;
      })
    )
      return apiError('INVALID_REQUEST', 400, 'This textbook route is for another subject');
    const grade = Number(params.get('grade'));
    const semester = params.get('semester');
    const search = params.get('q')?.trim().toLocaleLowerCase('zh-CN') ?? '';
    const limit = Math.min(Math.max(Number(params.get('limit')) || 250, 1), 600);

    const topicById = new Map(allTopics.map((topic) => [topic.id, topic]));
    const sourceTopics: (ChinaTopic & { textbookNote?: string })[] = mapping
      ? mapping.entries.flatMap((entry) => {
          const baseTopic = topicById.get(entry.topicId);
          return baseTopic
            ? [
                {
                  ...baseTopic,
                  grade: entry.grade,
                  semester: entry.term,
                  chapter: `${entry.unit}${entry.chapter ? ` · ${entry.chapter}` : ''}`,
                  textbookNote: entry.note,
                },
              ]
            : [];
        })
      : allTopics;
    const filtered = sourceTopics.filter((topic) => {
      if (subject && chinaTopicSubject(topic) !== subject) return false;
      if (Number.isInteger(grade) && grade > 0 && topic.grade !== grade) return false;
      if (semester && topic.semester !== semester) return false;
      if (
        search &&
        !`${topic.name} ${topic.description} ${topic.domain} ${topic.chapter}`
          .toLocaleLowerCase('zh-CN')
          .includes(search)
      ) {
        return false;
      }
      return true;
    });

    const visibleTopics = filtered.slice(0, limit);
    let progressAvailable = false;
    const masteryByTopic = new Map<string, { mastery_level: number; attempts: number }>();
    const lessonProgressByTopic = new Map<
      string,
      { classroomIds: Set<string>; completedClassroomIds: Set<string> }
    >();
    if (role === 'student') {
      const admin = createSupabaseAdminClient();
      const { data: masteryRows, error } = await admin
        .from('student_curriculum_mastery')
        .select('topic_id,mastery_level,attempts')
        .eq('student_id', user.id)
        .eq('curriculum_track', 'china');
      if (!error) {
        progressAvailable = true;
        for (const row of masteryRows ?? []) {
          masteryByTopic.set(row.topic_id, {
            mastery_level: Number(row.mastery_level ?? 0),
            attempts: Number(row.attempts ?? 0),
          });
        }
      }

      const { data: learningSessions } = await admin
        .from('learning_sessions')
        .select('status,lesson_payload')
        .eq('student_id', user.id)
        .order('started_at', { ascending: false })
        .limit(300);
      for (const session of learningSessions ?? []) {
        const payload = session.lesson_payload as {
          curriculumTrack?: string;
          curriculumTopicId?: string;
          classroomId?: string;
        } | null;
        if (
          payload?.curriculumTrack !== 'china' ||
          !payload.curriculumTopicId ||
          !payload.classroomId
        )
          continue;
        const progress = lessonProgressByTopic.get(payload.curriculumTopicId) ?? {
          classroomIds: new Set<string>(),
          completedClassroomIds: new Set<string>(),
        };
        progress.classroomIds.add(payload.classroomId);
        if (session.status === 'completed') progress.completedClassroomIds.add(payload.classroomId);
        lessonProgressByTopic.set(payload.curriculumTopicId, progress);
      }
    }
    const prereqCounts = new Map<string, number>();
    const hardPrerequisites = new Map<string, string[]>();
    for (const edge of dependencies) {
      prereqCounts.set(edge.topicId, (prereqCounts.get(edge.topicId) ?? 0) + 1);
      if (edge.strength === 'hard') {
        const prerequisites = hardPrerequisites.get(edge.topicId) ?? [];
        prerequisites.push(edge.prerequisiteId);
        hardPrerequisites.set(edge.topicId, prerequisites);
      }
    }
    const topicByIdAll = new Map(allTopics.map((topic) => [topic.id, topic]));
    function firstUnmasteredPrerequisite(
      topicId: string,
      visiting = new Set<string>(),
    ): ChinaTopic | null {
      if (visiting.has(topicId)) return null;
      visiting.add(topicId);
      for (const prerequisiteId of hardPrerequisites.get(topicId) ?? []) {
        const unmet = firstUnmasteredPrerequisite(prerequisiteId, visiting);
        if (unmet) return unmet;
      }
      const topic = topicByIdAll.get(topicId);
      if (topic && (masteryByTopic.get(topicId)?.mastery_level ?? 0) < 0.7) return topic;
      return null;
    }
    const recommendedTarget = filtered.find(
      (topic) => (masteryByTopic.get(topic.id)?.mastery_level ?? 0) < 0.8,
    );
    const nextUnmastered = recommendedTarget
      ? (firstUnmasteredPrerequisite(recommendedTarget.id) ?? recommendedTarget)
      : null;

    const subjectCounts = new Map<string, number>();
    const subjectTopics = sourceTopics.filter(
      (topic) => !subject || chinaTopicSubject(topic) === subject,
    );
    for (const topic of allTopics) {
      const key = chinaTopicSubject(topic);
      subjectCounts.set(key, (subjectCounts.get(key) ?? 0) + 1);
    }

    return apiSuccess({
      subjects: Object.entries(CHINA_SUBJECTS).map(([id, label]) => ({
        id,
        label,
        topicCount: subjectCounts.get(id) ?? 0,
      })),
      grades: [...new Set(subjectTopics.map((topic) => topic.grade))]
        .sort((a, b) => a - b)
        .map((value) => ({ value, label: chinaGradeLabel(value, subject) })),
      semesters: [
        ...new Set(
          filtered.filter((topic) => topic.grade === grade).map((topic) => topic.semester),
        ),
      ].sort(),
      textbooks: mappings
        .filter((item) =>
          item.entries.some((entry) => {
            const topic = topicById.get(entry.topicId);
            return topic && (!subject || chinaTopicSubject(topic) === subject);
          }),
        )
        .map((item) => ({
          id: item.edition,
          label: item.label,
          status: item.status,
          topicCount: item.entries.length,
        }))
        .concat([
          { id: 'pep', label: '主图谱教材版本', status: 'current', topicCount: allTopics.length },
        ]),
      topics: visibleTopics.map((topic) => ({
        ...topic,
        subjectId: chinaTopicSubject(topic),
        gradeLabel: chinaGradeLabel(topic.grade, chinaTopicSubject(topic)),
        prerequisiteCount: prereqCounts.get(topic.id) ?? 0,
        textbookNote: topic.textbookNote ?? null,
        progress: masteryByTopic.get(topic.id) ?? null,
        lessons: {
          lessons: lessonProgressByTopic.get(topic.id)?.classroomIds.size ?? 0,
          completedLessons: lessonProgressByTopic.get(topic.id)?.completedClassroomIds.size ?? 0,
        },
      })),
      total: filtered.length,
      recommendedTopic: nextUnmastered
        ? {
            id: nextUnmastered.id,
            name: nextUnmastered.name,
            chapter: nextUnmastered.chapter,
            gradeLabel: chinaGradeLabel(nextUnmastered.grade, chinaTopicSubject(nextUnmastered)),
            editionId: mapping?.entries.some((entry) => entry.topicId === nextUnmastered.id)
              ? mapping.edition
              : 'pep',
            reason:
              nextUnmastered.id === recommendedTarget?.id
                ? '这节课的必备前置知识已掌握，可以开始学习。'
                : '先补好这节课需要的前置知识，再继续当前年级。',
          }
        : null,
      limit,
      truncated: filtered.length > limit,
      progressAvailable,
    });
  } catch (error) {
    return apiError(
      'INTERNAL_ERROR',
      500,
      error instanceof Error ? error.message : 'Could not load the curriculum',
    );
  }
}
