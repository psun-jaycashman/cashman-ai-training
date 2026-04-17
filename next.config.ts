import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    externalDir: true,
  },
  output: 'standalone',
  basePath: process.env.NEXT_PUBLIC_BASE_PATH || '',
  assetPrefix: process.env.NEXT_PUBLIC_BASE_PATH || '',
  serverExternalPackages: [
    '@zilliz/milvus2-sdk-node',
    '@grpc/grpc-js',
    '@grpc/proto-loader',
    'ssh2',
  ],
  transpilePackages: ['@jazzmind/busibox-app'],
  async redirects() {
    return [];
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            value:
              "frame-src 'self' https://www.youtube-nocookie.com https://www.youtube.com https://player.vimeo.com",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
