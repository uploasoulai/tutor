const appUrl = process.env.APP_BASE_URL;
const cronSecret = process.env.PARENT_REPORT_CRON_SECRET;
const reportDate = process.env.PARENT_REPORT_DATE;

if (!appUrl || !cronSecret) {
  console.error(
    'APP_BASE_URL and PARENT_REPORT_CRON_SECRET must be configured as GitHub Actions secrets.',
  );
  process.exit(1);
}

const url = new URL('/api/cron/parent-daily-reports', appUrl);
if (reportDate) {
  url.searchParams.set('date', reportDate);
}

const response = await fetch(url, {
  headers: {
    Authorization: `Bearer ${cronSecret}`,
  },
});

const text = await response.text();

if (!response.ok) {
  console.error(`Parent daily report generation failed with ${response.status}: ${text}`);
  process.exit(1);
}

console.log(`Parent daily reports ok: ${text}`);
