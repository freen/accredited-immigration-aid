import type { NextConfig } from "next";
import path from 'path';

const nextConfig: NextConfig = {
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      '@libs/core': path.resolve(__dirname, '../../libs/core'),
    };
    return config;
  },
};

export default nextConfig;
