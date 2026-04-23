"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateExchangeRates = exports.getExchangeRates = void 0;
const db_1 = require("../db");
const getExchangeRates = async (shopId = 'global') => {
    const [rates] = await db_1.readPool.query('SELECT currency, rate FROM exchange_rates WHERE shop_id = ?', [shopId]);
    // If no shop-specific rates, fallback to global
    if (rates.length === 0 && shopId !== 'global') {
        const [globalRates] = await db_1.readPool.query('SELECT currency, rate FROM exchange_rates WHERE shop_id = ?', ['global']);
        const ratesMap = {};
        for (const row of globalRates) {
            ratesMap[row.currency] = typeof row.rate === 'string' ? parseFloat(row.rate) : row.rate;
        }
        return ratesMap;
    }
    const ratesMap = {};
    for (const row of rates) {
        ratesMap[row.currency] = typeof row.rate === 'string' ? parseFloat(row.rate) : row.rate;
    }
    return ratesMap;
};
exports.getExchangeRates = getExchangeRates;
const updateExchangeRates = async (rates, shopId = 'global') => {
    const connection = await db_1.writePool.getConnection();
    try {
        await connection.beginTransaction();
        for (const [currency, rate] of Object.entries(rates)) {
            await connection.query('INSERT INTO exchange_rates (currency, shop_id, rate) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE rate = ?', [currency, shopId, rate, rate]);
        }
        await connection.commit();
    }
    catch (e) {
        await connection.rollback();
        throw e;
    }
    finally {
        connection.release();
    }
};
exports.updateExchangeRates = updateExchangeRates;
