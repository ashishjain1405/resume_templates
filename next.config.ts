import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ['pdfjs-dist', 'canvas', 'googleapis'],
};

export default nextConfig;
