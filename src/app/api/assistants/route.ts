import pool from '@/lib/db';
import { NextResponse } from 'next/server';
import { ResultSetHeader, RowDataPacket } from 'mysql2';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const [rows] = await pool.query<RowDataPacket[]>('SELECT id, name FROM assistants ORDER BY name ASC');
    return NextResponse.json(rows);
  } catch (error) {
    console.error('Caught error in GET /api/assistants:', error);
    return NextResponse.json({ error: 'Database query failed' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { name } = await req.json();
    const [result] = await pool.execute<ResultSetHeader>('INSERT INTO assistants (name) VALUES (?)', [name]);
    const insertId = result.insertId;
    const [rows] = await pool.query<RowDataPacket[]>('SELECT id, name FROM assistants WHERE id = ?', [insertId]);
    return NextResponse.json({ message: 'Assistant created successfully', assistant: rows[0] }, { status: 201 });
  } catch (error) {
    console.error('Caught error in POST /api/assistants:', error);
    return NextResponse.json({ error: 'Database query failed' }, { status: 500 });
  }
}
