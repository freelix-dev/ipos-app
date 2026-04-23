"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerShop = exports.deleteShop = exports.updateShop = exports.createShop = exports.getShopById = exports.getAllShops = void 0;
const db_1 = require("../db");
const uuid_1 = require("uuid");
const getAllShops = async (ownerId, userId) => {
    let query = 'SELECT s.* FROM shops s';
    const params = [];
    const whereClauses = [];
    if (ownerId) {
        whereClauses.push('s.owner_id = ?');
        params.push(ownerId);
    }
    if (userId) {
        // Check if the user has any specific assignments
        const [assignments] = await db_1.readPool.query('SELECT 1 FROM user_shops WHERE user_id = ? LIMIT 1', [userId]);
        if (assignments.length > 0) {
            // User has specific assignments, so filter
            query += ' JOIN user_shops us ON s.id = us.shop_id';
            whereClauses.push('us.user_id = ?');
            params.push(userId);
        }
    }
    if (whereClauses.length > 0) {
        query += ' WHERE ' + whereClauses.join(' AND ');
    }
    query += ' ORDER BY s.name ASC';
    const [shops] = await db_1.readPool.query(query, params);
    return shops;
};
exports.getAllShops = getAllShops;
const getShopById = async (id) => {
    const [shops] = await db_1.readPool.query('SELECT * FROM shops WHERE id = ?', [id]);
    return shops[0] || null;
};
exports.getShopById = getShopById;
const createShop = async (shopData) => {
    const { name, address, phone, logoPath, owner_id } = shopData;
    const id = (0, uuid_1.v4)();
    await db_1.writePool.query('INSERT INTO shops (id, owner_id, name, address, phone, logoPath) VALUES (?, ?, ?, ?, ?, ?)', [id, owner_id || null, name, address, phone, logoPath || null]);
    return id;
};
exports.createShop = createShop;
const updateShop = async (id, shopData) => {
    const fields = [];
    const values = [];
    if (shopData.name !== undefined) {
        fields.push('name = ?');
        values.push(shopData.name);
    }
    if (shopData.address !== undefined) {
        fields.push('address = ?');
        values.push(shopData.address);
    }
    if (shopData.phone !== undefined) {
        fields.push('phone = ?');
        values.push(shopData.phone);
    }
    if (shopData.logoPath !== undefined) {
        fields.push('logoPath = ?');
        values.push(shopData.logoPath);
    }
    if (fields.length === 0)
        return true;
    values.push(id);
    await db_1.writePool.query(`UPDATE shops SET ${fields.join(', ')} WHERE id = ?`, values);
    return true;
};
exports.updateShop = updateShop;
const deleteShop = async (id) => {
    await db_1.writePool.query('DELETE FROM shops WHERE id = ?', [id]);
    return true;
};
exports.deleteShop = deleteShop;
const registerShop = async (data) => {
    const { shopName, address, phone, ownerName, email, password } = data;
    const shopId = (0, uuid_1.v4)();
    const userId = (0, uuid_1.v4)();
    const connection = await db_1.writePool.getConnection();
    try {
        await connection.beginTransaction();
        // 1. Create User first to get user.id for owner_id
        await connection.query('INSERT INTO users (id, name, email, password, role) VALUES (?, ?, ?, ?, ?)', [userId, ownerName, email, password, 'admin']);
        // 2. Create Shop with owner_id
        await connection.query('INSERT INTO shops (id, owner_id, name, address, phone, logoPath) VALUES (?, ?, ?, ?, ?, ?)', [shopId, userId, shopName, address, phone, data.logoPath || null]);
        // 3. Link user to the shop as their default shop
        await connection.query('UPDATE users SET shop_id = ? WHERE id = ?', [shopId, userId]);
        await connection.commit();
        return { shopId, userId };
    }
    catch (error) {
        await connection.rollback();
        throw error;
    }
    finally {
        connection.release();
    }
};
exports.registerShop = registerShop;
