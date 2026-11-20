import path from "node:path";
import type { NextConfig } from "next";

// The site builds Parabola straight from this repo (one folder up, see
// tsconfig.json's paths), so every push to main shows the latest Parabola.
const repoRoot = path.join(__dirname, "..");

const nextConfig: NextConfig = {
  turbopack: { root: repoRoot },
  outputFileTracingRoot: repoRoot,
  async redirects() {
    return [
      // The site opens on the showcase's first page.
      { source: "/", destination: "/parabola/intro", permanent: false },
      { source: "/parabola", destination: "/parabola/intro", permanent: false },
    ];
  },
};

export default nextConfig;
