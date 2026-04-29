"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getExchangeRates = exports.updateMultipleSettings = exports.updateSystemSetting = exports.getSystemSettings = void 0;
const db_1 = require("../db");
const getSystemSettings = async () => {
    const [settings] = await db_1.readPool.query('SELECT * FROM system_settings');
    const settingsObj = {};
    settings.forEach(s => {
        settingsObj[s.setting_key] = s.setting_value;
    });
    return settingsObj;
};
exports.getSystemSettings = getSystemSettings;
const updateSystemSetting = async (key, value) => {
    await db_1.writePool.query('INSERT INTO system_settings (setting_key, setting_value) VALUES (?, ?) ON DUPLICATE KEY UPDATE setting_value = ?', [key, value, value]);
};
exports.updateSystemSetting = updateSystemSetting;
const updateMultipleSettings = async (settings) => {
    const promises = Object.entries(settings).map(([key, value]) => (0, exports.updateSystemSetting)(key, value));
    await Promise.all(promises);
};
exports.updateMultipleSettings = updateMultipleSettings;
const getExchangeRates = async (shopId = 'global') => {
    const [rows] = await db_1.readPool.query('SELECT * FROM exchange_rates WHERE shop_id = ? OR shop_id = "global"', [shopId]);
    // Prefer shop-specific rates over global rates
    const rates = {};
    rows.forEach(r => {
        if (!rates[r.currency] || r.shop_id !== 'global') {
            rates[r.currency] = Number(r.rate);
        }
    });
    return rates;
};
exports.getExchangeRates = getExchangeRates;
