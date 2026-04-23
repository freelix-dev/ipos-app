import { writePool } from './db';

const seedGlobalRates = async () => {
  try {
    console.log('Seeding global exchange rates...');
    await writePool.query(
      "INSERT IGNORE INTO exchange_rates (currency, shop_id, rate) VALUES (?, ?, ?), (?, ?, ?), (?, ?, ?)",
      ['LAK', 'global', 1.0, 'THB', 'global', 740.0, 'USD', 'global', 21500.0]
    );
    console.log('Global rates seeded successfully.');
  } catch (error: any) {
    console.error('Error seeding rates:', error.message);
  } finally {
    process.exit();
  }
};

seedGlobalRates();
