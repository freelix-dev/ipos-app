import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

dotenv.config();

const resetDb = async () => {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST_WRITE,
    port: parseInt(process.env.DB_PORT_WRITE || '3306', 10),
    user: process.env.DB_USER_WRITE,
    password: process.env.DB_PASSWORD_WRITE,
    database: process.env.DB_DATABASE_WRITE,
    multipleStatements: true // Essential for running init.sql
  });

  console.log('Connecting to database for FULL RESET...');

  try {
    // 1. Drop existing tables in correct order
    console.log('Dropping existing tables...');
    await connection.query('SET FOREIGN_KEY_CHECKS = 0');
    await connection.query('DROP TABLE IF EXISTS orders');
    await connection.query('DROP TABLE IF EXISTS products');
    await connection.query('DROP TABLE IF EXISTS users');
    await connection.query('DROP TABLE IF EXISTS exchange_rates');
    await connection.query('DROP TABLE IF EXISTS shops');
    await connection.query('SET FOREIGN_KEY_CHECKS = 1');

    // 2. Read and Execute init.sql
    console.log('Reading init.sql...');
    const initSqlPath = path.join(__dirname, '../init.sql');
    const initSql = fs.readFileSync(initSqlPath, 'utf8');

    console.log('Executing init.sql to create new schema...');
    await connection.query(initSql);

    console.log('Database RESET and RE-INITIALIZED successfully!');
  } catch (error) {
    console.error('Database Reset FAILED:', error);
  } finally {
    await connection.end();
  }
};

resetDb();
