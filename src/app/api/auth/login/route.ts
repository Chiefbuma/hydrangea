
import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import pool from '@/lib/db';
import { RowDataPacket } from 'mysql2';
import { createSessionToken, SESSION_COOKIE_NAME, sessionCookieOptions } from '@/lib/session';

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
      return NextResponse.json({ message: 'Invalid credentials' }, { status: 401 });
    }

    const hash = user.password.replace(/^\$2y\$/, '$2a\$');
    const isPasswordValid = await bcrypt.compare(password, hash);

    if (!isPasswordValid) {
      return NextResponse.json({ message: 'Invalid credentials' }, { status: 401 });
    }

    const { password: _, ...userToReturn } = user;
    const sessionToken = await createSessionToken({
      id: Number(userToReturn.id),
      name: String(userToReturn.name),
      email: String(userToReturn.email),
      role: userToReturn.role as 'admin' | 'staff',
    });
    const response = NextResponse.json(userToReturn);

    response.cookies.set(SESSION_COOKIE_NAME, sessionToken, sessionCookieOptions());
    return response;
  } catch (error) {
    console.error('LOGIN API ERROR', error);
    return NextResponse.json({ error: 'Database query failed or authentication error' }, { status: 500 });
  }
}
