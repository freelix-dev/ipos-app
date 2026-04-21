import { writePool } from './db';
import { RowDataPacket } from 'mysql2';

async function testWriteAccess() {
  try {
    console.log('Testing Write Pool access...');
    const [dbName] = await writePool.query<RowDataPacket[]>('SELECT DATABASE() as db');
    console.log('Connected to Database:', dbName[0].db);

    console.log('\nListing tables for app_write:');
    const [tables] = await writePool.query<RowDataPacket[]>('SHOW TABLES');
    console.table(tables);

    process.exit(0);
  } catch (err) {
    console.error('❌ Write Pool Error:', err);
    process.exit(1);
  }
}

testWriteAccess();
