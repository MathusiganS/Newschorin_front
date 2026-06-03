import type { NextConfig } from "next";

const backend = process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:4000";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${backend}/api/:path*`,
      },
      {
        source: "/images/:path*",
        destination: `${backend}/images/:path*`,
      },
    ];
  },
};

export default nextConfig;
