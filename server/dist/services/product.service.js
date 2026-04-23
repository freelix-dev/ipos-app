"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateStock = exports.deleteProduct = exports.updateProduct = exports.createProduct = exports.getProductById = exports.getAllProducts = void 0;
const db_1 = require("../db");
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const DEFAULT_IMAGES = ['beer_cans.png', 'beer_box.png', 'water_bottle.png', 'blue_cups.png', 'ice_bag.png', 'default.png'];
const getAllProducts = async () => {
    const [products] = await db_1.readPool.query('SELECT * FROM products');
    return products;
};
exports.getAllProducts = getAllProducts;
const getProductById = async (id) => {
    const [products] = await db_1.readPool.query('SELECT * FROM products WHERE id = ?', [id]);
    return products[0] || null;
};
exports.getProductById = getProductById;
const createProduct = async (productData) => {
    const { name, price, stock, unit, imagePath } = productData;
    const [result] = await db_1.writePool.query('INSERT INTO products (name, price, stock, unit, imagePath) VALUES (?, ?, ?, ?, ?)', [name, price, stock, unit || 'pcs', imagePath || 'assets/images/default.png']);
    return result.insertId;
};
exports.createProduct = createProduct;
const updateProduct = async (id, productData) => {
    const { name, price, stock, unit, imagePath } = productData;
    const [oldProduct] = await db_1.readPool.query('SELECT imagePath FROM products WHERE id = ?', [id]);
    await db_1.writePool.query('UPDATE products SET name = ?, price = ?, stock = ?, unit = ?, imagePath = ? WHERE id = ?', [name, price, stock, unit, imagePath, id]);
    if (oldProduct.length > 0 && oldProduct[0].imagePath !== imagePath) {
        const oldPath = oldProduct[0].imagePath;
        if (!DEFAULT_IMAGES.some(p => oldPath.includes(p))) {
            const fullPath = path_1.default.join(__dirname, '../../public', oldPath);
            if (fs_1.default.existsSync(fullPath))
                fs_1.default.unlinkSync(fullPath);
        }
    }
};
exports.updateProduct = updateProduct;
const deleteProduct = async (id) => {
    const [product] = await db_1.readPool.query('SELECT imagePath FROM products WHERE id = ?', [id]);
    if (product.length > 0) {
        const imagePath = product[0].imagePath;
        if (!DEFAULT_IMAGES.some(p => imagePath.includes(p))) {
            const fullPath = path_1.default.join(__dirname, '../../public', imagePath);
            if (fs_1.default.existsSync(fullPath))
                fs_1.default.unlinkSync(fullPath);
        }
    }
    await db_1.writePool.query('DELETE FROM products WHERE id = ?', [id]);
};
exports.deleteProduct = deleteProduct;
const updateStock = async (id, stock) => {
    await db_1.writePool.query('UPDATE products SET stock = ? WHERE id = ?', [stock, id]);
};
exports.updateStock = updateStock;
