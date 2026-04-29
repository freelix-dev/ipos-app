const mysql = require('mysql2/promise');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../server/.env') });

async function checkAndAddColumn() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'ipos'
  });

  try {
    console.log('Checking table structure...');
    const [columns] = await connection.query('DESCRIBE receipt_settings');
    const hasColumn = columns.some(col => col.Field === 'qr_image_url');

    if (!hasColumn) {
      console.log('Adding column qr_image_url...');
      await connection.query('ALTER TABLE receipt_settings ADD COLUMN qr_image_url TEXT AFTER qr_data');
      console.log('Column added successfully.');
    } else {
      console.log('Column qr_image_url already exists.');
    }
  } catch (err) {
    console.error('Error:', err.message);
  } finally {
    await connection.end();
  }
}

checkAndAddColumn();
