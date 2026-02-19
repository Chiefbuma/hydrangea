import { db } from './db';
import type { RowDataPacket, OkPacket, ResultSetHeader } from 'mysql2';

// This union type is broad to cover various return types from mysql2
export type QueryResult = RowDataPacket[] | RowDataPacket[][] | OkPacket | OkPacket[] | ResultSetHeader;

export async function executeQuery<T extends QueryResult>(
  query: string,
  params?: any[]
): Promise<T> {
  // The new `db.execute` wrapper from `lib/db.ts` handles the connection
  // and error logging internally.
  return db.execute(query, params) as Promise<T>;
}
