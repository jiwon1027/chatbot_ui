import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 운영 환경 최적화
  output: 'standalone',
  compress: true,
  
  // 내부망 환경 최적화 설정
  productionBrowserSourceMaps: false,
  
  // SWC 완전 비활성화 (내부망 환경)
  swcMinify: false,
  experimental: {
    esmExternals: 'loose',
    forceSwcTransforms: false,
  },
  
  // 폐쇄망 환경을 위한 설정
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
  },
  
  // 보안 헤더 설정
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
