import { readPool } from './db';

async function checkSettings() {
    try {
        const [rows] = await readPool.query('SELECT * FROM system_settings');
        console.log('Current System Settings:');
        console.table(rows);
    } catch (error) {
        console.error('Error:', error);
    } finally {
        process.exit();
    }
}

checkSettings();
