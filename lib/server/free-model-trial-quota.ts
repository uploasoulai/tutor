import { isCoastalTutorGenerationSession } from '@/lib/generation/model-routing';

type TrialRecord = {
  sessions: Set<string>;
  updatedAt: number;
};

const trialRecords = new Map<string, TrialRecord>();
const ONE_DAY_MS = 24 * 60 * 60 * 1000;

function readBooleanEnv(name: string) {
  const value = process.env[name]?.trim().toLowerCase();
  return value === '1' || value === 'true' || value === 'yes' || value === 'on';
}

function readTrialLimit() {
  const raw = process.env.COASTALTUTOR_FREE_MODEL_TRIAL_LIMIT;
  if (raw == null || raw.trim() === '') return 2;

  const parsed = Number.parseInt(raw, 10);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : 2;
}

function cleanupExpiredRecords(now: number) {
  for (const [clientId, record] of trialRecords) {
    if (now - record.updatedAt > ONE_DAY_MS) {
      trialRecords.delete(clientId);
    }
  }
}

export function canUseCoastalTutorFreeModelTrial({
  sessionId,
  trialClientId,
}: {
  sessionId?: string | null;
  trialClientId?: string | null;
}) {
  if (!isCoastalTutorGenerationSession(sessionId)) return false;
  if (!trialClientId) return false;
  if (
    process.env.COASTALTUTOR_FREE_MODEL_TRIALS_ENABLED != null &&
    !readBooleanEnv('COASTALTUTOR_FREE_MODEL_TRIALS_ENABLED')
  ) {
    return false;
  }

  const limit = readTrialLimit();
  if (limit <= 0) return false;

  const now = Date.now();
  cleanupExpiredRecords(now);

  const record = trialRecords.get(trialClientId) ?? {
    sessions: new Set<string>(),
    updatedAt: now,
  };
  const normalizedSessionId = String(sessionId);
  const alreadyAllowed = record.sessions.has(normalizedSessionId);

  if (!alreadyAllowed && record.sessions.size >= limit) return false;

  record.sessions.add(normalizedSessionId);
  record.updatedAt = now;
  trialRecords.set(trialClientId, record);
  return true;
}

export function getCoastalTutorFreeModelTrialLimit() {
  return readTrialLimit();
}
