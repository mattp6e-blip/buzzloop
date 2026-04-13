import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' },
    ],
  },
  serverExternalPackages: ['@remotion/renderer', '@remotion/bundler', '@remotion/lambda', '@remotion/lambda/client'],
};

export default nextConfig;
