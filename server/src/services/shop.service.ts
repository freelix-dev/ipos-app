import { readPool, writePool } from '../db';
import { RowDataPacket } from 'mysql2';
import { v4 as uuidv4 } from 'uuid';

export const getAllShops = async (ownerId?: string, userId?: string) => {
  let query = 'SELECT s.* FROM shops s';
  const params: any[] = [];
  const whereClauses: string[] = [];

  if (ownerId) {
    whereClauses.push('s.owner_id = ?');
    params.push(ownerId);
  }

  if (userId) {
    // Check if the user has any specific assignments
    const [assignments] = await readPool.query<RowDataPacket[]>(
      'SELECT 1 FROM user_shops WHERE user_id = ? LIMIT 1',
      [userId]
    );

    if (assignments.length > 0) {
      // User has specific assignments, so filter
      query += ' JOIN user_shops us ON s.id = us.shop_id';
      whereClauses.push('us.user_id = ?');
      params.push(userId);
    }
  }

  if (whereClauses.length > 0) {
    query += ' WHERE ' + whereClauses.join(' AND ');
  }

  query += ' ORDER BY s.name ASC';

  const [shops] = await readPool.query<RowDataPacket[]>(query, params);
  return shops;
};

export const getShopById = async (id: string) => {
  const [shops] = await readPool.query<RowDataPacket[]>('SELECT * FROM shops WHERE id = ?', [id]);
  return shops[0] || null;
};

export const createShop = async (shopData: any) => {
  const { name, address, phone, logoPath, owner_id } = shopData;
  const id = uuidv4();
  await writePool.query(
    'INSERT INTO shops (id, owner_id, name, address, phone, logoPath) VALUES (?, ?, ?, ?, ?, ?)',
    [id, owner_id || null, name, address, phone, logoPath || null]
  );
  return id;
};

export const updateShop = async (id: string, shopData: any) => {
  const fields: string[] = [];
  const values: any[] = [];

  if (shopData.name !== undefined)     { fields.push('name = ?');     values.push(shopData.name); }
  if (shopData.address !== undefined)  { fields.push('address = ?');  values.push(shopData.address); }
  if (shopData.phone !== undefined)    { fields.push('phone = ?');    values.push(shopData.phone); }
  if (shopData.logoPath !== undefined) { fields.push('logoPath = ?'); values.push(shopData.logoPath); }

  if (fields.length === 0) return true;
  values.push(id);

  await writePool.query(
    `UPDATE shops SET ${fields.join(', ')} WHERE id = ?`,
    values
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

    // 1. Create User first to get user.id for owner_id
    await connection.query(
      'INSERT INTO users (id, name, email, password, role) VALUES (?, ?, ?, ?, ?)',
      [userId, ownerName, email, password, 'admin']
    );

    // 2. Create Shop with owner_id
    await connection.query(
      'INSERT INTO shops (id, owner_id, name, address, phone, logoPath) VALUES (?, ?, ?, ?, ?, ?)',
      [shopId, userId, shopName, address, phone, data.logoPath || null]
    );

    // 3. Link user to the shop as their default shop
    await connection.query(
      'UPDATE users SET shop_id = ? WHERE id = ?',
      [shopId, userId]
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
