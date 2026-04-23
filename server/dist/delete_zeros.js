"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const db_1 = require("./db");
const deleteZeroRates = async () => {
    try {
        const [result] = await db_1.writePool.query('DELETE FROM exchange_rates WHERE rate = 0');
        console.log('Zero rates deleted:', result);
    }
    catch (error) {
        console.error('Error:', error.message);
    }
    finally {
        process.exit();
    }
};
deleteZeroRates();
