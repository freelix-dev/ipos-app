"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteCategory = exports.updateCategory = exports.createCategory = exports.getCategoryById = exports.getAllCategories = void 0;
const db_1 = require("../db");
const crypto_1 = require("crypto");
const getAllCategories = async (shopId) => {
    let query = 'SELECT * FROM categories';
    const params = [];
    if (shopId) {
        query += ' WHERE shop_id = ?';
        params.push(shopId);
    }
    const [categories] = await db_1.readPool.query(query, params);
    return categories;
};
exports.getAllCategories = getAllCategories;
const getCategoryById = async (id) => {
    const [categories] = await db_1.readPool.query('SELECT * FROM categories WHERE id = ?', [id]);
    return categories[0] || null;
};
exports.getCategoryById = getCategoryById;
const createCategory = async (categoryData) => {
    const { shop_id, name, description } = categoryData;
    const id = (0, crypto_1.randomUUID)();
    await db_1.writePool.query('INSERT INTO categories (id, shop_id, name, description) VALUES (?, ?, ?, ?)', [id, shop_id || null, name, description || null]);
    return id;
};
exports.createCategory = createCategory;
const updateCategory = async (id, categoryData) => {
    const { name, description, shop_id } = categoryData;
    await db_1.writePool.query('UPDATE categories SET name = ?, description = ?, shop_id = ? WHERE id = ?', [name, description || null, shop_id || null, id]);
};
exports.updateCategory = updateCategory;
const deleteCategory = async (id) => {
    await db_1.writePool.query('DELETE FROM categories WHERE id = ?', [id]);
};
exports.deleteCategory = deleteCategory;
