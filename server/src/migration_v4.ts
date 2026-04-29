import { writePool } from './db';

const runMigration = async () => {
  console.log('Connecting to database for Migration V4 (Advanced Admin Features)...');

  let connection;
  try {
    connection = await writePool.getConnection();

    // 1. Update Products for Low Stock Alerts
    console.log('Updating products table...');
    try {
      await connection.query('ALTER TABLE products ADD COLUMN min_stock_level INT DEFAULT 5');
    } catch (e: any) {
      if (e.code === 'ER_DUP_FIELDNAME') console.log('Column min_stock_level already exists.');
      else throw e;
    }

    // 2. Update Shops for License Management
    console.log('Updating shops table...');
    try {
      await connection.query(`
        ALTER TABLE shops 
        ADD COLUMN status ENUM('Active', 'Suspended', 'Expired') DEFAULT 'Active',
        ADD COLUMN license_expiry DATETIME DEFAULT (DATE_ADD(CURRENT_TIMESTAMP, INTERVAL 1 YEAR)),
        ADD COLUMN plan_type VARCHAR(20) DEFAULT 'Premium'
      `);
    } catch (e: any) {
      if (e.code === 'ER_DUP_FIELDNAME') console.log('Shop columns already exist.');
      else throw e;
    }

    // 3. App Configuration
    console.log('Seeding app configuration to system_settings...');
    const appSettings = [
      ['app_min_version', '1.0.0'],
      ['app_current_version', '1.2.0'],
      ['force_update', 'false'],
      ['maintenance_mode', 'false'],
      ['maintenance_message', 'System is under maintenance. Please try again later.'],
      ['support_phone', '+856 20 12345678']
    ];

    for (const [key, value] of appSettings) {
      await connection.query(
        'INSERT IGNORE INTO system_settings (setting_key, setting_value) VALUES (?, ?)',
        [key, value]
      );
    }

    console.log('Migration V4 COMPLETED successfully!');
  } catch (error) {
    console.error('Migration V4 FAILED:', error);
  } finally {
    if (connection) connection.release();
    process.exit(0);
  }
};

runMigration();
