import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Required for Capacitor APK — generates static HTML in out/
  output: "export",
  images: {
    unoptimized: true,
  },
  // Allow local network IP addresses to fetch Next.js JS chunks on mobile devices without port numbers
  allowedDevOrigins: [
    "10.95.107.202",
    "10.91.70.202",
    "localhost",
    "127.0.0.1",
    "0.0.0.0",
  ],
};

export default nextConfig;
