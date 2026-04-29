"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const migration_v8_1 = require("./migration_v8");
const run = async () => {
    try {
        await (0, migration_v8_1.up)();
        console.log('Migration v8 finished');
        process.exit(0);
    }
    catch (e) {
        console.error('Migration v8 failed', e);
        process.exit(1);
    }
};
run();
