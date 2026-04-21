import { readPool, writePool } from '../db';
import { RowDataPacket, ResultSetHeader } from 'mysql2';
import path from 'path';
import fs from 'fs';

const DEFAULT_IMAGES = ['beer_cans.png', 'beer_box.png', 'water_bottle.png', 'blue_cups.png', 'ice_bag.png', 'default.png'];

export const getAllProducts = async () => {
  const [products] = await readPool.query<RowDataPacket[]>('SELECT * FROM products');
  return products;
};

export const getProductById = async (id: string) => {
  const [products] = await readPool.query<RowDataPacket[]>('SELECT * FROM products WHERE id = ?', [id]);
  return products[0] || null;
};

export const createProduct = async (productData: any) => {
  const { name, price, stock, unit, imagePath } = productData;
  const [result] = await writePool.query<ResultSetHeader>(
    'INSERT INTO products (name, price, stock, unit, imagePath) VALUES (?, ?, ?, ?, ?)',
    [name, price, stock, unit || 'pcs', imagePath || 'assets/images/default.png']
  );
  return result.insertId;
};

export const updateProduct = async (id: string, productData: any) => {
  const { name, price, stock, unit, imagePath } = productData;
  const [oldProduct] = await readPool.query<RowDataPacket[]>('SELECT imagePath FROM products WHERE id = ?', [id]);
  
  await writePool.query(
    'UPDATE products SET name = ?, price = ?, stock = ?, unit = ?, imagePath = ? WHERE id = ?',
    [name, price, stock, unit, imagePath, id]
  );

  if (oldProduct.length > 0 && oldProduct[0].imagePath !== imagePath) {
    const oldPath = oldProduct[0].imagePath;
    if (!DEFAULT_IMAGES.some(p => oldPath.includes(p))) {
      const fullPath = path.join(__dirname, '../../public', oldPath);
      if (fs.existsSync(fullPath)) fs.unlinkSync(fullPath);
    }
  }
};

export const deleteProduct = async (id: string) => {
  const [product] = await readPool.query<RowDataPacket[]>('SELECT imagePath FROM products WHERE id = ?', [id]);
  if (product.length > 0) {
    const imagePath = product[0].imagePath;
    if (!DEFAULT_IMAGES.some(p => imagePath.includes(p))) {
      const fullPath = path.join(__dirname, '../../public', imagePath);
      if (fs.existsSync(fullPath)) fs.unlinkSync(fullPath);
    }
  }
  await writePool.query('DELETE FROM products WHERE id = ?', [id]);
};

export const updateStock = async (id: string, stock: number) => {
  await writePool.query('UPDATE products SET stock = ? WHERE id = ?', [stock, id]);
};


