import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Keep Playwright's local server isolated from a developer's active `.next` dev server.
  distDir: process.env.COASTALTUTOR_NEXT_DIST_DIR || '.next',
  output: process.env.VERCEL ? undefined : 'standalone',
  transpilePackages: ['mathml2omml', 'pptxgenjs'],
  serverExternalPackages: [],
  outputFileTracingIncludes: {
    '/api/china-curriculum': ['./curriculum_data/china/**/*'],
    '/api/china-curriculum/attempt': ['./curriculum_data/china/**/*'],
    '/api/china-curriculum/lesson': ['./curriculum_data/china/**/*'],
    '/school-learning/china/fractions-lab': ['./curriculum_data/china/**/*'],
    '/school-learning/china/multiplication-lab': ['./curriculum_data/china/**/*'],
  },
  experimental: {
    proxyClientMaxBodySize: '200mb',
  },
  async headers() {
    const extraAncestors = process.env.ALLOWED_FRAME_ANCESTORS?.trim();
    const frameAncestors = extraAncestors ? `'self' ${extraAncestors}` : "'self'";

    return [
      {
        source: '/(.*)',
        headers: [
          // X-Frame-Options only supports SAMEORIGIN (no allow-list),
          // so we omit it when custom ancestors are configured.
          ...(!extraAncestors ? [{ key: 'X-Frame-Options', value: 'SAMEORIGIN' }] : []),
          {
            key: 'Content-Security-Policy',
            value: `frame-ancestors ${frameAncestors}`,
          },
        ],
      },
    ];
  },
};

export default nextConfig;
