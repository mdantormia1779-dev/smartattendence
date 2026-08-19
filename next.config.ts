import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**', // এটি যেকোনো ওয়েবসাইটের ইমেজ লোড করতে দেবে
      },
      {
        protocol: 'http',
        hostname: '**',
      },
    ],
  },
};

export default nextConfig;