"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAuditLogs = exports.createAuditLog = void 0;
const db_1 = require("../db");
const crypto_1 = require("crypto");
const createAuditLog = async (logData) => {
    const { user_id, shop_id, action, target_type, target_id, details, ip_address } = logData;
    const id = (0, crypto_1.randomUUID)();
    try {
        await db_1.writePool.query('INSERT INTO audit_logs (id, user_id, shop_id, action, target_type, target_id, details, ip_address) VALUES (?, ?, ?, ?, ?, ?, ?, ?)', [id, user_id || null, shop_id || null, action, target_type || null, target_id || null, details || null, ip_address || null]);
    }
    catch (error) {
        console.error('Failed to create audit log:', error);
    }
};
exports.createAuditLog = createAuditLog;
const getAuditLogs = async (filters) => {
    let query = 'SELECT al.*, u.name as user_name, s.name as shop_name FROM audit_logs al LEFT JOIN users u ON al.user_id = u.id LEFT JOIN shops s ON al.shop_id = s.id';
    const params = [];
    const whereClauses = [];
    if (filters.shopId) {
        whereClauses.push('al.shop_id = ?');
        params.push(filters.shopId);
    }
    if (filters.userId) {
        whereClauses.push('al.user_id = ?');
        params.push(filters.userId);
    }
    if (filters.action) {
        whereClauses.push('al.action LIKE ?');
        params.push(`%${filters.action}%`);
    }
    if (filters.startDate) {
        whereClauses.push('al.created_at >= ?');
        params.push(filters.startDate);
    }
    if (filters.endDate) {
        whereClauses.push('al.created_at <= ?');
        params.push(filters.endDate);
    }
    if (whereClauses.length > 0) {
        query += ' WHERE ' + whereClauses.join(' AND ');
    }
    query += ' ORDER BY al.created_at DESC LIMIT 500';
    const [logs] = await db_1.readPool.query(query, params);
    return logs;
};
exports.getAuditLogs = getAuditLogs;
