import { readPool, writePool } from '../db';
import { RowDataPacket, ResultSetHeader } from 'mysql2';
import path from 'path';
import fs from 'fs';
import { randomUUID } from 'crypto';

const DEFAULT_IMAGES = ['beer_cans.png', 'beer_box.png', 'water_bottle.png', 'blue_cups.png', 'ice_bag.png', 'default.png'];

/**
 * Get all products with joins for shop, category and supplier names
 */
export async function getAllProducts(shopId?: string, ownerId?: string, userId?: string) {
  let query = `
    SELECT p.*, s.name as shop_name, c.name as category_name, sup.name as supplier_name 
    FROM products p 
    LEFT JOIN shops s ON p.shop_id = s.id
    LEFT JOIN categories c ON p.category_id = c.id
    LEFT JOIN suppliers sup ON p.supplier_id = sup.id
  `;
  const params: any[] = [];
  const whereClauses: string[] = [];

  if (shopId) {
    whereClauses.push('p.shop_id = ?');
    params.push(shopId);
  }

  if (ownerId) {
    whereClauses.push('s.owner_id = ?');
    params.push(ownerId);
  }

  if (userId) {
    whereClauses.push(`(
      p.shop_id IN (SELECT shop_id FROM user_shops WHERE user_id = ?) 
      OR p.shop_id = (SELECT shop_id FROM users WHERE id = ?)
    )`);
    params.push(userId, userId);
  }

  if (whereClauses.length > 0) {
    query += ' WHERE ' + whereClauses.join(' AND ');
  }

  const [products] = await readPool.query<RowDataPacket[]>(query, params);
  return products;
}

/**
 * Get a single product by ID
 */
export async function getProductById(id: string) {
  const [products] = await readPool.query<RowDataPacket[]>('SELECT * FROM products WHERE id = ?', [id]);
  return products[0] || null;
}

/**
 * Create a new product
 */
export async function createProduct(productData: any) {
  const { name, price, stock, unit, imagePath, shop_id, category_id, supplier_id, min_stock_level } = productData;
  const id = randomUUID();
  
  await writePool.query<ResultSetHeader>(
    'INSERT INTO products (id, shop_id, name, price, stock, unit, imagePath, category_id, supplier_id, min_stock_level) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
    [id, shop_id || null, name, price, stock, unit || 'pcs', imagePath || 'assets/images/default.png', category_id || null, supplier_id || null, min_stock_level || 5]
  );
  
  return id;
}

/**
 * Update an existing product
 */
export async function updateProduct(id: string, productData: any) {
  const { name, price, stock, unit, imagePath, shop_id, category_id, supplier_id, min_stock_level } = productData;
  const [oldProduct] = await readPool.query<RowDataPacket[]>('SELECT imagePath FROM products WHERE id = ?', [id]);
  
  await writePool.query(
    'UPDATE products SET name = ?, price = ?, stock = ?, unit = ?, imagePath = ?, shop_id = ?, category_id = ?, supplier_id = ?, min_stock_level = ? WHERE id = ?',
    [name, price, stock, unit, imagePath, shop_id || null, category_id || null, supplier_id || null, min_stock_level || 5, id]
  );

  if (oldProduct.length > 0 && oldProduct[0].imagePath !== imagePath) {
    const oldPath = oldProduct[0].imagePath;
    if (!DEFAULT_IMAGES.some(p => oldPath.includes(p))) {
      const fullPath = path.join(__dirname, '../../public', oldPath);
      if (fs.existsSync(fullPath)) fs.unlinkSync(fullPath);
    }
  }
}

/**
 * Delete a product and its associated image
 */
export async function deleteProduct(id: string) {
  const [product] = await readPool.query<RowDataPacket[]>('SELECT imagePath FROM products WHERE id = ?', [id]);
  if (product.length > 0) {
    const imagePath = product[0].imagePath;
    if (!DEFAULT_IMAGES.some(p => imagePath.includes(p))) {
      const fullPath = path.join(__dirname, '../../public', imagePath);
      if (fs.existsSync(fullPath)) fs.unlinkSync(fullPath);
    }
  }
  await writePool.query('DELETE FROM products WHERE id = ?', [id]);
}

/**
 * Update only the stock level
 */
export async function updateStock(id: string, stock: number) {
  await writePool.query('UPDATE products SET stock = ? WHERE id = ?', [stock, id]);
}

/**
 * Get products with stock below threshold
 */
export async function getLowStockProducts(shopId?: string) {
  let query = `
    SELECT p.*, c.name as category_name, sup.name as supplier_name 
    FROM products p
    LEFT JOIN categories c ON p.category_id = c.id
    LEFT JOIN suppliers sup ON p.supplier_id = sup.id
    WHERE p.stock <= p.min_stock_level
  `;
  const params: any[] = [];

  if (shopId) {
    query += ' AND p.shop_id = ?';
    params.push(shopId);
  }

  const [products] = await readPool.query<RowDataPacket[]>(query, params);
  return products;
}

/**
 * Adjust stock manually with logging
 */
export async function adjustStock(id: string, adjustment: number, type: 'Restock' | 'Adjustment', reason: string, userId: string) {
  const connection = await writePool.getConnection();
  try {
    await connection.beginTransaction();

    // 1. Get product to find shop_id
    const [products] = await connection.query<RowDataPacket[]>('SELECT shop_id, stock FROM products WHERE id = ?', [id]);
    if (products.length === 0) throw new Error('Product not found');
    const product = products[0];

    // 2. Update stock
    const newStock = product.stock + adjustment;
    await connection.query('UPDATE products SET stock = ? WHERE id = ?', [newStock, id]);

    // 3. Log history
    await connection.query(
      'INSERT INTO stock_history (product_id, shop_id, change_amount, type, reason, created_by) VALUES (?, ?, ?, ?, ?, ?)',
      [id, product.shop_id, adjustment, type, reason, userId]
    );

    await connection.commit();
    return { success: true, newStock };
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}
