import { redirect } from 'next/navigation';
import { resolveAccountRole } from '@/lib/auth/account-role';
import { createClient } from '@/lib/supabase/server';
import { getChinaTopicDetails } from '@/lib/china-curriculum/catalog';
import { MULTIPLICATION_PILOT } from '@/lib/curriculum/reviewed-lessons';
import { MultiplicationPilot } from '@/components/learning/multiplication-pilot';
export default async function MultiplicationLabPage() {
  const {
    data: { user },
  } = await (await createClient()).auth.getUser();
  if (!user) redirect('/login');
  if ((await resolveAccountRole(user)) !== 'student')
    return <MultiplicationPilot questions={[]} preview />;
  const details = await getChinaTopicDetails(MULTIPLICATION_PILOT.topicId);
  const questions =
    details?.questions
      .filter((q) => MULTIPLICATION_PILOT.questionIds.includes(q.id))
      .map((q) => ({ id: q.id, prompt: q.prompt })) ?? [];
  return <MultiplicationPilot questions={questions} />;
}
