import 'server-only';
import { AwsClient } from 'aws4fetch';
import { createHash } from 'node:crypto';
import type { PreparedAsset } from '@/lib/curriculum/prepared-courses';

/** Only the dedicated course bucket. No client-supplied URL/key or public access. */
export async function readR2CourseAsset(asset: PreparedAsset) {
  const account = process.env.COASTALTUTOR_R2_ACCOUNT_ID,
    bucket = process.env.COASTALTUTOR_R2_BUCKET;
  const accessKeyId = process.env.COASTALTUTOR_R2_ACCESS_KEY_ID,
    secretAccessKey = process.env.COASTALTUTOR_R2_SECRET_ACCESS_KEY;
  if (!account || !bucket || !accessKeyId || !secretAccessKey)
    throw new Error('course_media_not_configured');
  if (
    !/^[a-f\d]{32}$/.test(account) ||
    bucket !== 'coastaltutor-course-media' ||
    !/^sha256\/[a-f\d]{64}\.m4a$/.test(asset.key) ||
    asset.bytes > 500000
  )
    throw new Error('course_media_invalid');
  const client = new AwsClient({
    accessKeyId,
    secretAccessKey,
    service: 's3',
    region: 'auto',
    retries: 0,
  });
  const response = await client.fetch(
    `https://${account}.r2.cloudflarestorage.com/${bucket}/${asset.key}`,
    { signal: AbortSignal.timeout(12000) },
  );
  if (!response.ok) throw new Error('course_media_unavailable');
  if (Number(response.headers.get('content-length')) > 500000)
    throw new Error('course_media_integrity_failed');
  const bytes = Buffer.from(await response.arrayBuffer());
  if (
    bytes.length !== asset.bytes ||
    createHash('sha256').update(bytes).digest('hex') !== asset.sha256 ||
    bytes.toString('ascii', 4, 8) !== 'ftyp'
  )
    throw new Error('course_media_integrity_failed');
  return bytes;
}
export function mediaResponse(bytes: Buffer, range: string | null) {
  const headers = {
    'Content-Type': 'audio/mp4',
    'Accept-Ranges': 'bytes',
    'Cache-Control': 'private, no-store',
    'X-Content-Type-Options': 'nosniff',
  };
  if (!range)
    return new Response(new Uint8Array(bytes), {
      headers: { ...headers, 'Content-Length': String(bytes.length) },
    });
  const match = range.match(/^bytes=(\d*)-(\d*)$/);
  if (!match || (!match[1] && !match[2]))
    return new Response(null, {
      status: 416,
      headers: { ...headers, 'Content-Range': `bytes */${bytes.length}` },
    });
  const start = match[1] ? Number(match[1]) : Math.max(0, bytes.length - Number(match[2]));
  const end =
    match[1] && match[2] ? Math.min(bytes.length - 1, Number(match[2])) : bytes.length - 1;
  if (
    !Number.isSafeInteger(start) ||
    !Number.isSafeInteger(end) ||
    start > end ||
    start >= bytes.length
  )
    return new Response(null, {
      status: 416,
      headers: { ...headers, 'Content-Range': `bytes */${bytes.length}` },
    });
  return new Response(new Uint8Array(bytes.subarray(start, end + 1)), {
    status: 206,
    headers: {
      ...headers,
      'Content-Range': `bytes ${start}-${end}/${bytes.length}`,
      'Content-Length': String(end - start + 1),
    },
  });
}
