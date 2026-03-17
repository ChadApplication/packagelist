import type { NextConfig } from "next";
import { execSync } from "child_process";

const backendPort = process.env.NEXT_PUBLIC_BACKEND_PORT || "8020";

// Auto-generate version from git
let gitVersion = "dev";
try {
  gitVersion = execSync("git describe --tags --always 2>/dev/null || echo dev").toString().trim();
} catch { /* ignore */ }

const nextConfig: NextConfig = {
  env: {
    NEXT_PUBLIC_VERSION: gitVersion,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  async rewrites() {
    console.log(`[next.config] Proxying /api/* → http://127.0.0.1:${backendPort}/api/*`);
    return [
      {
        source: "/api/:path*",
        destination: `http://127.0.0.1:${backendPort}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
