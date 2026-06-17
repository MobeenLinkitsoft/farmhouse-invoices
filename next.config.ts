import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  // 1. Configuration for Turbopack (used during 'npm run dev')
  turbopack: {
    resolveAlias: {
      html2canvas: "html2canvas-pro",
    },
  },
  
  // 2. Configuration for Webpack (used during 'npm run build')
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      html2canvas: path.resolve(process.cwd(), "node_modules/html2canvas-pro"),
    };
    return config;
  },
};

export default nextConfig;