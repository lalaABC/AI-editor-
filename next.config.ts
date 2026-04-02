import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // TEMPLATE ONLY
  turbopack: { root: import.meta.dirname },
  reactCompiler: true,
  experimental: {
    turbopackFileSystemCacheForDev: true,
  },
};

export default nextConfig;
