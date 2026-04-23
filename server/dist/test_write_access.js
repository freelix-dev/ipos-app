"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const db_1 = require("./db");
async function testWriteAccess() {
    try {
        console.log('Testing Write Pool access...');
        const [dbName] = await db_1.writePool.query('SELECT DATABASE() as db');
        console.log('Connected to Database:', dbName[0].db);
        console.log('\nListing tables for app_write:');
        const [tables] = await db_1.writePool.query('SHOW TABLES');
        console.table(tables);
        process.exit(0);
    }
    catch (err) {
        console.error('❌ Write Pool Error:', err);
        process.exit(1);
    }
}
testWriteAccess();
