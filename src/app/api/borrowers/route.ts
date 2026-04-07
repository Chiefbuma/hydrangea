
import pool from '@/lib/db';
import { NextResponse } from 'next/server';
import { ResultSetHeader, RowDataPacket } from 'mysql2/promise';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const [rows] = await pool.query<RowDataPacket[]>('SELECT * FROM borrower ORDER BY created_at DESC');
    return NextResponse.json(rows);
  } catch (error) {
    console.error("GET /api/borrowers error:", error);
    return NextResponse.json({ error: 'Database query failed' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { name, contact_no, national_id, email, address } = await req.json();
    const [result] = await pool.execute<ResultSetHeader>(
      'INSERT INTO borrower (name, contact_no, national_id, email, address) VALUES (?, ?, ?, ?, ?)',
      [name, contact_no, national_id, email, address]
    );
    const [rows] = await pool.query<RowDataPacket[]>('SELECT * FROM borrower WHERE borrower_id = ?', [result.insertId]);
    return NextResponse.json(rows[0], { status: 201 });
  } catch (error: any) {
    if (error.code === 'ER_DUP_ENTRY') {
      return NextResponse.json({ message: 'Duplicate contact number or national ID.' }, { status: 409 });
    }
    return NextResponse.json({ error: 'Database query failed' }, { status: 500 });
  }
}
