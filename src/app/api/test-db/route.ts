import { NextResponse } from 'next/server';
import mysql from 'mysql2/promise';

export const dynamic = 'force-dynamic';

export async function GET() {
  const results: any = {
    timestamp: new Date().toISOString(),
    envCheck: {
      NODE_ENV: process.env.NODE_ENV,
      DB_HOST: process.env.DB_HOST ? 'set' : 'missing',
      DB_USER: process.env.DB_USER ? 'set' : 'missing',
      DB_DATABASE: process.env.DB_DATABASE ? 'set' : 'missing',
      DB_PORT: process.env.DB_PORT ? 'set' : 'missing',
      DB_PASSWORD: process.env.DB_PASSWORD ? 'set' : 'missing',
    },
    connectionTests: []
  };

  // Try different connection configurations
  const configs = [
    {
      name: 'Current env config',
      config: {
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || '',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_DATABASE || '',
        port: Number(process.env.DB_PORT) || 3306,
      }
    },
    {
      name: 'Localhost config',
      config: {
        host: 'localhost',
        user: process.env.DB_USER || 'gledcapi_whiskedelight',
        password: process.env.DB_PASSWORD || 'KJfaAahFykuuL3k692FW',
        database: process.env.DB_DATABASE || 'gledcapi_whiskedelight',
        port: 3306,
      }
    },
    {
      name: '127.0.0.1 config',
      config: {
        host: '127.0.0.1',
        user: process.env.DB_USER || 'gledcapi_whiskedelight',
        password: process.env.DB_PASSWORD || 'KJfaAahFykuuL3k692FW',
        database: process.env.DB_DATABASE || 'gledcapi_whiskedelight',
        port: 3306,
      }
    }
  ];

  for (const test of configs) {
    try {
      const start = Date.now();
      const connection = await mysql.createConnection(test.config);
      const time = Date.now() - start;
      
      // Test a simple query
      const [rows] = await connection.execute('SELECT 1 as test');
      
      results.connectionTests.push({
        name: test.name,
        status: 'success',
        time: `${time}ms`,
        queryResult: rows
      });
      
      await connection.end();
    } catch (error: any) {
      results.connectionTests.push({
        name: test.name,
        status: 'failed',
        error: error.message,
        code: error.code,
        errno: error.errno,
        sqlState: error.sqlState
      });
    }
  }

  return NextResponse.json(results);
}
