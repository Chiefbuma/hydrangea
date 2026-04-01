import pool from '@/lib/db';
import { NextResponse } from 'next/server';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

export const dynamic = 'force-dynamic';

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(req: Request, context: RouteContext) {
    try {
        const { id } = await context.params;
        const [ambulanceRows] = await pool.query<RowDataPacket[]>('SELECT * FROM ambulances WHERE id = ?', [id]);
        const ambulance = ambulanceRows[0];
        if (!ambulance) {
            return NextResponse.json({ message: 'Vehicle not found' }, { status: 404 });
        }

        // Get latest transaction to find last driver and date
        const [latestTransactionRows] = await pool.query<RowDataPacket[]>(
            `SELECT t.date, d.name as driver_name 
             FROM transactions t
             LEFT JOIN drivers d ON t.driver_id = d.id
             WHERE t.ambulance_id = ? 
             ORDER BY t.date DESC 
             LIMIT 1`,
            [id]
        );
        const latestTransaction = latestTransactionRows[0];

        const ambulanceData = {
            ...ambulance,
            last_driven_by: latestTransaction?.driver_name || 'N/A',
            last_driven_on: latestTransaction ? new Date(latestTransaction.date).toLocaleDateString() : 'N/A',
        };

        return NextResponse.json(ambulanceData);
    } catch (error) {
        console.error("Caught error in GET /api/ambulances/[id]:", error);
        return NextResponse.json({ error: 'Database query failed' }, { status: 500 });
    }
}


export async function PUT(req: Request, context: RouteContext) {
  try {
    const { id } = await context.params;
    const { vehicle_type, reg_no, fuel_cost, operation_cost, target, status } = await req.json();
    await pool.execute(
      'UPDATE ambulances SET vehicle_type = ?, reg_no = ?, fuel_cost = ?, operation_cost = ?, target = ?, status = ? WHERE id = ?',
      [vehicle_type, reg_no, fuel_cost, operation_cost, target, status, id]
    );
    const [rows] = await pool.query<RowDataPacket[]>('SELECT id, vehicle_type, reg_no, fuel_cost, operation_cost, target, status, created_at FROM ambulances WHERE id = ?', [id]);
    return NextResponse.json({ message: 'Vehicle updated successfully', ambulance: rows[0] });
  } catch (error) {
    console.error("Caught error in PUT /api/ambulances/[id]:", error);
    if ((error as any).code === 'ER_DUP_ENTRY') {
      return NextResponse.json({ message: 'A vehicle with this registration number already exists.' }, { status: 409 });
    }
    return NextResponse.json({ error: 'Database query failed' }, { status: 500 });
  }
}

export async function DELETE(req: Request, context: RouteContext) {
  try {
    const { id } = await context.params;
    await pool.execute('DELETE FROM ambulances WHERE id = ?', [id]);
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("Caught error in DELETE /api/ambulances/[id]:", error);
    return NextResponse.json({ error: 'Database query failed' }, { status: 500 });
  }
}
