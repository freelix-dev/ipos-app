const mysql = require('mysql2/promise');
require('dotenv').config();

async function debugQuery() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST_WRITE,
    port: parseInt(process.env.DB_PORT_WRITE || '3306'),
    user: process.env.DB_USER_WRITE,
    password: process.env.DB_PASSWORD_WRITE,
    database: process.env.DB_DATABASE_WRITE
  });

  try {
    const ownerId = '45755b58-3617-4fbc-9d95-62bd183d2ded';
    const userId = 'c0d8ec74-0183-466e-89dd-97f0bb486c77';

    let query = 'SELECT p.*, s.name as shop_name FROM products p LEFT JOIN shops s ON p.shop_id = s.id';
    const params = [ownerId, userId, userId];
    query += ' WHERE s.owner_id = ? AND (p.shop_id IN (SELECT shop_id FROM user_shops WHERE user_id = ?) OR p.shop_id = (SELECT shop_id FROM users WHERE id = ?))';

    console.log('Running debug query...');
    const [products] = await connection.execute(query, params);
    console.log('Result Count:', products.length);
    console.table(products.map(p => ({ name: p.name, shop: p.shop_name })));

  } catch (err) {
    console.error(err);
  } finally {
    await connection.end();
  }
}

debugQuery();
