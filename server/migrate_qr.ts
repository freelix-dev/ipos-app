import { writePool } from './src/db';

async function migrate() {
  try {
    console.log('Starting migration...');
    const [rows]: any = await writePool.query('DESCRIBE receipt_settings');
    const hasColumn = rows.some((row: any) => row.Field === 'qr_image_url');
    
    if (!hasColumn) {
      console.log('Adding column qr_image_url...');
      await writePool.query('ALTER TABLE receipt_settings ADD COLUMN qr_image_url TEXT AFTER qr_data');
      console.log('Column added successfully!');
    } else {
      console.log('Column already exists.');
    }
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    process.exit(0);
  }
}

migrate();
