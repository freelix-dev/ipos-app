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
exports.syncOrders = exports.getOrders = void 0;
const orderService = __importStar(require("../services/order.service"));
const getOrders = async (req, res) => {
    try {
        const orders = await orderService.getAllOrders();
        res.json(orders);
    }
    catch (e) {
        console.error(e);
        res.status(500).json({ message: 'Database error' });
    }
};
exports.getOrders = getOrders;
const syncOrders = async (req, res) => {
    const syncData = req.body;
    const ordersToProcess = Array.isArray(syncData) ? syncData : [syncData];
    if (ordersToProcess.length === 0) {
        res.json({ message: 'No orders to sync', count: 0 });
        return;
    }
    try {
        const result = await orderService.syncOrders(ordersToProcess);
        res.json({ message: 'Orders synced and saved successfully', ...result });
    }
    catch (error) {
        res.status(500).json({ message: 'Failed to sync orders', error: String(error) });
    }
};
exports.syncOrders = syncOrders;
