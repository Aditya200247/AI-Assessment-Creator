import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Turbopack is used in dev (next dev --turbopack) but disabled for production
  // builds on Vercel to avoid PostCSS/Tailwind CSS v4 incompatibility.
  // @react-pdf/renderer loaded client-side only via dynamic import with ssr:false
};

export default nextConfig;

