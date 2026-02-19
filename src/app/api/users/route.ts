import pool from '@/lib/db';
import { NextResponse } from 'next/server';
import { RowDataPacket } from 'mysql2';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const [rows] = await pool.query<RowDataPacket[]>('SELECT id, name, email, role FROM users');
    return NextResponse.json(rows);
  } catch (error) {
    console.error("Caught error in GET /api/users:", error);
    return NextResponse.json({ error: 'Database query failed' }, { status: 500 });
  }
}
