import mysql from 'mysql2/promise';

// Create a connection pool. This is more efficient than creating a new connection for every request.
// It reads the connection details from the environment variables.
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  waitForConnections: true,
  connectionLimit: 10, // Adjust as needed
  queueLimit: 0,
});

export default pool;
