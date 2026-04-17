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
            // Allow embedding any HTTPS video source. We explicitly support
            // YouTube, Vimeo, and arbitrary "other" URLs (Descript, Loom, etc.)
            // via the admin UI, so restricting frame-src by host would block
            // legitimate admin-added content. Admins are trusted to pick sources.
            key: 'Content-Security-Policy',
            value: "frame-src 'self' https:",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
