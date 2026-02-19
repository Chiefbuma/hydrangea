import pool from '@/lib/db';
import { NextResponse } from 'next/server';
import { RowDataPacket } from 'mysql2';

export const dynamic = 'force-dynamic';

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const { name } = await req.json();
    await pool.execute('UPDATE drivers SET name = ? WHERE id = ?', [name, params.id]);
    const [rows] = await pool.query<RowDataPacket[]>('SELECT id, name FROM drivers WHERE id = ?', [params.id]);
    return NextResponse.json({ message: 'Driver updated successfully', driver: rows[0] });
  } catch (error) {
    console.error("Caught error in PUT /api/drivers/[id]:", error);
    return NextResponse.json({ error: 'Database query failed' }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    await pool.execute('DELETE FROM drivers WHERE id = ?', [params.id]);
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("Caught error in DELETE /api/drivers/[id]:", error);
    return NextResponse.json({ error: 'Database query failed' }, { status: 500 });
  }
}
