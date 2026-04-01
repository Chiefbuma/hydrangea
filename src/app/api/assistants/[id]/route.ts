import pool from '@/lib/db';
import { NextResponse } from 'next/server';
import { RowDataPacket } from 'mysql2';

export const dynamic = 'force-dynamic';

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function PUT(req: Request, context: RouteContext) {
  try {
    const { id } = await context.params;
    const { name } = await req.json();
    await pool.execute('UPDATE assistants SET name = ? WHERE id = ?', [name, id]);
    const [rows] = await pool.query<RowDataPacket[]>('SELECT id, name FROM assistants WHERE id = ?', [id]);
    return NextResponse.json({ message: 'Assistant updated successfully', assistant: rows[0] });
  } catch (error) {
    console.error('Caught error in PUT /api/assistants/[id]:', error);
    return NextResponse.json({ error: 'Database query failed' }, { status: 500 });
  }
}

export async function DELETE(req: Request, context: RouteContext) {
  try {
    const { id } = await context.params;
    await pool.execute('DELETE FROM assistants WHERE id = ?', [id]);
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('Caught error in DELETE /api/assistants/[id]:', error);
    return NextResponse.json({ error: 'Database query failed' }, { status: 500 });
  }
}
