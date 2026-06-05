import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  // Pin workspace root to frontend dir — prevents the "multiple lockfiles"
  // warning when Vercel (or local builds) detect the monorepo root lockfile.
  turbopack: {
    root: path.resolve(__dirname),
  },
  // @react-pdf/renderer is loaded client-side only via dynamic import (ssr:false)
  // in /assignment/[id]/page.tsx — no server-side canvas dependency at build time.
};

export default nextConfig;

