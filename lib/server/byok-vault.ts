import { createCipheriv, createDecipheriv, createHash, randomBytes } from 'node:crypto';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';

const TABLE = 'learner_ai_credentials';

function encryptionKey() {
  const encoded = process.env.LEARNER_CREDENTIALS_ENCRYPTION_KEY;
  if (!encoded) throw new Error('LEARNER_CREDENTIALS_ENCRYPTION_KEY is required');
  const key = Buffer.from(encoded, 'base64');
  if (key.length !== 32) throw new Error('LEARNER_CREDENTIALS_ENCRYPTION_KEY must be a base64 encoded 32-byte key');
  return key;
}

function admin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SECRET_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error('Supabase server secret is required for learner credentials');
  return createSupabaseClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
}

function encrypt(value: string) {
  const iv = randomBytes(12);
  const cipher = createCipheriv('aes-256-gcm', encryptionKey(), iv);
  const ciphertext = Buffer.concat([cipher.update(value, 'utf8'), cipher.final()]);
  return { ciphertext: ciphertext.toString('base64'), iv: iv.toString('base64'), tag: cipher.getAuthTag().toString('base64') };
}

function decrypt(value: { ciphertext: string; iv: string; tag: string }) {
  const decipher = createDecipheriv('aes-256-gcm', encryptionKey(), Buffer.from(value.iv, 'base64'));
  decipher.setAuthTag(Buffer.from(value.tag, 'base64'));
  return Buffer.concat([decipher.update(Buffer.from(value.ciphertext, 'base64')), decipher.final()]).toString('utf8');
}

export async function saveLearnerCredential(userId: string, providerId: string, apiKey: string) {
  const encrypted = encrypt(apiKey);
  const { error } = await admin().from(TABLE).upsert({
    user_id: userId,
    provider_id: providerId,
    encrypted_key: encrypted.ciphertext,
    encryption_iv: encrypted.iv,
    encryption_tag: encrypted.tag,
    key_fingerprint: createHash('sha256').update(apiKey).digest('hex').slice(0, 12),
    updated_at: new Date().toISOString(),
  }, { onConflict: 'user_id' });
  if (error) throw error;
}

export async function getLearnerCredential(userId: string) {
  // Keep existing Platform AI deployments operational until the operator has
  // provisioned the vault encryption secret. No credential can be read then.
  if (!process.env.LEARNER_CREDENTIALS_ENCRYPTION_KEY) return null;
  const { data, error } = await admin().from(TABLE)
    .select('provider_id, encrypted_key, encryption_iv, encryption_tag, key_fingerprint, verified_at')
    .eq('user_id', userId).maybeSingle();
  if (error) throw error;
  if (!data) return null;
  const apiKey = decrypt({ ciphertext: data.encrypted_key, iv: data.encryption_iv, tag: data.encryption_tag });
  return { providerId: data.provider_id as string, apiKey, fingerprint: data.key_fingerprint as string, verifiedAt: data.verified_at as string | null };
}

export async function getLearnerCredentialStatus(userId: string) {
  const { data, error } = await admin().from(TABLE).select('provider_id, key_fingerprint, verified_at, updated_at').eq('user_id', userId).maybeSingle();
  if (error) throw error;
  return data ? { configured: true, providerId: data.provider_id as string, fingerprint: data.key_fingerprint as string, verifiedAt: data.verified_at as string | null, updatedAt: data.updated_at as string } : { configured: false };
}

export async function deleteLearnerCredential(userId: string) {
  const { error } = await admin().from(TABLE).delete().eq('user_id', userId);
  if (error) throw error;
}

export async function markLearnerCredentialVerified(userId: string) {
  const { error } = await admin().from(TABLE).update({ verified_at: new Date().toISOString() }).eq('user_id', userId);
  if (error) throw error;
}
