"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const db_1 = require("./db");
async function debugJoin() {
    try {
        console.log('--- Checking Users ---');
        const [users] = await db_1.readPool.query('SELECT id, name, email FROM users');
        console.table(users);
        console.log('\n--- Checking Orders and their User IDs ---');
        const [orders] = await db_1.readPool.query('SELECT id, order_no, user_id FROM orders LIMIT 10');
        console.table(orders);
        console.log('\n--- Testing JOIN Query ---');
        const [joined] = await db_1.readPool.query(`
      SELECT o.id, o.order_no, o.user_id, u.name as joined_user_name
      FROM orders o
      LEFT JOIN users u ON o.user_id = u.id
      LIMIT 10
    `);
        console.table(joined);
        const missingUsers = joined.filter(row => row.user_id && !row.joined_user_name);
        if (missingUsers.length > 0) {
            console.log('\n⚠️ ALERT: Found orders with user_ids that DO NOT exist in users table:');
            console.log(missingUsers);
        }
        else {
            console.log('\n✅ Success: All orders with user_ids match correctly with users table.');
        }
        process.exit(0);
    }
    catch (err) {
        console.error('Error during debug:', err);
        process.exit(1);
    }
}
debugJoin();
