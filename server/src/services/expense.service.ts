import { readPool, writePool } from '../db';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

export const getExpenses = async (shopId?: string) => {
  const params: any[] = [];
  let query = 'SELECT * FROM expenses';
  if (shopId) {
    query += ' WHERE shop_id = ?';
    params.push(shopId);
  }
  query += ' ORDER BY date DESC';
  
  const [rows] = await readPool.query<RowDataPacket[]>(query, params);
  return rows;
};

export const addExpense = async (expenseData: any) => {
  const { shop_id, category, amount, description, date, created_by } = expenseData;
  const [result] = await writePool.query<ResultSetHeader>(
    'INSERT INTO expenses (shop_id, category, amount, description, date, created_by) VALUES (?, ?, ?, ?, ?, ?)',
    [shop_id, category, amount, description, date || new Date(), created_by]
  );
  return result.insertId;
};

export const deleteExpense = async (id: string) => {
  await writePool.query('DELETE FROM expenses WHERE id = ?', [id]);
};
