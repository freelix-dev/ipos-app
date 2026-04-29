import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import { writePool } from './db';

dotenv.config();

const runMigration = async () => {
  console.log('Connecting to database for Migration V6 (Advanced Receipt Settings)...');

  let connection;
  try {
    connection = await writePool.getConnection();

    console.log('Updating receipt_settings table...');
    
    // Add new columns to receipt_settings one by one to avoid total failure if some exist
    const columns = [
      { name: 'logo_path', type: 'TEXT', after: 'logo_enabled' },
      { name: 'show_qr', type: 'BOOLEAN DEFAULT FALSE', after: 'show_staff_name' },
      { name: 'qr_data', type: 'TEXT', after: 'show_qr' },
      { name: 'font_size', type: "VARCHAR(10) DEFAULT 'medium'", after: 'qr_data' }
    ];

    for (const col of columns) {
      try {
        await connection.query(`ALTER TABLE receipt_settings ADD COLUMN ${col.name} ${col.type} AFTER ${col.after}`);
        console.log(`Column ${col.name} added successfully.`);
      } catch (err: any) {
        if (err.code === 'ER_DUP_COLUMN_NAME') {
          console.log(`Column ${col.name} already exists, skipping.`);
        } else {
          throw err;
        }
      }
    }

    console.log('Migration V6 COMPLETED successfully!');
  } catch (error) {
    console.error('Migration V6 FAILED:', error);
  } finally {
    if (connection) connection.release();
    process.exit(0);
  }
};

runMigration();
