import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import bcrypt from 'bcryptjs';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

export const dynamic = 'force-dynamic';

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const [rows] = await pool.query<RowDataPacket[]>('SELECT id, name, email, role FROM users WHERE id = ?', [params.id]);

    if (rows.length === 0) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    return NextResponse.json(rows[0]);
  } catch (error) {
    console.error("Caught error in GET /api/users/[id]:", error);
    return NextResponse.json({ error: 'Database query failed' }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const { name, email, role, password } = await request.json();
    if (!name || !email || !role) {
      return NextResponse.json({ message: 'Missing required fields (name, email, role)' }, { status: 400 });
    }

    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      await pool.execute<ResultSetHeader>(
        'UPDATE users SET name = ?, email = ?, role = ?, password = ? WHERE id = ?',
        [name, email, role, hashedPassword, params.id]
      );
    } else {
      await pool.execute<ResultSetHeader>(
        'UPDATE users SET name = ?, email = ?, role = ? WHERE id = ?',
        [name, email, role, params.id]
      );
    }

    const [rows] = await pool.query<RowDataPacket[]>('SELECT id, name, email, role FROM users WHERE id = ?', [params.id]);

    if (rows.length === 0) {
      return NextResponse.json({ message: 'User not found after update' }, { status: 404 });
    }

    return NextResponse.json({ message: 'User updated successfully', user: rows[0] });
  } catch (error) {
    console.error("Caught error in PUT /api/users/[id]:", error);
    if ((error as any).code === 'ER_DUP_ENTRY') {
      return NextResponse.json({ message: 'A user with this email already exists.' }, { status: 409 });
    }
    return NextResponse.json({ error: 'Database query failed' }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    await pool.execute('DELETE FROM users WHERE id = ?', [params.id]);
    return NextResponse.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error("Caught error in DELETE /api/users/[id]:", error);
    return NextResponse.json({ error: 'Database query failed' }, { status: 500 });
  }
}
