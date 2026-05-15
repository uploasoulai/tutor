const appUrl = process.env.APP_BASE_URL;
const keepaliveSecret = process.env.KEEPALIVE_SECRET;

if (!appUrl || !keepaliveSecret) {
  console.error('APP_BASE_URL and KEEPALIVE_SECRET must be configured as GitHub Actions secrets.');
  process.exit(1);
}

const url = new URL('/api/supabase/keepalive', appUrl);
const response = await fetch(url, {
  headers: {
    Authorization: `Bearer ${keepaliveSecret}`,
  },
});

const text = await response.text();

if (!response.ok) {
  console.error(`Keepalive failed with ${response.status}: ${text}`);
  process.exit(1);
}

console.log(`Keepalive ok: ${text}`);
