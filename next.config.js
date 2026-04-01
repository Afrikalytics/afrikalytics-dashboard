const { withSentryConfig } = require("@sentry/nextjs");

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Silence "webpack config without turbopack config" error in Next.js 16.
  // We use --webpack for builds (Sentry SDK doesn't fully support Turbopack yet),
  // but this empty key prevents the error if Turbopack is ever enabled.
  turbopack: {},
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "X-XSS-Protection",
            value: "1; mode=block",
          },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
          {
            key: "Content-Security-Policy",
            value:
              [
                "default-src 'self'",
                // F-C3: 'unsafe-inline' is required for Next.js inline scripts.
                // 'unsafe-eval' is kept only because Next.js dev mode requires it.
                `script-src 'self' 'unsafe-inline' ${process.env.NODE_ENV === "development" ? "'unsafe-eval'" : ""}`.trim(),
                "style-src 'self' 'unsafe-inline'",
                "img-src 'self' data: https:",
                "font-src 'self' data: https://fonts.gstatic.com",
                "connect-src 'self' https://*.up.railway.app https://*.vercel.app https://*.ingest.sentry.io",
                "frame-src https://lookerstudio.google.com https://app.powerbi.com https://public.tableau.com https://datastudio.google.com",
                process.env.NEXT_PUBLIC_SENTRY_DSN
                  ? `report-uri ${process.env.NEXT_PUBLIC_SENTRY_DSN.replace(/^https:\/\/(\w+)@(.+)\/(\d+)$/, "https://$2/api/$3/security/?sentry_key=$1")}`
                  : "",
              ].join("; ") + ";",
          },
          {
            // F-C4: Report-only to detect violations without breaking the page
            key: "Content-Security-Policy-Report-Only",
            value: "script-src 'self'",
          },
        ],
      },
    ];
  },
};

module.exports = withSentryConfig(nextConfig, {
  // Suppresses source map uploading logs during build
  silent: true,

  // Upload a larger set of source maps for prettier stack traces (increases build time)
  widenClientFileUpload: true,

  // Hides source maps from generated client bundles
  hideSourceMaps: true,

  // Automatically tree-shake Sentry logger statements to reduce bundle size
  disableLogger: true,
});
