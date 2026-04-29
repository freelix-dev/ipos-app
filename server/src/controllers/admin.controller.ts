import { Request, Response } from 'express';
import * as supplierService from '../services/supplier.service';
import * as categoryService from '../services/category.service';
import * as productService from '../services/product.service';  
import * as auditService from '../services/audit.service';
import * as settingsService from '../services/settings.service';
import * as dashboardService from '../services/dashboard.service';
import * as receiptService from '../services/receipt.service';
import * as orderService from '../services/order.service';
import * as expenseService from '../services/expense.service';
import { readPool, writePool } from '../db';

// Suppliers
export const getSuppliers = async (req: Request, res: Response) => {
  try {
    const shopId = req.query.shopId as string;
    const suppliers = await supplierService.getAllSuppliers(shopId);
    res.json(suppliers);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching suppliers', error });
  }
};

export const createSupplier = async (req: Request, res: Response) => {
  try {
    const id = await supplierService.createSupplier(req.body);
    res.status(201).json({ message: 'Supplier created', id });
  } catch (error) {
    res.status(500).json({ message: 'Error creating supplier', error });
  }
};

export const updateSupplier = async (req: Request, res: Response) => {
  try {
    await supplierService.updateSupplier(req.params.id as string, req.body);
    res.json({ message: 'Supplier updated successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error updating supplier', error });
  }
};

export const deleteSupplier = async (req: Request, res: Response) => {
  try {
    await supplierService.deleteSupplier(req.params.id as string);
    res.json({ message: 'Supplier deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting supplier', error });
  }
};

// Categories
export const getCategories = async (req: Request, res: Response) => {
  try {
    const shopId = req.query.shopId as string;
    const categories = await categoryService.getAllCategories(shopId);
    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching categories', error });
  }
};

export const createCategory = async (req: Request, res: Response) => {
  try {
    const id = await categoryService.createCategory(req.body);
    res.status(201).json({ message: 'Category created', id });
  } catch (error) {
    res.status(500).json({ message: 'Error creating category', error });
  }
};

export const updateCategory = async (req: Request, res: Response) => {
  try {
    await categoryService.updateCategory(req.params.id as string, req.body);
    res.json({ message: 'Category updated successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error updating category', error });
  }
};

export const deleteCategory = async (req: Request, res: Response) => {
  try {
    await categoryService.deleteCategory(req.params.id as string);
    res.json({ message: 'Category deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting category', error });
  }
};

// Audit Logs
export const getAuditLogs = async (req: Request, res: Response) => {
  try {
    const filters = {
      shopId: req.query.shopId as string,
      userId: req.query.userId as string,
      action: req.query.action as string,
      startDate: req.query.startDate as string,
      endDate: req.query.endDate as string,
    };
    const logs = await auditService.getAuditLogs(filters);
    res.json(logs);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching audit logs', error });
  }
};

// Settings
export const getSettings = async (req: Request, res: Response) => {
  try {
    const settings = await settingsService.getSystemSettings();
    res.json(settings);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching settings', error });
  }
};

export const updateSettings = async (req: Request, res: Response) => {
  try {
    await settingsService.updateMultipleSettings(req.body);
    res.json({ message: 'Settings updated successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error updating settings', error });
  }
};

// Dashboard Stats
export const getDashboardStats = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    let shopId = req.query.shopId as string;

    // Security Check: Non-system admins can only see their own shop's stats
    const isSystemAdmin = user && !user.shop_id && !user.owner_id;
    if (!isSystemAdmin && user?.shop_id) {
      shopId = user.shop_id; // Override to their own shop
    }

    const stats = await dashboardService.getDashboardStats(shopId);
    res.json(stats);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching dashboard stats', error });
  }
};

export const getGlobalStats = async (req: Request, res: Response) => {
  try {
    const stats = await dashboardService.getGlobalStats();
    res.json(stats);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching global stats', error });
  }
};

// Receipt Settings
export const getReceiptSettings = async (req: Request, res: Response) => {
  try {
    const shopId = req.query.shopId as string;
    const settings = await receiptService.getReceiptSettings(shopId);
    res.json(settings);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching receipt settings', error });
  }
};

export const updateReceiptSettings = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
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
  } catch (error) {
    res.status(500).json({ message: 'Error updating receipt settings', error });
  }
};

// Low Stock
export const getLowStock = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    let shopId = req.query.shopId as string;
    
    const isSystemAdmin = user && !user.shop_id && !user.owner_id;
    if (!isSystemAdmin && user?.shop_id) {
      shopId = user.shop_id;
    }

    const products = await productService.getLowStockProducts(shopId);
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching low stock products', error });
  }
};

// Shop License Management
export const updateShopLicense = async (req: Request, res: Response) => {
  try {
    const { shop_id, status, license_expiry, plan_type } = req.body;
    await writePool.query(
      'UPDATE shops SET status = ?, license_expiry = ?, plan_type = ? WHERE id = ?',
      [status, license_expiry, plan_type, shop_id]
    );
    res.json({ message: 'Shop license updated successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error updating shop license', error });
  }
};

// App Config Management
export const updateAppConfig = async (req: Request, res: Response) => {
  try {
    const settings = req.body; // e.g. { app_current_version: '1.2.1', maintenance_mode: 'true' }
    const promises = Object.entries(settings).map(([key, value]) => 
      writePool.query('INSERT INTO system_settings (setting_key, setting_value) VALUES (?, ?) ON DUPLICATE KEY UPDATE setting_value = ?', [key, value, value])
    );
    await Promise.all(promises);
    res.json({ message: 'App configuration updated' });
  } catch (error) {
    res.status(500).json({ message: 'Error updating app config', error });
  }
};

// Void Order
export const voidOrder = async (req: Request, res: Response) => {
  try {
    const { orderId, reason } = req.body;
    const user = (req as any).user;
    const voidedBy = user?.id || 'system';

    const result = await orderService.voidOrder(orderId, reason, voidedBy);
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Error voiding order' });
  }
};

// Expenses
export const getExpenses = async (req: Request, res: Response) => {
  try {
    const shopId = req.query.shopId as string;
    const expenses = await expenseService.getExpenses(shopId);
    res.json(expenses);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching expenses', error });
  }
};

export const createExpense = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const expenseData = { ...req.body, created_by: user?.id };
    const id = await expenseService.addExpense(expenseData);
    res.status(201).json({ message: 'Expense created', id });
  } catch (error) {
    res.status(500).json({ message: 'Error creating expense', error });
  }
};

export const deleteExpense = async (req: Request, res: Response) => {
  try {
    await expenseService.deleteExpense(req.params.id as string);
    res.json({ message: 'Expense deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting expense', error });
  }
};

// Stock History
export const getStockHistory = async (req: Request, res: Response) => {
  try {
    const shopId = req.query.shopId as string;
    const [rows] = await readPool.query(
      'SELECT sh.*, p.name as product_name FROM stock_history sh JOIN products p ON sh.product_id = p.id WHERE sh.shop_id = ? ORDER BY sh.created_at DESC LIMIT 100',
      [shopId]
    );
    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching stock history', error });
  }
};

// Stock Adjustment
export const adjustStock = async (req: Request, res: Response) => {
  try {
    const { productId, adjustment, type, reason } = req.body;
    const user = (req as any).user;
    const userId = user?.id || 'system';

    const result = await productService.adjustStock(productId, adjustment, type, reason, userId);
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Error adjusting stock' });
  }
};

// Exchange Rates
export const getExchangeRates = async (req: Request, res: Response) => {
  try {
    const shopId = (req.query.shopId as string) || 'global';
    const rates = await settingsService.getExchangeRates(shopId);
    res.json(rates);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching exchange rates', error });
  }
};
