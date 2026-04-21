import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

// Create write pool
export const writePool = mysql.createPool({
  host: process.env.DB_HOST_WRITE,
  port: parseInt(process.env.DB_PORT_WRITE || '3306', 10),
  user: process.env.DB_USER_WRITE,
  password: process.env.DB_PASSWORD_WRITE,
  database: process.env.DB_DATABASE_WRITE,
  connectTimeout: parseInt(process.env.DB_CONNECTTIMEOUT_WRITE || '10000', 10),
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// Create read pool
export const readPool = mysql.createPool({
  host: process.env.DB_HOST_READ,
  port: parseInt(process.env.DB_PORT_READ || '3306', 10),
  user: process.env.DB_USER_READ,
  password: process.env.DB_PASSWORD_READ,
  database: process.env.DB_DATABASE_READ,
  connectTimeout: parseInt(process.env.DB_CONNECTTIMEOUT_READ || '10000', 10),
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

export const initDb = async () => {
  try {
    const connection = await writePool.getConnection();
    
    // Auto-create basic tables if they don't exist
    // DISABLED: user 'app_write' lacks CREATE TABLE privileges.
    console.log('[server]: Database connected successfully.');
    console.log('[server]: WARNING: Please ensure the "products", "orders", and "users" tables are manually created, as the current user lacks CREATE privileges.');
    
    connection.release();
  } catch (error) {
    console.error('[server]: Database initialization error:', error);
  }
};
