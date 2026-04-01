// server.js
// Shared-hosting/Passenger entry point for the production Next.js server.
process.chdir(__dirname);
process.env.NODE_ENV = process.env.NODE_ENV || 'production';
process.env.PORT = process.env.PORT || '3000';
process.env.HOSTNAME = process.env.HOSTNAME || '0.0.0.0';

try {
  require('dotenv').config();
} catch (error) {
  // Ignore dotenv loading issues when the package is unavailable in production.
}

try {
  require('./.next/standalone/server.js');
} catch (error) {
  console.error('Unable to start the production server. Run `npm install` and `npm run build` first.');
  throw error;
}
