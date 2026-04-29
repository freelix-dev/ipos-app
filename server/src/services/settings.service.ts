import { readPool, writePool } from '../db';
import { RowDataPacket } from 'mysql2';

export const getSystemSettings = async () => {
  const [settings] = await readPool.query<RowDataPacket[]>('SELECT * FROM system_settings');
  const settingsObj: Record<string, string> = {};
  settings.forEach(s => {
    settingsObj[s.setting_key] = s.setting_value;
  });
  return settingsObj;
};

export const updateSystemSetting = async (key: string, value: string) => {
  await writePool.query(
    'INSERT INTO system_settings (setting_key, setting_value) VALUES (?, ?) ON DUPLICATE KEY UPDATE setting_value = ?',
    [key, value, value]
  );
};

export const updateMultipleSettings = async (settings: Record<string, string>) => {
  const promises = Object.entries(settings).map(([key, value]) => updateSystemSetting(key, value));
  await Promise.all(promises);
};

export const getExchangeRates = async (shopId: string = 'global') => {
  const [rows] = await readPool.query<RowDataPacket[]>(
    'SELECT * FROM exchange_rates WHERE shop_id = ? OR shop_id = "global"',
    [shopId]
  );
  
  // Prefer shop-specific rates over global rates
  const rates: Record<string, number> = {};
  rows.forEach(r => {
    if (!rates[r.currency] || r.shop_id !== 'global') {
      rates[r.currency] = Number(r.rate);
    }
  });
  
  return rates;
};
