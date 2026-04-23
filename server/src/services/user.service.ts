import { readPool, writePool } from '../db';
import { RowDataPacket } from 'mysql2';
import { v4 as uuidv4 } from 'uuid';

export const getAllUsers = async (shopId?: string) => {
  let query = 'SELECT u.id, u.shop_id, u.email, u.name, u.role, s.name as shop_name FROM users u LEFT JOIN shops s ON u.shop_id = s.id';
  const params: any[] = [];

  if (shopId) {
    query += ' WHERE u.shop_id = ?';
    params.push(shopId);
  }

  const [users] = await readPool.query<RowDataPacket[]>(query, params);
  return users;
};

export const createUser = async (userData: any) => {
  const { name, email, password, role, shop_id } = userData;
  const id = uuidv4();
  await writePool.query(
    'INSERT INTO users (id, shop_id, name, email, password, role) VALUES (?, ?, ?, ?, ?, ?)',
    [id, shop_id || null, name, email, password, role || 'user']
  );
  return id;
};

export const findUserByEmailAndPassword = async (email: string, password: string) => {
  const [users] = await readPool.query<RowDataPacket[]>(
    `SELECT u.id, u.shop_id, u.email, u.name, u.role, s.name as shop_name 
     FROM users u 
     LEFT JOIN shops s ON u.shop_id = s.id 
     WHERE u.email = ? AND u.password = ? LIMIT 1`,
    [email, password]
  );
  return users[0] || null;
};

export const ensureAdminExists = async () => {
  const email = 'admin@ipos.com';
  const password = '123';
  const [[existing]] = await readPool.query<RowDataPacket[]>('SELECT id FROM users WHERE email = ? LIMIT 1', [email]);
  
  if (!existing) {
    const id = uuidv4();
    await writePool.query(
      'INSERT IGNORE INTO users (id, email, password, name, role) VALUES (?,?,?,?,?)',
      [id, email, password, 'Admin User', 'admin']
    );
    return { id, email, name: 'Admin User', role: 'admin' };
  }
  
  const [[user]] = await readPool.query<RowDataPacket[]>('SELECT id, email, name, role FROM users WHERE email = ? LIMIT 1', [email]);
  return user;
};
