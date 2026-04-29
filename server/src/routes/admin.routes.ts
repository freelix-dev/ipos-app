import { Router } from 'express';
import * as adminController from '../controllers/admin.controller';
import { authenticateToken, isAdmin } from '../middlewares/auth.middleware';

const router = Router();

// Suppliers
router.get('/suppliers', adminController.getSuppliers);
router.post('/suppliers', isAdmin, adminController.createSupplier);
router.put('/suppliers/:id', isAdmin, adminController.updateSupplier);
router.delete('/suppliers/:id', isAdmin, adminController.deleteSupplier);

// Categories
router.get('/categories', adminController.getCategories);
router.post('/categories', isAdmin, adminController.createCategory);
router.put('/categories/:id', isAdmin, adminController.updateCategory);
router.delete('/categories/:id', isAdmin, adminController.deleteCategory);

// Audit Logs
router.get('/audit-logs', isAdmin, adminController.getAuditLogs);

// Settings
router.get('/settings', adminController.getSettings);
router.post('/settings', isAdmin, adminController.updateSettings);

// Dashboard
router.get('/dashboard-stats', adminController.getDashboardStats);
router.get('/global-stats', isAdmin, adminController.getGlobalStats);

// Receipt
router.get('/receipt-settings', adminController.getReceiptSettings);
router.post('/receipt-settings', isAdmin, adminController.updateReceiptSettings);

// Low Stock
router.get('/low-stock', adminController.getLowStock);

// License
router.post('/shop-license', isAdmin, adminController.updateShopLicense);

// App Config
router.post('/app-config', isAdmin, adminController.updateAppConfig);

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

export default router;
