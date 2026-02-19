import pool from '@/lib/db';
import { NextResponse } from 'next/server';
import { ResultSetHeader, RowDataPacket } from 'mysql2';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    console.log("Attempting to GET /api/ambulances");
    const [rows] = await pool.query<RowDataPacket[]>('SELECT id, reg_no, fuel_cost, operation_cost, target, status, created_at FROM ambulances ORDER BY created_at DESC');
    console.log("Successfully fetched from /api/ambulances");
    return NextResponse.json(rows);
  } catch (error) {
    console.error("Caught error in GET /api/ambulances:", error);
    return NextResponse.json({ error: 'Database query failed' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { reg_no, fuel_cost, operation_cost, target, status } = await req.json();
    const [result] = await pool.execute<ResultSetHeader>(
      'INSERT INTO ambulances (reg_no, fuel_cost, operation_cost, target, status) VALUES (?, ?, ?, ?, ?)',
      [reg_no, fuel_cost, operation_cost, target, status]
    );
    const insertId = result.insertId;
    const [rows] = await pool.query<RowDataPacket[]>('SELECT id, reg_no, fuel_cost, operation_cost, target, status, created_at FROM ambulances WHERE id = ?', [insertId]);
    return NextResponse.json({ message: 'Ambulance created successfully', ambulance: rows[0] }, { status: 201 });
  } catch (error) {
    console.error("Caught error in POST /api/ambulances:", error);
    if ((error as any).code === 'ER_DUP_ENTRY') {
      return NextResponse.json({ message: 'An ambulance with this registration number already exists.' }, { status: 409 });
    }
    return NextResponse.json({ error: 'Database query failed' }, { status: 500 });
  }
}
