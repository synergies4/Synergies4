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
};

module.exports = nextConfig;
