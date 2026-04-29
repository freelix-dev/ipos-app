"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteExpense = exports.addExpense = exports.getExpenses = void 0;
const db_1 = require("../db");
const getExpenses = async (shopId) => {
    const params = [];
    let query = 'SELECT * FROM expenses';
    if (shopId) {
        query += ' WHERE shop_id = ?';
        params.push(shopId);
    }
    query += ' ORDER BY date DESC';
    const [rows] = await db_1.readPool.query(query, params);
    return rows;
};
exports.getExpenses = getExpenses;
const addExpense = async (expenseData) => {
    const { shop_id, category, amount, description, date, created_by } = expenseData;
    const [result] = await db_1.writePool.query('INSERT INTO expenses (shop_id, category, amount, description, date, created_by) VALUES (?, ?, ?, ?, ?, ?)', [shop_id, category, amount, description, date || new Date(), created_by]);
    return result.insertId;
};
exports.addExpense = addExpense;
const deleteExpense = async (id) => {
    await db_1.writePool.query('DELETE FROM expenses WHERE id = ?', [id]);
};
exports.deleteExpense = deleteExpense;
