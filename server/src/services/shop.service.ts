import { readPool, writePool } from '../db';
import { RowDataPacket } from 'mysql2';
import { v4 as uuidv4 } from 'uuid';

export const getAllShops = async () => {
  const [shops] = await readPool.query<RowDataPacket[]>('SELECT * FROM shops ORDER BY name ASC');
  return shops;
};

export const getShopById = async (id: string) => {
  const [shops] = await readPool.query<RowDataPacket[]>('SELECT * FROM shops WHERE id = ?', [id]);
  return shops[0] || null;
};

export const createShop = async (shopData: any) => {
  const { name, address, phone } = shopData;
  const id = uuidv4();
  await writePool.query(
    'INSERT INTO shops (id, name, address, phone) VALUES (?, ?, ?, ?)',
    [id, name, address, phone]
  );
  return id;
};

export const updateShop = async (id: string, shopData: any) => {
  const { name, address, phone } = shopData;
  await writePool.query(
    'UPDATE shops SET name = ?, address = ?, phone = ? WHERE id = ?',
    [name, address, phone, id]
  );
  return true;
};

export const deleteShop = async (id: string) => {
  await writePool.query('DELETE FROM shops WHERE id = ?', [id]);
  return true;
};

export const registerShop = async (data: any) => {
  const { shopName, address, phone, ownerName, email, password } = data;
  const shopId = uuidv4();
  const userId = uuidv4();

  const connection = await writePool.getConnection();
  try {
    await connection.beginTransaction();

    // 1. Create Shop
    await connection.query(
      'INSERT INTO shops (id, name, address, phone) VALUES (?, ?, ?, ?)',
      [shopId, shopName, address, phone]
    );

    // 2. Create Admin User for this shop
    await connection.query(
      'INSERT INTO users (id, shop_id, name, email, password, role) VALUES (?, ?, ?, ?, ?, ?)',
      [userId, shopId, ownerName, email, password, 'admin']
    );

    await connection.commit();
    return { shopId, userId };
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};
