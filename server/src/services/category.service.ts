import { readPool, writePool } from '../db';
import { RowDataPacket, ResultSetHeader } from 'mysql2';
import { randomUUID } from 'crypto';

export const getAllCategories = async (shopId?: string) => {
  let query = 'SELECT * FROM categories';
  const params: any[] = [];

  if (shopId) {
    query += ' WHERE shop_id = ?';
    params.push(shopId);
  }

  const [categories] = await readPool.query<RowDataPacket[]>(query, params);
  return categories;
};

export const getCategoryById = async (id: string) => {
  const [categories] = await readPool.query<RowDataPacket[]>('SELECT * FROM categories WHERE id = ?', [id]);
  return categories[0] || null;
};

export const createCategory = async (categoryData: any) => {
  const { shop_id, name, description } = categoryData;
  const id = randomUUID();
  
  await writePool.query<ResultSetHeader>(
    'INSERT INTO categories (id, shop_id, name, description) VALUES (?, ?, ?, ?)',
    [id, shop_id || null, name, description || null]
  );
  
  return id;
};

export const updateCategory = async (id: string, categoryData: any) => {
  const { name, description, shop_id } = categoryData;
  
  await writePool.query(
    'UPDATE categories SET name = ?, description = ?, shop_id = ? WHERE id = ?',
    [name, description || null, shop_id || null, id]
  );
};

export const deleteCategory = async (id: string) => {
  await writePool.query('DELETE FROM categories WHERE id = ?', [id]);
};
