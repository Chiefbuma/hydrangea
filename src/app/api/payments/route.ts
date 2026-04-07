
import pool from '@/lib/db';
import { NextResponse } from 'next/server';
import { ResultSetHeader, RowDataPacket } from 'mysql2/promise';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const [rows] = await pool.query<RowDataPacket[]>('SELECT * FROM payment ORDER BY payment_date DESC');
    return NextResponse.json(rows);
  } catch (error) {
    return NextResponse.json({ error: 'Database query failed' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    const { loan_id, borrower_id, payment_amount, payment_date } = await req.json();

    // Insert payment
    const [payResult] = await connection.execute<ResultSetHeader>(
      'INSERT INTO payment (loan_id, borrower_id, payment_amount, payment_date) VALUES (?, ?, ?, ?)',
      [loan_id, borrower_id, payment_amount, payment_date]
    );

    // Calculate new balance
    const [loanRows] = await connection.query<RowDataPacket[]>('SELECT total_loan FROM loan WHERE loan_id = ?', [loan_id]);
    const totalLoan = loanRows[0].total_loan;
    const [paidRows] = await connection.query<RowDataPacket[]>('SELECT SUM(payment_amount) as total_paid FROM payment WHERE loan_id = ?', [loan_id]);
    const totalPaid = paidRows[0].total_paid || 0;
    const balance = Math.max(0, totalLoan - totalPaid);

    // Update loan status if completed
    if (balance === 0) {
        await connection.execute('UPDATE loan SET status = 3 WHERE loan_id = ?', [loan_id]);
    }

    // Record in junction table
    await connection.execute(
      'INSERT INTO loan_payments (loan_id, payment_id, payment_amount, date_paid, balance) VALUES (?, ?, ?, NOW(), ?)',
      [loan_id, payResult.insertId, payment_amount, balance]
    );

    await connection.commit();
    return NextResponse.json({ message: 'Payment recorded successfully', balance }, { status: 201 });
  } catch (error) {
    await connection.rollback();
    console.error("POST /api/payments error:", error);
    return NextResponse.json({ error: 'Payment recording failed' }, { status: 500 });
  } finally {
    connection.release();
  }
}
