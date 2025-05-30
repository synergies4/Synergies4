/** @type {import('next').NextConfig} */
const nextConfig = {
  // Remove output: 'export' to allow dynamic API routes
  // output: 'export',
  images: {
    unoptimized: true,
  },
  // Ensure API routes are treated as serverless functions
  serverExternalPackages: ['@prisma/client', 'bcryptjs'],
};

module.exports = nextConfig;
