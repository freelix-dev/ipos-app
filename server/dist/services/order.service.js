"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.syncOrders = exports.getAllOrders = void 0;
const db_1 = require("../db");
const uuid_1 = require("uuid");
const getAllOrders = async () => {
    const [orders] = await db_1.readPool.query(`
    SELECT o.*, u.name as user_name 
    FROM orders o 
    LEFT JOIN users u ON o.user_id = u.id 
    ORDER BY o.date DESC 
    LIMIT 100
  `);
    return orders;
};
exports.getAllOrders = getAllOrders;
const syncOrders = async (ordersToProcess) => {
    const connection = await db_1.writePool.getConnection();
    try {
        await connection.beginTransaction();
        console.log(`[order.service] Starting sync for ${ordersToProcess.length} orders`);
        for (const incomingOrder of ordersToProcess) {
            try {
                let items = typeof incomingOrder.itemsJson === 'string' ? incomingOrder.itemsJson : JSON.stringify(incomingOrder.itemsJson || []);
                const parsedItems = typeof incomingOrder.itemsJson === 'string' ? JSON.parse(incomingOrder.itemsJson) : (incomingOrder.itemsJson || []);
                const { date, total, status, currency, paymentMethod, amountReceived, changeAmount, remark } = incomingOrder;
                const id = (incomingOrder.id && incomingOrder.id.length >= 32) ? incomingOrder.id : (0, uuid_1.v4)();
                const syncedAt = new Date().toISOString().slice(0, 19).replace('T', ' ');
                let user_id = incomingOrder.user_id || incomingOrder.userId || null;
                // Final foreign key safety check
                if (user_id) {
                    const [userExists] = await connection.query('SELECT id FROM users WHERE id = ?', [user_id]);
                    if (userExists.length === 0) {
                        console.warn(`[order.service] Warning: User ${user_id} not found. Setting user_id to null for order ${id}`);
                        user_id = null;
                    }
                }
                console.log(`[order.service] Processing order ${id} (Status: ${status}, User: ${user_id})`);
                const [existing] = await connection.query('SELECT status FROM orders WHERE id = ?', [id]);
                if (existing.length > 0) {
                    const oldStatus = existing[0].status;
                    await connection.query(`UPDATE orders SET status = ?, remark = ?, user_id = ?, syncedAt = ? WHERE id = ?`, [status, remark || null, user_id, syncedAt, id]);
                    if (status === 'Cancelled' && oldStatus !== 'Cancelled') {
                        for (const item of parsedItems) {
                            await connection.query('UPDATE products SET stock = stock + ? WHERE id = ? OR name = ?', [item.quantity, item.id, item.name]);
                        }
                    }
                }
                else {
                    await connection.query(`INSERT INTO orders (id, date, total, status, currency, paymentMethod, itemsJson, amountReceived, changeAmount, remark, user_id, syncedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, [id, new Date(date), total, status, currency, paymentMethod, items, amountReceived || 0, changeAmount || 0, remark || null, user_id, new Date(syncedAt)]);
                    if (status === 'Completed') {
                        for (const item of parsedItems) {
                            await connection.query('UPDATE products SET stock = stock - ? WHERE id = ? OR name = ?', [item.quantity, item.id, item.name]);
                        }
                    }
                }
            }
            catch (orderError) {
                console.error(`[order.service] Error processing order ${incomingOrder.id}:`, orderError);
                throw orderError; // Rethrow to trigger rollback
            }
        }
        await connection.commit();
        console.log('[order.service] Transaction committed successfully');
        // Fix: Using double array for IN clause
        const ids = ordersToProcess.map(o => o.id).filter(id => id);
        if (ids.length > 0) {
            const [savedOrders] = await connection.query('SELECT id FROM orders WHERE id IN (?)', [ids]);
            return { count: ordersToProcess.length, orders: savedOrders };
        }
        return { count: ordersToProcess.length, orders: [] };
    }
    catch (error) {
        console.error('[order.service] General sync error:', error);
        await connection.rollback();
        throw error;
    }
    finally {
        connection.release();
    }
};
exports.syncOrders = syncOrders;
