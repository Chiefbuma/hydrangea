
import pool from '@/lib/db';
import { NextResponse, NextRequest } from 'next/server';
import type { Transaction } from '@/lib/types';
import { RowDataPacket, ResultSetHeader, PoolConnection } from 'mysql2/promise';

export const dynamic = 'force-dynamic';

async function buildTransactions(transactionRows: any[]): Promise<Transaction[]> {
  if (transactionRows.length === 0) {
    return [];
  }

  const transactionIds = transactionRows.map(t => t.id);

  const ambulanceIds = Array.from(new Set(transactionRows.map(t => t.ambulance_id).filter(Boolean)));
  const driverIds = Array.from(new Set(transactionRows.map(t => t.driver_id).filter(Boolean)));

  const [ambulances] = ambulanceIds.length
    ? await pool.query<RowDataPacket[]>('SELECT id, vehicle_type, reg_no, fuel_cost, operation_cost, target, status FROM ambulances WHERE id IN (?)', [ambulanceIds])
    : [[]];

  const [drivers] = driverIds.length
    ? await pool.query<RowDataPacket[]>('SELECT id, name FROM drivers WHERE id IN (?)', [driverIds])
    : [[]];

  const [assistantRows] = await pool.query<RowDataPacket[]>(
    'SELECT ta.transaction_id, a.id, a.name FROM transaction_assistants ta JOIN assistants a ON a.id = ta.assistant_id WHERE ta.transaction_id IN (?)',
    [transactionIds]
  );

  const ambulanceMap = new Map((ambulances as any[]).map(a => [String(a.id), a]));
  const driverMap = new Map((drivers as any[]).map(d => [String(d.id), d]));
  
  const transactionAssistantsMap = new Map<number, any[]>();
  assistantRows.forEach(row => {
    const txId = row.transaction_id;
    const assistant = { id: row.id, name: row.name };
    if (!transactionAssistantsMap.has(txId)) transactionAssistantsMap.set(txId, []);
    transactionAssistantsMap.get(txId)!.push(assistant);
  });

  return transactionRows.map(t => {
    const ambulance = ambulanceMap.get(String(t.ambulance_id));
    const driver = driverMap.get(String(t.driver_id));
    return {
      id: t.id,
      date: new Date(t.date).toISOString(),
      ambulance: ambulance || { id: t.ambulance_id, vehicle_type: 'ambulance' as const, reg_no: 'Unknown', fuel_cost: 0, operation_cost: 0, target: 0, status: 'inactive' as const },
      driver: driver || { id: t.driver_id, name: 'Unknown' },
      assistants: transactionAssistantsMap.get(t.id) || [],
      total_till: Number(t.total_till || 0),
      target: Number(t.target || 0),
      fuel: Number(t.fuel || 0),
      operation: Number(t.operation || 0),
      cash_deposited_by_staff: Number(t.cash_deposited_by_staff || 0),
      amount_paid_to_the_till: Number(t.amount_paid_to_the_till || 0),
      offload: Number(t.offload || 0),
      salary: Number(t.salary || 0),
      operations_cost: Number(t.operations_cost || 0),
      net_banked: Number(t.net_banked || 0),
      deficit: Number(t.deficit || 0),
      fuel_revenue_ratio: Number(t.fuel_revenue_ratio || 0),
      performance: Number(t.performance || 0),
    };
  });
}


export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const ambulanceIdParam = searchParams.get('ambulanceId');

  try {
    console.log(`Attempting to GET /api/transactions?${searchParams.toString()}`);
    let query = 'SELECT t.id, t.date, t.ambulance_id, t.driver_id, t.total_till, t.target, t.fuel, t.operation, t.cash_deposited_by_staff, t.amount_paid_to_the_till, t.offload, t.salary, t.operations_cost, t.net_banked, t.deficit, t.performance, t.fuel_revenue_ratio, t.created_at, t.updated_at FROM transactions t';
    const params: (string | number)[] = [];

    if (ambulanceIdParam) {
      const ambulanceId = parseInt(ambulanceIdParam, 10);
      if (!isNaN(ambulanceId)) {
        query += ' WHERE t.ambulance_id = ?';
        params.push(ambulanceId);
      }
    }
    
    query += ' ORDER BY t.date DESC';

    const [rows] = await pool.query<RowDataPacket[]>(query, params);
    const fullTransactions = await buildTransactions(rows as any[]);
    console.log(`Successfully fetched from /api/transactions?${searchParams.toString()}`);
    return NextResponse.json(fullTransactions);

  } catch (error) {
    console.error(`Caught error in GET /api/transactions?${searchParams.toString()}:`, error);
    return NextResponse.json({ error: 'Database query failed' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  let connection: PoolConnection | null = null;
  try {
    connection = await pool.getConnection();
    await connection.beginTransaction();

    const {
        date,
        ambulance_id,
        driver_id,
        assistant_ids,
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

    const [result] = await connection.query<ResultSetHeader>('INSERT INTO transactions SET ?', [transactionData]);
    const transactionId = result.insertId;

    if (assistant_ids && assistant_ids.length > 0) {
        const assistantLinks = assistant_ids.map((assistantId: number) => [transactionId, assistantId]);
        await connection.query('INSERT INTO transaction_assistants (transaction_id, assistant_id) VALUES ?', [assistantLinks]);
    }

    await connection.commit();

    const [rows] = await connection.query<RowDataPacket[]>('SELECT * FROM transactions WHERE id = ?', [transactionId]);
    const newTransaction = await buildTransactions(rows as any[]);

    return NextResponse.json({ message: 'Transaction created successfully', transaction: newTransaction[0] }, { status: 201 });

  } catch (error) {
    if (connection) await connection.rollback();
    console.error("Caught error in POST /api/transactions:", error);
    return NextResponse.json({ error: 'Database query failed' }, { status: 500 });
  } finally {
    if (connection) connection.release();
  }
}
