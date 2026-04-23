const mysql = require('mysql2/promise');
require('dotenv').config();

async function checkDb() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST_WRITE,
    port: parseInt(process.env.DB_PORT_WRITE || '3306'),
    user: process.env.DB_USER_WRITE,
    password: process.env.DB_PASSWORD_WRITE,
    database: process.env.DB_DATABASE_WRITE
  });

  try {
    const [products] = await connection.execute('SELECT id, name, shop_id, price FROM products');
    console.log('--- ALL PRODUCTS IN DATABASE ---');
    console.table(products);
    console.log('Total:', products.length);

  } catch (err) {
    console.error('DB Error:', err.message);
  } finally {
    await connection.end();
  }
}

checkDb();
