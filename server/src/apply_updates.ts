import { writePool } from './db';

async function applyUpdates() {
  try {
    console.log('--- Applying Database Updates ---');

    // 1. ตรวจสอบและเอาคอลัมน์ user_name ออกจากตาราง orders (ถ้ามี)
    try {
      console.log('Checking for old user_name column...');
      await writePool.query('ALTER TABLE orders DROP COLUMN user_name');
      console.log('✅ Removed old user_name column.');
    } catch (e: any) {
      if (e.code === 'ER_CANT_DROP_FIELD_OR_KEY') {
        console.log('ℹ️ Column user_name already removed or does not exist.');
      } else {
        console.warn('⚠️ Note during column drop:', e.message);
      }
    }

    // 2. ปรับปรุง user_id และเพิ่ม Index/Foreign Key
    try {
      console.log('Updating user_id column and adding constraints...');
      // Ensure user_id is the right type
      await writePool.query('ALTER TABLE orders MODIFY COLUMN user_id VARCHAR(36)');
      
      // Try to add foreign key if it doesn't exist
      await writePool.query(`
        ALTER TABLE orders 
        ADD CONSTRAINT fk_order_user 
        FOREIGN KEY (user_id) REFERENCES users(id) 
        ON DELETE SET NULL
      `);
      console.log('✅ Added foreign key constraint.');
    } catch (e: any) {
      if (e.code === 'ER_DUP_CONSTRAINT_NAME' || e.code === 'ER_FK_DUP_NAME') {
        console.log('ℹ️ Foreign key constraint already exists.');
      } else {
        console.warn('⚠️ Skip FK Update:', e.message);
      }
    }

    // 3. เพิ่มพนักงานใหม่ (Seed Users)
    console.log('Seeding users...');
    const users = [
      ['aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Admin User', 'admin@ipos.com', '123', 'admin', ''],
      ['bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Cashier One', 'cashier1@ipos.com', '123', 'staff', ''],
      ['cccccccc-cccc-cccc-cccc-cccccccccccc', 'Cashier Two', 'cashier2@ipos.com', '123', 'staff', '']
    ];

    for (const [id, name, email, password, role, lastLogin] of users) {
      await writePool.query(
        'INSERT IGNORE INTO users (id, name, email, password, role, lastLogin) VALUES (?, ?, ?, ?, ?, ?)',
        [id, name, email, password, role, lastLogin]
      );
    }
    console.log('✅ Users seeded successfully.');

    console.log('\n✨ Database update process finished.');
    process.exit(0);
  } catch (err) {
    console.error('❌ Error applying updates:', err);
    process.exit(1);
  }
}

applyUpdates();
