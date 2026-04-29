import { readPool, writePool } from '../db';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

export const getPromotions = async (shopId: string) => {
  const [rows] = await readPool.query<RowDataPacket[]>(
    'SELECT * FROM promotions WHERE shop_id = ? ORDER BY created_at DESC',
    [shopId]
  );
  return rows;
};

export const createPromotion = async (data: any) => {
  const [result] = await writePool.query<ResultSetHeader>(
    'INSERT INTO promotions (shop_id, name, description, type, value, min_spend, start_date, end_date, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
    [data.shop_id, data.name, data.description, data.type, data.value, data.min_spend, data.start_date, data.end_date, data.status]
  );
  return result.insertId;
};

export const deletePromotion = async (id: string) => {
  await writePool.query('DELETE FROM promotions WHERE id = ?', [id]);
};

export const getCoupons = async (shopId: string) => {
  const [rows] = await readPool.query<RowDataPacket[]>(
    'SELECT * FROM coupons WHERE shop_id = ? ORDER BY created_at DESC',
    [shopId]
  );
  return rows;
};

export const createCoupon = async (data: any) => {
  const [result] = await writePool.query<ResultSetHeader>(
    'INSERT INTO coupons (shop_id, code, discount_type, discount_value, min_purchase, usage_limit, expiry_date, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
    [data.shop_id, data.code, data.discount_type, data.discount_value, data.min_purchase, data.usage_limit, data.expiry_date, data.status]
  );
  return result.insertId;
};

export const deleteCoupon = async (id: string) => {
  await writePool.query('DELETE FROM coupons WHERE id = ?', [id]);
};
