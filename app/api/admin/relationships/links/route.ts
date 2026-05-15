import {
  createParentStudentLink,
  createTeacherStudentLink,
  deleteParentStudentLink,
  deleteTeacherStudentLink,
} from '@/lib/admin/relationship-links';
import { apiError, apiSuccess } from '@/lib/server/api-response';
import { createClient } from '@/lib/supabase/server';
import { AdminAuthError, assertAdminUser } from '@/lib/admin/auth';

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    await assertAdminUser(user);

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
    if (error instanceof AdminAuthError) {
      return apiError('INVALID_REQUEST', error.status, error.message);
    }

    return apiError(
      'INTERNAL_ERROR',
      500,
      error instanceof Error ? error.message : 'Failed to create relationship link',
    );
  }
}

export async function DELETE(req: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    await assertAdminUser(user);

    const body = (await req.json()) as {
      kind?: 'parent' | 'teacher';
      studentId?: string;
      parentId?: string;
      teacherId?: string;
    };

    if (!body.studentId) {
      return apiError('MISSING_REQUIRED_FIELD', 400, 'studentId is required');
    }

    if (body.kind === 'parent') {
      if (!body.parentId) {
        return apiError('MISSING_REQUIRED_FIELD', 400, 'parentId is required');
      }

      return apiSuccess({
        link: await deleteParentStudentLink({
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
        link: await deleteTeacherStudentLink({
          teacherId: body.teacherId,
          studentId: body.studentId,
        }),
      });
    }

    return apiError('INVALID_REQUEST', 400, 'Unsupported relationship link kind');
  } catch (error) {
    if (error instanceof AdminAuthError) {
      return apiError('INVALID_REQUEST', error.status, error.message);
    }

    return apiError(
      'INTERNAL_ERROR',
      500,
      error instanceof Error ? error.message : 'Failed to delete relationship link',
    );
  }
}
