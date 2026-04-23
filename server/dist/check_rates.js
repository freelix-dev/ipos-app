"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const db_1 = require("./db");
const checkData = async () => {
    try {
        const [rows] = await db_1.readPool.query('SELECT * FROM exchange_rates');
        console.log('Exchange Rates in DB:', rows);
    }
    catch (error) {
        console.error('Error:', error.message);
    }
    finally {
        process.exit();
    }
};
checkData();
