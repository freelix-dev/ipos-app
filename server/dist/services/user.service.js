"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteUser = exports.updateUser = exports.ensureAdminExists = exports.findUserByEmailAndPassword = exports.createUser = exports.getAllUsers = void 0;
const db_1 = require("../db");
const uuid_1 = require("uuid");
const getAllUsers = async (shopId, ownerId) => {
    let query = `
    SELECT u.id, u.shop_id, u.owner_id, u.email, u.name, u.role, 
           s.name as shop_name,
           GROUP_CONCAT(us_all.shop_id) as assigned_shop_ids
    FROM users u 
    LEFT JOIN shops s ON u.shop_id = s.id
    LEFT JOIN user_shops us ON u.id = us.user_id
    LEFT JOIN user_shops us_all ON u.id = us_all.user_id
  `;
    const params = [];
    const whereClauses = [];
    if (shopId) {
        whereClauses.push('(u.shop_id = ? OR us.shop_id = ?)');
        params.push(shopId, shopId);
    }
    if (ownerId) {
        whereClauses.push('u.owner_id = ?');
        params.push(ownerId);
    }
    if (whereClauses.length > 0) {
        query += ' WHERE ' + whereClauses.join(' AND ');
    }
    query += ' GROUP BY u.id';
    const [users] = await db_1.readPool.query(query, params);
    // Transform assigned_shop_ids string into array and ensure primary shop_id is included
    return users.map(u => {
        const shopIdsSet = new Set();
        if (u.shop_id)
            shopIdsSet.add(u.shop_id);
        if (u.assigned_shop_ids) {
            u.assigned_shop_ids.split(',').forEach((id) => shopIdsSet.add(id));
        }
        return {
            ...u,
            assigned_shop_ids: Array.from(shopIdsSet)
        };
    });
};
exports.getAllUsers = getAllUsers;
const createUser = async (userData) => {
    const { name, email, password, role, owner_id, shop_ids } = userData;
    const id = (0, uuid_1.v4)();
    // If only one shop is selected, set it as primary shop_id too
    const primaryShopId = (shop_ids && shop_ids.length === 1) ? shop_ids[0] : null;
    const connection = await db_1.writePool.getConnection();
    try {
        await connection.beginTransaction();
        await connection.query('INSERT INTO users (id, shop_id, owner_id, name, email, password, role) VALUES (?, ?, ?, ?, ?, ?, ?)', [id, primaryShopId, owner_id || null, name, email, password, role || 'user']);
        // Save all shop assignments
        if (shop_ids && Array.isArray(shop_ids)) {
            for (const sId of shop_ids) {
                await connection.query('INSERT INTO user_shops (user_id, shop_id) VALUES (?, ?)', [id, sId]);
            }
        }
        await connection.commit();
        return id;
    }
    catch (error) {
        await connection.rollback();
        throw error;
    }
    finally {
        connection.release();
    }
};
exports.createUser = createUser;
const findUserByEmailAndPassword = async (email, password) => {
    const [users] = await db_1.readPool.query(`SELECT u.id, u.shop_id, u.owner_id, u.email, u.name, u.role, s.name as shop_name 
     FROM users u 
     LEFT JOIN shops s ON u.shop_id = s.id 
     WHERE u.email = ? AND u.password = ? LIMIT 1`, [email, password]);
    const user = users[0];
    if (user) {
        // Fetch assigned shops if any
        const [userShops] = await db_1.readPool.query('SELECT shop_id FROM user_shops WHERE user_id = ?', [user.id]);
        user.assigned_shop_ids = userShops.map(us => us.shop_id);
    }
    return user || null;
};
exports.findUserByEmailAndPassword = findUserByEmailAndPassword;
const ensureAdminExists = async () => {
    const email = 'admin@ipos.com';
    const password = '123';
    const [[existing]] = await db_1.readPool.query('SELECT id FROM users WHERE email = ? LIMIT 1', [email]);
    if (!existing) {
        const id = (0, uuid_1.v4)();
        await db_1.writePool.query('INSERT IGNORE INTO users (id, email, password, name, role) VALUES (?,?,?,?,?)', [id, email, password, 'Admin User', 'admin']);
        return { id, email, name: 'Admin User', role: 'admin' };
    }
    const [[user]] = await db_1.readPool.query('SELECT id, email, name, role FROM users WHERE email = ? LIMIT 1', [email]);
    return user;
};
exports.ensureAdminExists = ensureAdminExists;
const updateUser = async (id, userData) => {
    const { name, email, role, password, shop_ids } = userData;
    // If only one shop is selected, set it as primary shop_id too
    const primaryShopId = (shop_ids && shop_ids.length === 1) ? shop_ids[0] : null;
    const connection = await db_1.writePool.getConnection();
    try {
        await connection.beginTransaction();
        // Build update query dynamically to only include password if provided
        let query = 'UPDATE users SET name = ?, email = ?, role = ?, shop_id = ?';
        const params = [name, email, role, primaryShopId];
        if (password && password.trim() !== '') {
            query += ', password = ?';
            params.push(password);
        }
        query += ' WHERE id = ?';
        params.push(id);
        await connection.query(query, params);
        // Update shop assignments
        await connection.query('DELETE FROM user_shops WHERE user_id = ?', [id]);
        if (shop_ids && Array.isArray(shop_ids)) {
            for (const sId of shop_ids) {
                await connection.query('INSERT INTO user_shops (user_id, shop_id) VALUES (?, ?)', [id, sId]);
            }
        }
        await connection.commit();
        return true;
    }
    catch (error) {
        await connection.rollback();
        throw error;
    }
    finally {
        connection.release();
    }
};
exports.updateUser = updateUser;
const deleteUser = async (id) => {
    const connection = await db_1.writePool.getConnection();
    try {
        await connection.beginTransaction();
        await connection.query('DELETE FROM user_shops WHERE user_id = ?', [id]);
        await connection.query('DELETE FROM users WHERE id = ?', [id]);
        await connection.commit();
        return true;
    }
    catch (error) {
        await connection.rollback();
        throw error;
    }
    finally {
        connection.release();
    }
};
exports.deleteUser = deleteUser;
