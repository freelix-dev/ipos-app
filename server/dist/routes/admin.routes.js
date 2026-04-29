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
const express_1 = require("express");
const adminController = __importStar(require("../controllers/admin.controller"));
const auth_middleware_1 = require("../middlewares/auth.middleware");
const router = (0, express_1.Router)();
// Suppliers
router.get('/suppliers', adminController.getSuppliers);
router.post('/suppliers', auth_middleware_1.isAdmin, adminController.createSupplier);
router.put('/suppliers/:id', auth_middleware_1.isAdmin, adminController.updateSupplier);
router.delete('/suppliers/:id', auth_middleware_1.isAdmin, adminController.deleteSupplier);
// Categories
router.get('/categories', adminController.getCategories);
router.post('/categories', auth_middleware_1.isAdmin, adminController.createCategory);
router.put('/categories/:id', auth_middleware_1.isAdmin, adminController.updateCategory);
router.delete('/categories/:id', auth_middleware_1.isAdmin, adminController.deleteCategory);
// Audit Logs
router.get('/audit-logs', auth_middleware_1.isAdmin, adminController.getAuditLogs);
// Settings
router.get('/settings', adminController.getSettings);
router.post('/settings', auth_middleware_1.isAdmin, adminController.updateSettings);
// Dashboard
router.get('/dashboard-stats', adminController.getDashboardStats);
router.get('/global-stats', auth_middleware_1.isAdmin, adminController.getGlobalStats);
// Receipt
router.get('/receipt-settings', adminController.getReceiptSettings);
router.post('/receipt-settings', auth_middleware_1.isAdmin, adminController.updateReceiptSettings);
// Low Stock
router.get('/low-stock', adminController.getLowStock);
// License
router.post('/shop-license', auth_middleware_1.isAdmin, adminController.updateShopLicense);
// App Config
router.post('/app-config', auth_middleware_1.isAdmin, adminController.updateAppConfig);
// Void Order
router.post('/void-order', adminController.voidOrder);
// Expenses
router.get('/expenses', adminController.getExpenses);
router.post('/expenses', adminController.createExpense);
router.delete('/expenses/:id', adminController.deleteExpense);
// Stock History
router.get('/stock-history', adminController.getStockHistory);
// Stock Adjustment
router.post('/adjust-stock', adminController.adjustStock);
// Exchange Rates
router.get('/exchange-rates', adminController.getExchangeRates);
exports.default = router;
