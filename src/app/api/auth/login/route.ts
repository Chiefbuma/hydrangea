
import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import pool from '@/lib/db';
import { RowDataPacket } from 'mysql2';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ message: 'Email and password are required' }, { status: 400 });
    }

    const [users] = await pool.query<RowDataPacket[]>('SELECT id, name, email, password, role FROM users WHERE email = ?', [email]);

    if (users.length === 0) {
      return NextResponse.json({ message: 'Invalid credentials' }, { status: 401 });
    }

    const user = users[0];
    
    if (!user.password) {
      console.error(`Authentication error: User ${email} found but has no password.`);
      return NextResponse.json({ message: 'Invalid credentials' }, { status: 401 });
    }

    const hash = user.password.replace(/^\$2y\$/, '$2a\$');
    const isPasswordValid = await bcrypt.compare(password, hash);

    if (!isPasswordValid) {
      return NextResponse.json({ message: 'Invalid credentials' }, { status: 401 });
    }

    // Don't send the password hash to the client
    const { password: _, ...userToReturn } = user;

    return NextResponse.json(userToReturn);

  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ error: 'Database query failed or authentication error' }, { status: 500 });
  }
}
