import pool from '@/lib/db';
import { NextResponse } from 'next/server';
import { RowDataPacket, ResultSetHeader } from 'mysql2';
import bcrypt from 'bcryptjs';
import type { User } from '@/lib/types';

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

export async function POST(request: Request) {
    try {
        const { name, email, role, password } = await request.json() as User;

        if (!name || !email || !role || !password) {
            return NextResponse.json({ message: 'Missing required fields (name, email, role, password)' }, { status: 400 });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        
        const [result] = await pool.execute<ResultSetHeader>(
            'INSERT INTO users (name, email, role, password) VALUES (?, ?, ?, ?)',
            [name, email, role, hashedPassword]
        );

        const insertId = result.insertId;
        const [rows] = await pool.query<RowDataPacket[]>('SELECT id, name, email, role FROM users WHERE id = ?', [insertId]);
        
        if (rows.length === 0) {
            return NextResponse.json({ message: 'User created but could not be found' }, { status: 500 });
        }

        return NextResponse.json({ message: 'User created successfully', user: rows[0] }, { status: 201 });

    } catch (error) {
        console.error("Caught error in POST /api/users:", error);
        if ((error as any).code === 'ER_DUP_ENTRY') {
            return NextResponse.json({ message: 'A user with this email already exists.' }, { status: 409 });
        }
        return NextResponse.json({ error: 'Database query failed' }, { status: 500 });
    }
}
