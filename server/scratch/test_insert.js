const mysql = require('mysql2/promise');
require('dotenv').config();

async function testInsert() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST_WRITE,
    port: parseInt(process.env.DB_PORT_WRITE || '3306'),
    user: process.env.DB_USER_WRITE,
    password: process.env.DB_PASSWORD_WRITE,
    database: process.env.DB_DATABASE_WRITE
  });

  try {
    console.log('Testing INSERT...');
    const [result] = await connection.execute(
      'INSERT INTO products (shop_id, name, price, stock, unit, imagePath) VALUES (?, ?, ?, ?, ?, ?)',
      ['b453ee5a-73a9-4f9d-8edc-ce4ca7c103b7', 'Test Product', 100, 10, 'pcs', 'assets/images/default.png']
    );
    console.log('Insert Success! Result:', result);
  } catch (err) {
    console.error('INSERT FAILED!');
    console.error('Error Code:', err.code);
    console.error('Error Message:', err.message);
  } finally {
    await connection.end();
  }
}

testInsert();
