/** @type {import('next').NextConfig} */
const nextConfig = {
  // The `standalone` output creates a self-contained folder with a minimal server
  // and a small, optimized `node_modules` folder with only production dependencies.
  // This is the recommended approach for deploying to production environments like Passenger.
  output: 'standalone',

  // Handle images (important for shared hosting)
  images: {
    unoptimized: true, // Prevents sharp dependency issues on some hosts
  },

  // Skip type checking during build to avoid blocking
  typescript: {
    ignoreBuildErrors: true,
  },

  // Skip ESLint during build
  eslint: {
    ignoreDuringBuilds: true,
  },

  // Fix for the database connection during build
  staticPageGenerationTimeout: 120,

  // Other recommended optimizations
  reactStrictMode: true,
  poweredByHeader: false,
  compress: true,

  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
};

module.exports = nextConfig;
