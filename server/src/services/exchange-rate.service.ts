import { readPool, writePool } from '../db';
import { RowDataPacket } from 'mysql2';

export const getExchangeRates = async (shopId: string = 'global') => {
  const [rates] = await readPool.query<RowDataPacket[]>(
    'SELECT currency, rate FROM exchange_rates WHERE shop_id = ?', 
    [shopId]
  );
  
  // If no shop-specific rates, fallback to global
  if (rates.length === 0 && shopId !== 'global') {
    const [globalRates] = await readPool.query<RowDataPacket[]>(
      'SELECT currency, rate FROM exchange_rates WHERE shop_id = ?', 
      ['global']
    );
    const ratesMap: Record<string, number> = {};
    for (const row of globalRates) {
      ratesMap[row.currency] = typeof row.rate === 'string' ? parseFloat(row.rate) : row.rate;
    }
    return ratesMap;
  }

  const ratesMap: Record<string, number> = {};
  for (const row of rates) {
    ratesMap[row.currency] = typeof row.rate === 'string' ? parseFloat(row.rate) : row.rate;
  }
  return ratesMap;
};

export const updateExchangeRates = async (rates: Record<string, number>, shopId: string = 'global') => {
  const connection = await writePool.getConnection();
  try {
    await connection.beginTransaction();
    for (const [currency, rate] of Object.entries(rates)) {
      await connection.query(
        'INSERT INTO exchange_rates (currency, shop_id, rate) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE rate = ?',
        [currency, shopId, rate, rate]
      );
    }
    await connection.commit();
  } catch (e) {
    await connection.rollback();
    throw e;
  } finally {
    connection.release();
  }
};
