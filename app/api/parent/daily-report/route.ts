import { NextRequest } from 'next/server';
import { generateParentDailyReport } from '@/lib/reports/parent-daily-report';
import { apiError, apiSuccess } from '@/lib/server/api-response';
import { createSupabaseAdminClient } from '@/lib/supabase/admin';
import { createClient } from '@/lib/supabase/server';

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return apiError('INVALID_REQUEST', 401, 'Authentication required');
    }
    if (user.user_metadata?.role && user.user_metadata.role !== 'parent') {
      return apiError('INVALID_REQUEST', 403, 'Parent account required');
    }

    const body = (await req.json().catch(() => ({}))) as {
      studentId?: string;
      date?: string;
    };
    const studentId = body.studentId ?? (await findFirstLinkedStudent(user.id));

    if (!studentId) {
      return apiError('INVALID_REQUEST', 404, 'No linked student found for this parent');
    }

    const report = await generateParentDailyReport({
      parentId: user.id,
      studentId,
      date: body.date ? new Date(body.date) : new Date(),
    });

    return apiSuccess({ report });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to generate daily report';
    return apiError('INTERNAL_ERROR', 500, message);
  }
}

async function findFirstLinkedStudent(parentId: string) {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from('parent_student_links')
    .select('student_id')
    .eq('parent_id', parentId)
    .limit(1)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return data?.student_id as string | undefined;
}
