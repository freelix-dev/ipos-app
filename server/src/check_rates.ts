import { readPool } from './db';

const checkData = async () => {
  try {
    const [rows] = await readPool.query('SELECT * FROM exchange_rates');
    console.log('Exchange Rates in DB:', rows);
  } catch (error: any) {
    console.error('Error:', error.message);
  } finally {
    process.exit();
  }
};

checkData();
