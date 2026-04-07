
import pool from '@/lib/db';
import { NextResponse } from 'next/server';
import { ResultSetHeader, RowDataPacket } from 'mysql2/promise';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const query = `
      SELECT l.*, b.name as borrower_name 
      FROM loan l 
      JOIN borrower b ON l.borrower_id = b.borrower_id 
      ORDER BY l.created_at DESC
    `;
    const [rows] = await pool.query<RowDataPacket[]>(query);
    return NextResponse.json(rows);
  } catch (error) {
    console.error("GET /api/loans error:", error);
    return NextResponse.json({ error: 'Database query failed' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const data = await req.json();
    const { 
      borrower_id, ltype_id, lplan_id, amount, total_loan, 
      daily_amount, duration, payment_frequency, date_released, due_date 
    } = data;

    const [result] = await pool.execute<ResultSetHeader>(
      `INSERT INTO loan (
        borrower_id, ltype_id, lplan_id, amount, total_loan, 
        daily_amount, duration, payment_frequency, status, date_released, due_date
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [borrower_id, ltype_id, lplan_id, amount, total_loan, daily_amount, duration, payment_frequency, 0, date_released, due_date]
    );

    const [rows] = await pool.query<RowDataPacket[]>('SELECT * FROM loan WHERE loan_id = ?', [result.insertId]);
    return NextResponse.json(rows[0], { status: 201 });
  } catch (error) {
    console.error("POST /api/loans error:", error);
    return NextResponse.json({ error: 'Database query failed' }, { status: 500 });
  }
}
