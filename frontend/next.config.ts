import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Turbopack is default in Next.js 16
  // @react-pdf/renderer loaded client-side only via dynamic import with ssr:false
  turbopack: {},
};

export default nextConfig;

