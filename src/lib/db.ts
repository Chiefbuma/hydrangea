import mysql from 'mysql2/promise';

console.log('--- DATABASE MODULE LOADED ---');
console.log(`Timestamp: ${new Date().toISOString()}`);
console.log('Attempting to create database connection pool with env vars:');
console.log({
  host: process.env.DB_HOST ? 'SET' : 'NOT SET',
  user: process.env.DB_USER ? 'SET' : 'NOT SET',
  database: process.env.DB_DATABASE ? 'SET' : 'NOT SET',
  password: process.env.DB_PASSWORD ? 'SET' : 'NOT SET',
  port: process.env.DB_PORT ? `SET (${process.env.DB_PORT})` : 'NOT SET',
});

// Create a connection pool. This is more efficient than creating a new connection for every request.
// It reads the connection details from the environment variables.
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  port: Number(process.env.DB_PORT) || 3306,
  waitForConnections: true,
  connectionLimit: 10, // Adjust as needed
  queueLimit: 0,
});

console.log('--- DATABASE POOL CREATED (may not be connected yet) ---');

export default pool;
