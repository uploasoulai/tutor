import {
  GET as launchLearningSpace,
  POST as launchLearningPrompt,
} from '@/app/api/deeptutor/launch/route';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export const GET = launchLearningSpace;
export const POST = launchLearningPrompt;
