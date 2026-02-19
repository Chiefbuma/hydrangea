
import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import pool from '@/lib/db';
import { RowDataPacket } from 'mysql2';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    console.log(`[${new Date().toISOString()}] /api/auth/login endpoint hit. Attempting to parse request.`);
    const { email, password } = await request.json();
    console.log(`[${new Date().toISOString()}] Login attempt for email: ${email}`);

    if (!email || !password) {
      console.log(`[${new Date().toISOString()}] Login failed: Email or password missing.`);
      return NextResponse.json({ message: 'Email and password are required' }, { status: 400 });
    }
    
    console.log(`[${new Date().toISOString()}] Attempting to query database for user: ${email}`);
    const [users] = await pool.query<RowDataPacket[]>('SELECT id, name, email, password, role FROM users WHERE email = ?', [email]);
    console.log(`[${new Date().toISOString()}] Database query for user ${email} successful.`);

    if (users.length === 0) {
      console.log(`[${new Date().toISOString()}] Login failed: User not found for email: ${email}`);
      return NextResponse.json({ message: 'Invalid credentials' }, { status: 401 });
    }

    const user = users[0];
    console.log(`[${new Date().toISOString()}] User found. Checking password.`);
    
    if (!user.password) {
      console.error(`[${new Date().toISOString()}] Authentication error: User ${email} found but has no password.`);
      return NextResponse.json({ message: 'Invalid credentials' }, { status: 401 });
    }

    const hash = user.password.replace(/^\$2y\$/, '$2a\$');
    const isPasswordValid = await bcrypt.compare(password, hash);
    console.log(`[${new Date().toISOString()}] Password for ${email} is valid: ${isPasswordValid}`);

    if (!isPasswordValid) {
      console.log(`[${new Date().toISOString()}] Login failed: Invalid password for email: ${email}`);
      return NextResponse.json({ message: 'Invalid credentials' }, { status: 401 });
    }

    console.log(`[${new Date().toISOString()}] Login successful for user: ${user.id}`);
    const { password: _, ...userToReturn } = user;

    return NextResponse.json(userToReturn);

  } catch (error) {
    console.error('--- LOGIN API ERROR ---');
    console.error(`Timestamp: ${new Date().toISOString()}`);
    console.error('Error object:', error);
    if (error instanceof Error) {
        console.error('Error Name:', error.name);
        console.error('Error Message:', error.message);
        console.error('Error Stack:', error.stack);
    }
    console.error('-----------------------');
    return NextResponse.json({ error: 'Database query failed or authentication error' }, { status: 500 });
  }
}
