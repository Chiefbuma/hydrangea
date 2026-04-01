
import pool from '@/lib/db';
import { NextResponse } from 'next/server';
import { RowDataPacket, PoolConnection } from 'mysql2/promise';
import type { Transaction } from '@/lib/types';

export const dynamic = 'force-dynamic';

type RouteContext = {
  params: Promise<{ id: string }>;
};

async function buildSingleTransaction(transactionRow: any): Promise<Transaction | null> {
    if (!transactionRow) {
        return null;
    }
    
    const [ambulanceRows] = await pool.query<RowDataPacket[]>('SELECT * FROM ambulances WHERE id = ?', [transactionRow.ambulance_id]);
    const [driverRows] = await pool.query<RowDataPacket[]>('SELECT * FROM drivers WHERE id = ?', [transactionRow.driver_id]);
    const [technicianLinks] = await pool.query<RowDataPacket[]>('SELECT et.* FROM transaction_technicians tt JOIN emergency_technicians et ON et.id = tt.technician_id WHERE tt.transaction_id = ?', [transactionRow.id]);

    return {
        ...transactionRow,
        ambulance: ambulanceRows[0],
        driver: driverRows[0],
        emergency_technicians: technicianLinks,
    };
}


export async function PUT(req: Request, context: RouteContext) {
  let connection: PoolConnection | null = null;
  try {
    connection = await pool.getConnection();
    await connection.beginTransaction();
    const { id } = await context.params;
    const transactionId = id;

    const {
        date,
        ambulance_id,
        driver_id,
        emergency_technician_ids,
        total_till,
        fuel,
        operation,
        cash_deposited_by_staff,
    } = await req.json();

    const [ambulanceRows] = await connection.query<RowDataPacket[]>('SELECT target FROM ambulances WHERE id = ?', [ambulance_id]);
    if (ambulanceRows.length === 0) {
        await connection.rollback();
        return NextResponse.json({ message: 'Vehicle not found' }, { status: 404 });
    }
    const target = ambulanceRows[0].target;

    // Recalculate derived fields
    const totalTillNum = Number(total_till) || 0;
    const fuelNum = Number(fuel) || 0;
    const operationNum = Number(operation) || 0;
    const cashDepositedNum = Number(cash_deposited_by_staff) || 0;
    const targetNum = Number(target) || 0;
    
    const amount_paid_to_the_till = totalTillNum - cashDepositedNum;
    const offload = totalTillNum - fuelNum - operationNum;
    const salary = (offload - targetNum) >= 0 ? (offload - targetNum) : 0;
    const operations_cost = operationNum + salary;
    const net_banked = totalTillNum - fuelNum - operationNum - salary;
    const deficit = targetNum > 0 ? Math.max(targetNum - net_banked, 0) : 0;
    const performance = targetNum > 0 ? net_banked / targetNum : 0;
    const fuel_revenue_ratio = totalTillNum > 0 ? fuelNum / totalTillNum : 0;

    const transactionData = {
        date,
        ambulance_id,
        driver_id,
        total_till: totalTillNum,
        target: targetNum,
        fuel: fuelNum,
        operation: operationNum,
        cash_deposited_by_staff: cashDepositedNum,
        amount_paid_to_the_till,
        offload,
        salary,
        operations_cost,
        net_banked,
        deficit,
        performance,
        fuel_revenue_ratio,
    };

    await connection.query('UPDATE transactions SET ? WHERE id = ?', [transactionData, transactionId]);

    // Update technicians
    await connection.query('DELETE FROM transaction_technicians WHERE transaction_id = ?', [transactionId]);
    if (emergency_technician_ids && emergency_technician_ids.length > 0) {
        const technicianLinks = emergency_technician_ids.map((techId: number) => [transactionId, techId]);
        await connection.query('INSERT INTO transaction_technicians (transaction_id, technician_id) VALUES ?', [technicianLinks]);
    }

    await connection.commit();

    const [rows] = await connection.query<RowDataPacket[]>('SELECT * FROM transactions WHERE id = ?', [transactionId]);
    const updatedTransaction = await buildSingleTransaction(rows[0]);

    return NextResponse.json({ message: 'Transaction updated successfully', transaction: updatedTransaction });

  } catch (error) {
    if (connection) await connection.rollback();
    console.error("Caught error in PUT /api/transactions/[id]:", error);
    return NextResponse.json({ error: 'Database query failed' }, { status: 500 });
  } finally {
    if (connection) connection.release();
  }
}

export async function DELETE(req: Request, context: RouteContext) {
  let connection: PoolConnection | null = null;
  try {
    connection = await pool.getConnection();
    await connection.beginTransaction();
    const { id } = await context.params;
    const transactionId = id;
    
    // First, delete from the join table
    await connection.query('DELETE FROM transaction_technicians WHERE transaction_id = ?', [transactionId]);
    
    // Then, delete from the transactions table
    await connection.query('DELETE FROM transactions WHERE id = ?', [transactionId]);
    
    await connection.commit();
    
    return new NextResponse(null, { status: 204 });

  } catch (error) {
    if (connection) await connection.rollback();
    console.error("Caught error in DELETE /api/transactions/[id]:", error);
    return NextResponse.json({ error: 'Database query failed' }, { status: 500 });
  } finally {
    if (connection) connection.release();
  }
}
