import { writePool } from './db';

const deleteZeroRates = async () => {
  try {
    const [result] = await writePool.query('DELETE FROM exchange_rates WHERE rate = 0');
    console.log('Zero rates deleted:', result);
  } catch (error: any) {
    console.error('Error:', error.message);
  } finally {
    process.exit();
  }
};

deleteZeroRates();
