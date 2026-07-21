import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["192.168.1.56", "192.168.1.50", "192.168.1.53"],
  turbopack: {
    root: __dirname,
  },
};

export default nextConfig;
