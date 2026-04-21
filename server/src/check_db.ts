import { readPool } from './db';

async function check() {
  try {
    console.log('Checking tables...');
    const [rows] = await readPool.query('SHOW TABLES');
    console.log('Tables:', rows);

    const [products] = await readPool.query('SELECT COUNT(*) as count FROM products');
    console.log('Products count:', products);
  } catch (err) {
    console.error('Error:', err);
  } finally {
    process.exit();
  }
}

check();
