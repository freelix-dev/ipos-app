const mysql = require('mysql2/promise');
require('dotenv').config();

async function checkProducts() {
  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST_WRITE,
      port: parseInt(process.env.DB_PORT_WRITE),
      user: process.env.DB_USER_WRITE,
      password: process.env.DB_PASSWORD_WRITE,
      database: process.env.DB_DATABASE_WRITE,
    });
    const [rows] = await connection.query('SELECT count(*) as count FROM products');
    console.log('Total products in DB:', rows[0].count);
    
    const [sample] = await connection.query('SELECT * FROM products LIMIT 5');
    console.log('Sample products:', JSON.stringify(sample, null, 2));
    
    await connection.end();
  } catch (err) {
    console.error('❌ Error:', err.message);
  }
}

checkProducts();
