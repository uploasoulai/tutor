/** Shared decision contract for the later paid rollout. Not activated as a partial paywall. */
export type MembershipPlan = 'free' | 'pro_byok' | 'pro_managed';
export type PaidFeature = 'ai_tutor' | 'personalized_course' | 'interactive_classroom';
export type MemberAccessInput = {
  feature: PaidFeature | 'public_learning' | 'learning_history' | 'report_problem';
  plan: MembershipPlan;
  active: boolean;
  expiresAt?: string | null;
  verifiedByok: boolean;
  managedCredits: number | null;
  testingOverride?: boolean;
  now?: number;
};
export function decideMemberAccess(input: MemberAccessInput) {
  if (['public_learning', 'learning_history', 'report_problem'].includes(input.feature))
    return { allowed: true, source: 'free' as const };
  if (input.testingOverride)
    return {
      allowed: true,
      source: input.verifiedByok ? ('byok' as const) : ('managed-testing' as const),
    };
  const expiry = input.expiresAt ? Date.parse(input.expiresAt) : null;
  if (
    !input.active ||
    input.plan === 'free' ||
    (expiry !== null && (!Number.isFinite(expiry) || expiry <= (input.now ?? Date.now())))
  )
    return { allowed: false, reason: 'pro_required' as const };
  if (input.plan === 'pro_byok')
    return input.verifiedByok
      ? { allowed: true, source: 'byok' as const }
      : { allowed: false, reason: 'verified_key_required' as const };
  if (input.managedCredits === null || !Number.isFinite(input.managedCredits))
    return { allowed: false, reason: 'allowance_not_configured' as const };
  return input.managedCredits > 0
    ? { allowed: true, source: 'managed' as const }
    : { allowed: false, reason: 'managed_credits_exhausted' as const };
}
