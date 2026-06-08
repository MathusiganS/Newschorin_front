import type { NextConfig } from "next";

const backend = (
  process.env.BACKEND_URL ||
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  (process.env.NODE_ENV === "development" ? "http://127.0.0.1:4000" : "")
).replace(/\/+$/, "");

const nextConfig: NextConfig = {
  async rewrites() {
    if (!backend) return [];

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
