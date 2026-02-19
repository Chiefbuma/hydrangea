import pool from '@/lib/db';
import { NextResponse } from 'next/server';
import { ResultSetHeader, RowDataPacket } from 'mysql2';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const [rows] = await pool.query<RowDataPacket[]>('SELECT id, name FROM emergency_technicians ORDER BY name ASC');
    return NextResponse.json(rows);
  } catch (error) {
    console.error("Caught error in GET /api/emergency-technicians:", error);
    return NextResponse.json({ error: 'Database query failed' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { name } = await req.json();
    const [result] = await pool.execute<ResultSetHeader>('INSERT INTO emergency_technicians (name) VALUES (?)', [name]);
    const insertId = result.insertId;
    const [rows] = await pool.query<RowDataPacket[]>('SELECT id, name FROM emergency_technicians WHERE id = ?', [insertId]);
    return NextResponse.json({ message: 'Technician created successfully', technician: rows[0] }, { status: 201 });
  } catch (error) {
    console.error("Caught error in POST /api/emergency-technicians:", error);
    return NextResponse.json({ error: 'Database query failed' }, { status: 500 });
  }
}
