"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteCoupon = exports.createCoupon = exports.getCoupons = exports.deletePromotion = exports.createPromotion = exports.getPromotions = void 0;
const db_1 = require("../db");
const getPromotions = async (shopId) => {
    const [rows] = await db_1.readPool.query('SELECT * FROM promotions WHERE shop_id = ? ORDER BY created_at DESC', [shopId]);
    return rows;
};
exports.getPromotions = getPromotions;
const createPromotion = async (data) => {
    const [result] = await db_1.writePool.query('INSERT INTO promotions (shop_id, name, description, type, value, min_spend, start_date, end_date, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)', [data.shop_id, data.name, data.description, data.type, data.value, data.min_spend, data.start_date, data.end_date, data.status]);
    return result.insertId;
};
exports.createPromotion = createPromotion;
const deletePromotion = async (id) => {
    await db_1.writePool.query('DELETE FROM promotions WHERE id = ?', [id]);
};
exports.deletePromotion = deletePromotion;
const getCoupons = async (shopId) => {
    const [rows] = await db_1.readPool.query('SELECT * FROM coupons WHERE shop_id = ? ORDER BY created_at DESC', [shopId]);
    return rows;
};
exports.getCoupons = getCoupons;
const createCoupon = async (data) => {
    const [result] = await db_1.writePool.query('INSERT INTO coupons (shop_id, code, discount_type, discount_value, min_purchase, usage_limit, expiry_date, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)', [data.shop_id, data.code, data.discount_type, data.discount_value, data.min_purchase, data.usage_limit, data.expiry_date, data.status]);
    return result.insertId;
};
exports.createCoupon = createCoupon;
const deleteCoupon = async (id) => {
    await db_1.writePool.query('DELETE FROM coupons WHERE id = ?', [id]);
};
exports.deleteCoupon = deleteCoupon;
