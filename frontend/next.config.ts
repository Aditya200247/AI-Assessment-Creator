import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // @react-pdf/renderer is loaded client-side only via dynamic import (ssr:false)
  // in /assignment/[id]/page.tsx — no server-side canvas dependency at build time.
};

export default nextConfig;
