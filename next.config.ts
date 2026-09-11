import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Keep the long-lived developer server isolated from production/E2E builds.
  distDir: process.env.NODE_ENV === "development" ? ".next-dev" : ".next",
  // Sharp loads its platform binary and libvips dynamically. Keep both in the
  // media function bundle, including when Next uses a different Sharp version.
  outputFileTracingIncludes: {
    "/api/marketing/media": ["./node_modules/@img/sharp-*/**/*"],
  },
};

export default nextConfig;
