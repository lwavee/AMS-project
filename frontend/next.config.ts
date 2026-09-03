import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  devIndicators: false,
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      "pdf-lib": "pdf-lib/dist/pdf-lib.min.js",
      canvas: false,
      encoding: false
    };
    return config;
  },
};

export default nextConfig;
