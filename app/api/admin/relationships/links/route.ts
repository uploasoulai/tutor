import { createParentStudentLink, createTeacherStudentLink } from '@/lib/admin/relationship-links';
import { apiError, apiSuccess } from '@/lib/server/api-response';
import { createClient } from '@/lib/supabase/server';

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return apiError('INVALID_REQUEST', 401, 'Authentication required');
    }
    if (user.user_metadata?.role !== 'admin') {
      return apiError('INVALID_REQUEST', 403, 'Admin account required');
    }

    const body = (await req.json()) as {
      kind?: 'parent' | 'teacher';
      studentId?: string;
      parentId?: string;
      teacherId?: string;
      subjects?: string[];
    };

    if (!body.studentId) {
      return apiError('MISSING_REQUIRED_FIELD', 400, 'studentId is required');
    }

    if (body.kind === 'parent') {
      if (!body.parentId) {
        return apiError('MISSING_REQUIRED_FIELD', 400, 'parentId is required');
      }

      return apiSuccess({
        link: await createParentStudentLink({
          parentId: body.parentId,
          studentId: body.studentId,
        }),
      });
    }

    if (body.kind === 'teacher') {
      if (!body.teacherId) {
        return apiError('MISSING_REQUIRED_FIELD', 400, 'teacherId is required');
      }

      return apiSuccess({
        link: await createTeacherStudentLink({
          teacherId: body.teacherId,
          studentId: body.studentId,
          subjects: body.subjects,
        }),
      });
    }

    return apiError('INVALID_REQUEST', 400, 'Unsupported relationship link kind');
  } catch (error) {
    return apiError(
      'INTERNAL_ERROR',
      500,
      error instanceof Error ? error.message : 'Failed to create relationship link',
    );
  }
}
