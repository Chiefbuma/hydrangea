import pool from '@/lib/db';
import { NextResponse } from 'next/server';
import { ResultSetHeader, RowDataPacket } from 'mysql2';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const [rows] = await pool.query<RowDataPacket[]>('SELECT id, name FROM drivers ORDER BY name ASC');
    return NextResponse.json(rows);
  } catch (error) {
    console.error("Caught error in GET /api/drivers:", error);
    return NextResponse.json({ error: 'Database query failed' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { name } = await req.json();
    const [result] = await pool.execute<ResultSetHeader>('INSERT INTO drivers (name) VALUES (?)', [name]);
    const insertId = result.insertId;
    const [rows] = await pool.query<RowDataPacket[]>('SELECT id, name FROM drivers WHERE id = ?', [insertId]);
    return NextResponse.json({ message: 'Driver created successfully', driver: rows[0] }, { status: 201 });
  } catch (error) {
    console.error("Caught error in POST /api/drivers:", error);
    return NextResponse.json({ error: 'Database query failed' }, { status: 500 });
  }
}
