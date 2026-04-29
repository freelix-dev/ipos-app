import { readPool, writePool } from '../db';
import { RowDataPacket, ResultSetHeader } from 'mysql2';
import { randomUUID } from 'crypto';

export const getAllSuppliers = async (shopId?: string) => {
  let query = 'SELECT * FROM suppliers';
  const params: any[] = [];

  if (shopId) {
    query += ' WHERE shop_id = ?';
    params.push(shopId);
  }

  const [suppliers] = await readPool.query<RowDataPacket[]>(query, params);
  return suppliers;
};

export const getSupplierById = async (id: string) => {
  const [suppliers] = await readPool.query<RowDataPacket[]>('SELECT * FROM suppliers WHERE id = ?', [id]);
  return suppliers[0] || null;
};

export const createSupplier = async (supplierData: any) => {
  const { shop_id, name, contact_name, phone, email, address } = supplierData;
  const id = randomUUID();
  
  await writePool.query<ResultSetHeader>(
    'INSERT INTO suppliers (id, shop_id, name, contact_name, phone, email, address) VALUES (?, ?, ?, ?, ?, ?, ?)',
    [id, shop_id || null, name, contact_name || null, phone || null, email || null, address || null]
  );
  
  return id;
};

export const updateSupplier = async (id: string, supplierData: any) => {
  const { name, contact_name, phone, email, address, shop_id } = supplierData;
  
  await writePool.query(
    'UPDATE suppliers SET name = ?, contact_name = ?, phone = ?, email = ?, address = ?, shop_id = ? WHERE id = ?',
    [name, contact_name || null, phone || null, email || null, address || null, shop_id || null, id]
  );
};

export const deleteSupplier = async (id: string) => {
  await writePool.query('DELETE FROM suppliers WHERE id = ?', [id]);
};
