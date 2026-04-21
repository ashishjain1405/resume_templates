import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ['pdfjs-dist', 'canvas', 'googleapis', 'puppeteer-core', '@sparticuz/chromium-min'],
};

export default nextConfig;
