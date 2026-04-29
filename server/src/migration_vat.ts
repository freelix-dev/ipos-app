import { writePool } from './db';

async function migrate() {
    console.log('Starting VAT migration...');
    try {
        await writePool.query(`
            ALTER TABLE shops 
            ADD COLUMN vat_rate DECIMAL(5,2) DEFAULT 0.00,
            ADD COLUMN vat_enabled BOOLEAN DEFAULT FALSE
        `);
        console.log('VAT migration completed successfully.');
    } catch (error) {
        console.error('Migration failed:', error);
    } finally {
        process.exit();
    }
}

migrate();
