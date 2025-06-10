/** @type {import('next').NextConfig} */
// Updated with AI assistance features - Force deployment trigger
const nextConfig = {
  // Remove output: 'export' to allow dynamic API routes
  // output: 'export',
  images: {
    unoptimized: true,
    domains: ['images.unsplash.com', 'via.placeholder.com']
  },
  // Ensure API routes are treated as serverless functions
  serverExternalPackages: ['@prisma/client', 'bcryptjs'],
  webpack: (config, { dev, isServer }) => {
    // Add rule for font files
    config.module.rules.push({
      test: /\.(woff|woff2|eot|ttf|otf)$/i,
      type: 'asset/resource',
      generator: {
        filename: 'static/fonts/[hash][ext][query]',
      },
    });

    return config;
  },
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: true,
  },
  experimental: {
    serverComponentsExternalPackages: ['@react95/core'],
  },
};

module.exports = nextConfig;
