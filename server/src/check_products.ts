import { readPool } from './db';

async function check() {
  try {
    const [products] = await readPool.query('SELECT id, name, imagePath FROM products');
    console.log('Products:', JSON.stringify(products, null, 2));
  } catch (err) {
    console.error('Error:', err);
  } finally {
    process.exit();
  }
}

check();
