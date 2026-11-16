import { type NextRequest } from 'next/server';
import { randomUUID } from 'crypto';
import { apiSuccess, apiError, API_ERROR_CODES } from '@/lib/server/api-response';
import {
  buildRequestOrigin,
  isValidClassroomId,
  persistClassroom,
  readClassroom,
} from '@/lib/server/classroom-storage';
import { createLogger } from '@/lib/logger';
import { createClient } from '@/lib/supabase/server';
import { hasAccountRole } from '@/lib/auth/account-role';
import { libraryCourse } from '@/lib/server/course-library';

const log = createLogger('Classroom API');

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  let stageId: string | undefined;
  let sceneCount: number | undefined;
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return apiError('INVALID_REQUEST', 401, 'Authentication required');
    const body = await request.json();
    const { stage, scenes } = body;
    stageId = stage?.id;
    sceneCount = scenes?.length;

    if (!stage || !scenes) {
      return apiError(
        API_ERROR_CODES.MISSING_REQUIRED_FIELD,
        400,
        'Missing required fields: stage, scenes',
      );
    }

    const id = stage.id || randomUUID();
    if (!isValidClassroomId(id)) return apiError('INVALID_REQUEST', 400, 'Invalid classroom id');
    const library = await libraryCourse(id);
    if (library.row)
      return apiError('INVALID_REQUEST', 409, '请保存为新版本，课程库原版本会继续保留');
    const baseUrl = buildRequestOrigin(request);

    const persisted = await persistClassroom(
      { id, stage: { ...stage, id }, scenes },
      baseUrl,
      user.id,
    );

    return apiSuccess({ id: persisted.id, url: persisted.url }, 201);
  } catch (error) {
    log.error(
      `Classroom storage failed [stageId=${stageId ?? 'unknown'}, scenes=${sceneCount ?? 0}]:`,
      error,
    );
    return apiError(
      API_ERROR_CODES.INTERNAL_ERROR,
      500,
      'Failed to store classroom',
      error instanceof Error ? error.message : String(error),
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const id = request.nextUrl.searchParams.get('id');

    if (!id) {
      return apiError(
        API_ERROR_CODES.MISSING_REQUIRED_FIELD,
        400,
        'Missing required parameter: id',
      );
    }

    if (!isValidClassroomId(id)) {
      return apiError(API_ERROR_CODES.INVALID_REQUEST, 400, 'Invalid classroom id');
    }

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return apiError('INVALID_REQUEST', 401, 'Authentication required');

    const review =
      request.nextUrl.searchParams.get('review') === '1' && (await hasAccountRole(user, 'admin'));
    const classroom = await readClassroom(id, user.id, review);
    if (!classroom) {
      return apiError(API_ERROR_CODES.INVALID_REQUEST, 404, 'Classroom not found');
    }

    const response = apiSuccess({ classroom });
    response.headers.set('Cache-Control', 'private, no-store');
    return response;
  } catch (error) {
    log.error(
      `Classroom retrieval failed [id=${request.nextUrl.searchParams.get('id') ?? 'unknown'}]:`,
      error,
    );
    return apiError(
      API_ERROR_CODES.INTERNAL_ERROR,
      500,
      'Failed to retrieve classroom',
      error instanceof Error ? error.message : String(error),
    );
  }
}
