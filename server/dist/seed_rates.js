"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const db_1 = require("./db");
const seedGlobalRates = async () => {
    try {
        console.log('Seeding global exchange rates...');
        await db_1.writePool.query("INSERT IGNORE INTO exchange_rates (currency, shop_id, rate) VALUES (?, ?, ?), (?, ?, ?), (?, ?, ?)", ['LAK', 'global', 1.0, 'THB', 'global', 740.0, 'USD', 'global', 21500.0]);
        console.log('Global rates seeded successfully.');
    }
    catch (error) {
        console.error('Error seeding rates:', error.message);
    }
    finally {
        process.exit();
    }
};
seedGlobalRates();
