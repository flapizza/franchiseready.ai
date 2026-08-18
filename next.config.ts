import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Keep the long-lived developer server isolated from production/E2E builds.
  distDir: process.env.NODE_ENV === "development" ? ".next-dev" : ".next",
};

export default nextConfig;
