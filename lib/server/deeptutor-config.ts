import 'server-only';

export interface DeepTutorConfig {
  enabled: boolean;
  publicUrl: string | null;
  internalUrl: string | null;
  hostSsoSecret: string | null;
  adminEmail: string | null;
}

function readBoolean(value: string | undefined, name: string): boolean {
  if (value == null || value.trim() === '') return false;

  const normalized = value.trim().toLowerCase();
  if (normalized === 'true') return true;
  if (normalized === 'false') return false;

  throw new Error(`${name} must be either "true" or "false"`);
}

function readOrigin(value: string | undefined, name: string): string | null {
  const raw = value?.trim();
  if (!raw) return null;

  let url: URL;
  try {
    url = new URL(raw);
  } catch {
    throw new Error(`${name} must be a valid absolute URL`);
  }

  if (!['http:', 'https:'].includes(url.protocol)) {
    throw new Error(`${name} must use HTTP or HTTPS`);
  }
  if (url.username || url.password || url.search || url.hash) {
    throw new Error(`${name} must not contain credentials, a query, or a fragment`);
  }

  return url.toString().replace(/\/$/, '');
}

/** Server-only connection settings; never pass the shared secret to client code. */
export function getDeepTutorConfig(env: NodeJS.ProcessEnv = process.env): DeepTutorConfig {
  const enabled = readBoolean(env.DEEPTUTOR_ENABLED, 'DEEPTUTOR_ENABLED');
  const publicUrl = readOrigin(env.DEEPTUTOR_PUBLIC_URL, 'DEEPTUTOR_PUBLIC_URL');
  const internalUrl = readOrigin(env.DEEPTUTOR_INTERNAL_URL, 'DEEPTUTOR_INTERNAL_URL');
  const hostSsoSecret = env.DEEPTUTOR_HOST_SSO_SECRET?.trim() || null;
  const adminEmail = env.DEEPTUTOR_ADMIN_EMAIL?.trim().toLowerCase() || null;

  if (adminEmail && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(adminEmail)) {
    throw new Error('DEEPTUTOR_ADMIN_EMAIL must be a valid email address');
  }

  if (enabled && (!publicUrl || !internalUrl)) {
    throw new Error(
      'DEEPTUTOR_PUBLIC_URL and DEEPTUTOR_INTERNAL_URL are required when DeepTutor is enabled',
    );
  }

  if (enabled && (!hostSsoSecret || Buffer.byteLength(hostSsoSecret, 'utf8') < 32)) {
    throw new Error(
      'DEEPTUTOR_HOST_SSO_SECRET must contain at least 32 bytes when DeepTutor is enabled',
    );
  }

  return { enabled, publicUrl, internalUrl, hostSsoSecret, adminEmail };
}
