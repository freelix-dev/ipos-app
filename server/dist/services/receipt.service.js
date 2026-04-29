"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateReceiptSettings = exports.getReceiptSettings = void 0;
const db_1 = require("../db");
const getReceiptSettings = async (shopId) => {
    if (!shopId) {
        // Get global settings (if we want a fallback) or just return null
        return null;
    }
    const [settings] = await db_1.readPool.query('SELECT * FROM receipt_settings WHERE shop_id = ?', [shopId]);
    return settings[0] || null;
};
exports.getReceiptSettings = getReceiptSettings;
const updateReceiptSettings = async (shopId, settingsData) => {
    const { logo_enabled, logo_path, header_text, footer_text, show_phone, show_address, show_order_id, show_staff_name, show_qr, qr_data, font_size } = settingsData;
    await db_1.writePool.query(`INSERT INTO receipt_settings (
      shop_id, logo_enabled, logo_path, header_text, footer_text, 
      show_phone, show_address, show_order_id, show_staff_name, 
      show_qr, qr_data, font_size
     )
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
     ON DUPLICATE KEY UPDATE 
       logo_enabled = VALUES(logo_enabled),
       logo_path = VALUES(logo_path),
       header_text = VALUES(header_text),
       footer_text = VALUES(footer_text),
       show_phone = VALUES(show_phone),
       show_address = VALUES(show_address),
       show_order_id = VALUES(show_order_id),
       show_staff_name = VALUES(show_staff_name),
       show_qr = VALUES(show_qr),
       qr_data = VALUES(qr_data),
       font_size = VALUES(font_size)`, [
        shopId, logo_enabled, logo_path, header_text, footer_text,
        show_phone, show_address, show_order_id, show_staff_name,
        show_qr, qr_data, font_size
    ]);
};
exports.updateReceiptSettings = updateReceiptSettings;
