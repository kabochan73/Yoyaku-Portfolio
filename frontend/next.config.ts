import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  async rewrites() {
    const apiUrl = process.env.API_URL;
    if (!apiUrl) return [];
    const origin = apiUrl.replace(/\/api$/, "");
    return [
      { source: "/api/:path*", destination: `${apiUrl}/:path*` },
      { source: "/sanctum/:path*", destination: `${origin}/sanctum/:path*` },
    ];
  },
};

export default nextConfig;
