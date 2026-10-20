import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@lumine/domain"],
  output: "export",
  reactStrictMode: true,
  poweredByHeader: false,
  compress: true,
  images: { unoptimized: true },
  compiler: { removeConsole: process.env.NODE_ENV === "production" },
};

export default nextConfig;
