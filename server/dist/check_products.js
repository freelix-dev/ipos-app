"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const db_1 = require("./db");
async function check() {
    try {
        const [products] = await db_1.readPool.query('SELECT id, name, imagePath FROM products');
        console.log('Products:', JSON.stringify(products, null, 2));
    }
    catch (err) {
        console.error('Error:', err);
    }
    finally {
        process.exit();
    }
}
check();
