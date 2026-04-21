import { readPool } from '../db';
import { RowDataPacket } from 'mysql2';

export const getExchangeRates = async () => {
  const [rates] = await readPool.query<RowDataPacket[]>('SELECT currency, rate FROM exchange_rates');
  const ratesMap: Record<string, number> = {};
  for (const row of rates) {
    ratesMap[row.currency] = typeof row.rate === 'string' ? parseFloat(row.rate) : row.rate;
  }
  return ratesMap;
};
