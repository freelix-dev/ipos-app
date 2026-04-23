"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getExchangeRates = void 0;
const db_1 = require("../db");
const getExchangeRates = async () => {
    const [rates] = await db_1.readPool.query('SELECT currency, rate FROM exchange_rates');
    const ratesMap = {};
    for (const row of rates) {
        ratesMap[row.currency] = typeof row.rate === 'string' ? parseFloat(row.rate) : row.rate;
    }
    return ratesMap;
};
exports.getExchangeRates = getExchangeRates;
