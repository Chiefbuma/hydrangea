/**
 * This file ensures that the TypeScript configuration (`next.config.ts`) is used
 * by the Next.js build process, providing a single source of truth for all settings.
 * It imports the configuration from `next.config.ts` and exports it for consumption.
 * @type {import('next').NextConfig}
 */
const nextConfig = require('./next.config.ts').default;

module.exports = nextConfig;
