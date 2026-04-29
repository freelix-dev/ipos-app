import { writePool } from './db';

async function migrate() {
  console.log('Starting Migration V5 (Categories & Product Relations)...');
  
  try {
    // 1. Create categories table
    await writePool.query(`
      CREATE TABLE IF NOT EXISTS categories (
        id VARCHAR(36) PRIMARY KEY,
        shop_id VARCHAR(36),
        name VARCHAR(255) NOT NULL,
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (shop_id) REFERENCES shops(id) ON DELETE CASCADE
      )
    `);
    console.log('Table "categories" created/verified.');

    // 2. Add category_id and supplier_id to products
    // Check if columns exist first to prevent errors on rerun
    const [columns] = await writePool.query('SHOW COLUMNS FROM products');
    const columnNames = (columns as any[]).map(c => c.Field);

    if (!columnNames.includes('category_id')) {
      await writePool.query('ALTER TABLE products ADD COLUMN category_id VARCHAR(36) AFTER shop_id');
      console.log('Column "category_id" added to products.');
    }

    if (!columnNames.includes('supplier_id')) {
      await writePool.query('ALTER TABLE products ADD COLUMN supplier_id VARCHAR(36) AFTER category_id');
      console.log('Column "supplier_id" added to products.');
    }

    // 3. Add foreign keys if they don't exist
    // Note: In some MySQL environments, it's safer to just check or try-catch
    try {
      await writePool.query('ALTER TABLE products ADD CONSTRAINT fk_product_category FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL');
      await writePool.query('ALTER TABLE products ADD CONSTRAINT fk_product_supplier FOREIGN KEY (supplier_id) REFERENCES suppliers(id) ON DELETE SET NULL');
      console.log('Foreign key constraints added to products.');
    } catch (e) {
      console.log('Foreign keys might already exist, skipping constraint addition.');
    }

    console.log('Migration V5 completed successfully.');
  } catch (error) {
    console.error('Migration V5 failed:', error);
  } finally {
    process.exit();
  }
}

migrate();
