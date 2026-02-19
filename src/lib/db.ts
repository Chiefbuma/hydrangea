// lib/db.ts
import mysql from 'mysql2/promise';

// In cPanel/Passenger, environment variables are already set by the hosting panel
// Only log in development to avoid cluttering production logs
if (process.env.NODE_ENV !== 'production') {
  console.log('🔧 DB Config Check:', {
    NODE_ENV: process.env.NODE_ENV,
    DB_HOST: process.env.DB_HOST ? '✅ Set' : '❌ Missing',
    DB_USER: process.env.DB_USER ? '✅ Set' : '❌ Missing',
    DB_DATABASE: process.env.DB_DATABASE ? '✅ Set' : '❌ Missing',
    DB_PORT: process.env.DB_PORT ? '✅ Set' : '❌ Missing',
    DB_PASSWORD: process.env.DB_PASSWORD ? '✅ Set' : '❌ Missing',
  });
}

// Validate required environment variables
const requiredEnvVars = ['DB_HOST', 'DB_USER', 'DB_DATABASE', 'DB_PASSWORD', 'DB_PORT'];
const missingEnvVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingEnvVars.length > 0) {
  console.error('❌ Missing required environment variables:', missingEnvVars.join(', '));
}

// Create connection pool configuration
const poolConfig = {
  host: process.env.DB_HOST || 'localhost', // Try 'localhost' instead of '127.0.0.1'
  user: process.env.DB_USER || '',
  database: process.env.DB_DATABASE || '',
  password: process.env.DB_PASSWORD || '',
  port: Number(process.env.DB_PORT) || 3306,
  waitForConnections: true,
  connectionLimit: 5, // Reduced for cPanel
  queueLimit: 0,
  connectTimeout: 10000,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0,
};

// Create the pool (but don't test connection immediately)
let pool: mysql.Pool;

try {
  pool = mysql.createPool(poolConfig);
  console.log('✅ Database pool created');
} catch (err) {
  console.error('❌ Failed to create database pool:', err);
  // Create a dummy pool that will throw meaningful errors
  pool = mysql.createPool({
    host: 'localhost',
    user: 'dummy',
    password: 'dummy',
    database: 'dummy',
  });
}

// Export a wrapper that tests connection on each request
export const db = {
  async execute(query: string, params?: any[]) {
    try {
      const [rows] = await pool.execute(query, params);
      return rows;
    } catch (error: any) {
      console.error('Database query error:', {
        message: error.message,
        code: error.code,
        errno: error.errno,
        sqlState: error.sqlState,
      });
      throw new Error(`Database error: ${error.message}`);
    }
  },

  async getConnection() {
    try {
      const connection = await pool.getConnection();
      return connection;
    } catch (error: any) {
      console.error('Failed to get database connection:', error.message);
      throw error;
    }
  }
};

// Optional: Test connection but don't block
if (process.env.NODE_ENV !== 'production') {
  (async () => {
    try {
      const conn = await pool.getConnection();
      console.log('✅ Database connection test successful');
      conn.release();
    } catch (err: any) {
      console.error('❌ Database connection test failed:', err.message);
    }
  })();
}
