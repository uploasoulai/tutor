import { redirect } from 'next/navigation';
import { resolveAccountRole } from '@/lib/auth/account-role';
import { createClient } from '@/lib/supabase/server';
import { getChinaTopicDetails } from '@/lib/china-curriculum/catalog';
import { FRACTIONS_HYBRID } from '@/lib/curriculum/hybrid-fractions';
import { HybridFractionsLesson } from '@/components/learning/hybrid-fractions-lesson';
export default async function FractionsLabPage() {
  const {
    data: { user },
  } = await (await createClient()).auth.getUser();
  if (!user) redirect('/login');
  if ((await resolveAccountRole(user)) !== 'student') redirect('/');
  const details = await getChinaTopicDetails(FRACTIONS_HYBRID.topicId);
  const questions =
    details?.questions
      .filter((q) => (FRACTIONS_HYBRID.questionIds as readonly string[]).includes(q.id))
      .map((q) => ({ id: q.id, prompt: q.prompt })) ?? [];
  return <HybridFractionsLesson questions={questions} />;
}
