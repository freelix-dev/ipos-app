"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.getExchangeRates = exports.adjustStock = exports.getStockHistory = exports.deleteExpense = exports.createExpense = exports.getExpenses = exports.voidOrder = exports.updateAppConfig = exports.updateShopLicense = exports.getLowStock = exports.updateReceiptSettings = exports.getReceiptSettings = exports.getGlobalStats = exports.getDashboardStats = exports.updateSettings = exports.getSettings = exports.getAuditLogs = exports.deleteCategory = exports.updateCategory = exports.createCategory = exports.getCategories = exports.deleteSupplier = exports.updateSupplier = exports.createSupplier = exports.getSuppliers = void 0;
const supplierService = __importStar(require("../services/supplier.service"));
const categoryService = __importStar(require("../services/category.service"));
const productService = __importStar(require("../services/product.service"));
const auditService = __importStar(require("../services/audit.service"));
const settingsService = __importStar(require("../services/settings.service"));
const dashboardService = __importStar(require("../services/dashboard.service"));
const receiptService = __importStar(require("../services/receipt.service"));
const orderService = __importStar(require("../services/order.service"));
const expenseService = __importStar(require("../services/expense.service"));
const db_1 = require("../db");
// Suppliers
const getSuppliers = async (req, res) => {
    try {
        const shopId = req.query.shopId;
        const suppliers = await supplierService.getAllSuppliers(shopId);
        res.json(suppliers);
    }
    catch (error) {
        res.status(500).json({ message: 'Error fetching suppliers', error });
    }
};
exports.getSuppliers = getSuppliers;
const createSupplier = async (req, res) => {
    try {
        const id = await supplierService.createSupplier(req.body);
        res.status(201).json({ message: 'Supplier created', id });
    }
    catch (error) {
        res.status(500).json({ message: 'Error creating supplier', error });
    }
};
exports.createSupplier = createSupplier;
const updateSupplier = async (req, res) => {
    try {
        await supplierService.updateSupplier(req.params.id, req.body);
        res.json({ message: 'Supplier updated successfully' });
    }
    catch (error) {
        res.status(500).json({ message: 'Error updating supplier', error });
    }
};
exports.updateSupplier = updateSupplier;
const deleteSupplier = async (req, res) => {
    try {
        await supplierService.deleteSupplier(req.params.id);
        res.json({ message: 'Supplier deleted successfully' });
    }
    catch (error) {
        res.status(500).json({ message: 'Error deleting supplier', error });
    }
};
exports.deleteSupplier = deleteSupplier;
// Categories
const getCategories = async (req, res) => {
    try {
        const shopId = req.query.shopId;
        const categories = await categoryService.getAllCategories(shopId);
        res.json(categories);
    }
    catch (error) {
        res.status(500).json({ message: 'Error fetching categories', error });
    }
};
exports.getCategories = getCategories;
const createCategory = async (req, res) => {
    try {
        const id = await categoryService.createCategory(req.body);
        res.status(201).json({ message: 'Category created', id });
    }
    catch (error) {
        res.status(500).json({ message: 'Error creating category', error });
    }
};
exports.createCategory = createCategory;
const updateCategory = async (req, res) => {
    try {
        await categoryService.updateCategory(req.params.id, req.body);
        res.json({ message: 'Category updated successfully' });
    }
    catch (error) {
        res.status(500).json({ message: 'Error updating category', error });
    }
};
exports.updateCategory = updateCategory;
const deleteCategory = async (req, res) => {
    try {
        await categoryService.deleteCategory(req.params.id);
        res.json({ message: 'Category deleted successfully' });
    }
    catch (error) {
        res.status(500).json({ message: 'Error deleting category', error });
    }
};
exports.deleteCategory = deleteCategory;
// Audit Logs
const getAuditLogs = async (req, res) => {
    try {
        const filters = {
            shopId: req.query.shopId,
            userId: req.query.userId,
            action: req.query.action,
            startDate: req.query.startDate,
            endDate: req.query.endDate,
        };
        const logs = await auditService.getAuditLogs(filters);
        res.json(logs);
    }
    catch (error) {
        res.status(500).json({ message: 'Error fetching audit logs', error });
    }
};
exports.getAuditLogs = getAuditLogs;
// Settings
const getSettings = async (req, res) => {
    try {
        const settings = await settingsService.getSystemSettings();
        res.json(settings);
    }
    catch (error) {
        res.status(500).json({ message: 'Error fetching settings', error });
    }
};
exports.getSettings = getSettings;
const updateSettings = async (req, res) => {
    try {
        await settingsService.updateMultipleSettings(req.body);
        res.json({ message: 'Settings updated successfully' });
    }
    catch (error) {
        res.status(500).json({ message: 'Error updating settings', error });
    }
};
exports.updateSettings = updateSettings;
// Dashboard Stats
const getDashboardStats = async (req, res) => {
    try {
        const user = req.user;
        let shopId = req.query.shopId;
        // Security Check: Non-system admins can only see their own shop's stats
        const isSystemAdmin = user && !user.shop_id && !user.owner_id;
        if (!isSystemAdmin && user?.shop_id) {
            shopId = user.shop_id; // Override to their own shop
        }
        const stats = await dashboardService.getDashboardStats(shopId);
        res.json(stats);
    }
    catch (error) {
        res.status(500).json({ message: 'Error fetching dashboard stats', error });
    }
};
exports.getDashboardStats = getDashboardStats;
const getGlobalStats = async (req, res) => {
    try {
        const stats = await dashboardService.getGlobalStats();
        res.json(stats);
    }
    catch (error) {
        res.status(500).json({ message: 'Error fetching global stats', error });
    }
};
exports.getGlobalStats = getGlobalStats;
// Receipt Settings
const getReceiptSettings = async (req, res) => {
    try {
        const shopId = req.query.shopId;
        const settings = await receiptService.getReceiptSettings(shopId);
        res.json(settings);
    }
    catch (error) {
        res.status(500).json({ message: 'Error fetching receipt settings', error });
    }
};
exports.getReceiptSettings = getReceiptSettings;
const updateReceiptSettings = async (req, res) => {
    try {
        const user = req.user;
        const { shop_id } = req.body;
        // Security Check: If not system admin, must own the shop or be assigned to it
        const isSystemAdmin = user && !user.shop_id && !user.owner_id;
        if (!isSystemAdmin) {
            // In this system, owner_id or user.id is used to check ownership
            // For simplicity, we can check if the shop belongs to the user's organization
            // Or if the user is directly associated with this shop_id
            if (user.shop_id && user.shop_id !== shop_id) {
                return res.status(403).json({ message: 'Unauthorized: You can only update your own shop settings' });
            }
        }
        await receiptService.updateReceiptSettings(shop_id, req.body);
        res.json({ message: 'Receipt settings updated successfully' });
    }
    catch (error) {
        res.status(500).json({ message: 'Error updating receipt settings', error });
    }
};
exports.updateReceiptSettings = updateReceiptSettings;
// Low Stock
const getLowStock = async (req, res) => {
    try {
        const user = req.user;
        let shopId = req.query.shopId;
        const isSystemAdmin = user && !user.shop_id && !user.owner_id;
        if (!isSystemAdmin && user?.shop_id) {
            shopId = user.shop_id;
        }
        const products = await productService.getLowStockProducts(shopId);
        res.json(products);
    }
    catch (error) {
        res.status(500).json({ message: 'Error fetching low stock products', error });
    }
};
exports.getLowStock = getLowStock;
// Shop License Management
const updateShopLicense = async (req, res) => {
    try {
        const { shop_id, status, license_expiry, plan_type } = req.body;
        await db_1.writePool.query('UPDATE shops SET status = ?, license_expiry = ?, plan_type = ? WHERE id = ?', [status, license_expiry, plan_type, shop_id]);
        res.json({ message: 'Shop license updated successfully' });
    }
    catch (error) {
        res.status(500).json({ message: 'Error updating shop license', error });
    }
};
exports.updateShopLicense = updateShopLicense;
// App Config Management
const updateAppConfig = async (req, res) => {
    try {
        const settings = req.body; // e.g. { app_current_version: '1.2.1', maintenance_mode: 'true' }
        const promises = Object.entries(settings).map(([key, value]) => db_1.writePool.query('INSERT INTO system_settings (setting_key, setting_value) VALUES (?, ?) ON DUPLICATE KEY UPDATE setting_value = ?', [key, value, value]));
        await Promise.all(promises);
        res.json({ message: 'App configuration updated' });
    }
    catch (error) {
        res.status(500).json({ message: 'Error updating app config', error });
    }
};
exports.updateAppConfig = updateAppConfig;
// Void Order
const voidOrder = async (req, res) => {
    try {
        const { orderId, reason } = req.body;
        const user = req.user;
        const voidedBy = user?.id || 'system';
        const result = await orderService.voidOrder(orderId, reason, voidedBy);
        res.json(result);
    }
    catch (error) {
        res.status(500).json({ message: error.message || 'Error voiding order' });
    }
};
exports.voidOrder = voidOrder;
// Expenses
const getExpenses = async (req, res) => {
    try {
        const shopId = req.query.shopId;
        const expenses = await expenseService.getExpenses(shopId);
        res.json(expenses);
    }
    catch (error) {
        res.status(500).json({ message: 'Error fetching expenses', error });
    }
};
exports.getExpenses = getExpenses;
const createExpense = async (req, res) => {
    try {
        const user = req.user;
        const expenseData = { ...req.body, created_by: user?.id };
        const id = await expenseService.addExpense(expenseData);
        res.status(201).json({ message: 'Expense created', id });
    }
    catch (error) {
        res.status(500).json({ message: 'Error creating expense', error });
    }
};
exports.createExpense = createExpense;
const deleteExpense = async (req, res) => {
    try {
        await expenseService.deleteExpense(req.params.id);
        res.json({ message: 'Expense deleted successfully' });
    }
    catch (error) {
        res.status(500).json({ message: 'Error deleting expense', error });
    }
};
exports.deleteExpense = deleteExpense;
// Stock History
const getStockHistory = async (req, res) => {
    try {
        const shopId = req.query.shopId;
        const [rows] = await db_1.readPool.query('SELECT sh.*, p.name as product_name FROM stock_history sh JOIN products p ON sh.product_id = p.id WHERE sh.shop_id = ? ORDER BY sh.created_at DESC LIMIT 100', [shopId]);
        res.json(rows);
    }
    catch (error) {
        res.status(500).json({ message: 'Error fetching stock history', error });
    }
};
exports.getStockHistory = getStockHistory;
// Stock Adjustment
const adjustStock = async (req, res) => {
    try {
        const { productId, adjustment, type, reason } = req.body;
        const user = req.user;
        const userId = user?.id || 'system';
        const result = await productService.adjustStock(productId, adjustment, type, reason, userId);
        res.json(result);
    }
    catch (error) {
        res.status(500).json({ message: error.message || 'Error adjusting stock' });
    }
};
exports.adjustStock = adjustStock;
// Exchange Rates
const getExchangeRates = async (req, res) => {
    try {
        const shopId = req.query.shopId || 'global';
        const rates = await settingsService.getExchangeRates(shopId);
        res.json(rates);
    }
    catch (error) {
        res.status(500).json({ message: 'Error fetching exchange rates', error });
    }
};
exports.getExchangeRates = getExchangeRates;
