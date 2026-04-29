"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteSupplier = exports.updateSupplier = exports.createSupplier = exports.getSupplierById = exports.getAllSuppliers = void 0;
const db_1 = require("../db");
const crypto_1 = require("crypto");
const getAllSuppliers = async (shopId) => {
    let query = 'SELECT * FROM suppliers';
    const params = [];
    if (shopId) {
        query += ' WHERE shop_id = ?';
        params.push(shopId);
    }
    const [suppliers] = await db_1.readPool.query(query, params);
    return suppliers;
};
exports.getAllSuppliers = getAllSuppliers;
const getSupplierById = async (id) => {
    const [suppliers] = await db_1.readPool.query('SELECT * FROM suppliers WHERE id = ?', [id]);
    return suppliers[0] || null;
};
exports.getSupplierById = getSupplierById;
const createSupplier = async (supplierData) => {
    const { shop_id, name, contact_name, phone, email, address } = supplierData;
    const id = (0, crypto_1.randomUUID)();
    await db_1.writePool.query('INSERT INTO suppliers (id, shop_id, name, contact_name, phone, email, address) VALUES (?, ?, ?, ?, ?, ?, ?)', [id, shop_id || null, name, contact_name || null, phone || null, email || null, address || null]);
    return id;
};
exports.createSupplier = createSupplier;
const updateSupplier = async (id, supplierData) => {
    const { name, contact_name, phone, email, address, shop_id } = supplierData;
    await db_1.writePool.query('UPDATE suppliers SET name = ?, contact_name = ?, phone = ?, email = ?, address = ?, shop_id = ? WHERE id = ?', [name, contact_name || null, phone || null, email || null, address || null, shop_id || null, id]);
};
exports.updateSupplier = updateSupplier;
const deleteSupplier = async (id) => {
    await db_1.writePool.query('DELETE FROM suppliers WHERE id = ?', [id]);
};
exports.deleteSupplier = deleteSupplier;
