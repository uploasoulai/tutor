import { expect, it } from 'vitest';
import { decideMemberAccess, type MemberAccessInput } from '@/lib/membership/access-policy';
const base: MemberAccessInput = {
  feature: 'ai_tutor',
  plan: 'free',
  active: false,
  verifiedByok: false,
  managedCredits: 0,
  now: 1000,
};
it('always keeps public learning, history and problem feedback open despite expired Pro/zero credits', () => {
  for (const feature of ['public_learning', 'learning_history', 'report_problem'] as const)
    expect(
      decideMemberAccess({
        ...base,
        feature,
        plan: 'pro_managed',
        expiresAt: new Date(0).toISOString(),
      }).allowed,
    ).toBe(true);
});
it('BYOK requires active Pro and a verified own key and never uses managed credits', () => {
  expect(
    decideMemberAccess({ ...base, plan: 'pro_byok', active: true, verifiedByok: true }),
  ).toEqual({ allowed: true, source: 'byok' });
  expect(
    decideMemberAccess({ ...base, plan: 'pro_byok', active: true, managedCredits: 100 }).allowed,
  ).toBe(false);
  expect(decideMemberAccess({ ...base, plan: 'pro_byok', verifiedByok: true }).allowed).toBe(false);
});
it('managed mode requires a configured positive allowance and unexpired membership', () => {
  expect(
    decideMemberAccess({ ...base, plan: 'pro_managed', active: true, managedCredits: null })
      .allowed,
  ).toBe(false);
  expect(
    decideMemberAccess({ ...base, plan: 'pro_managed', active: true, managedCredits: 5 }),
  ).toEqual({ allowed: true, source: 'managed' });
  expect(
    decideMemberAccess({
      ...base,
      plan: 'pro_managed',
      active: true,
      managedCredits: 5,
      expiresAt: 'bad-date',
    }).allowed,
  ).toBe(false);
});
it('keeps the explicit development override separate from production entitlement', () => {
  expect(decideMemberAccess({ ...base, testingOverride: true })).toEqual({
    allowed: true,
    source: 'managed-testing',
  });
  expect(decideMemberAccess(base).allowed).toBe(false);
});
