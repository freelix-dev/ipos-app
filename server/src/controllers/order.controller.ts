import { Request, Response } from 'express';
import * as orderService from '../services/order.service';

export const getOrders = async (req: Request, res: Response) => {
  try {
    const orders = await orderService.getAllOrders();
    res.json(orders);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Database error' });
  }
};

export const syncOrders = async (req: Request, res: Response): Promise<void> => {
  const syncData = req.body;
  const ordersToProcess = Array.isArray(syncData) ? syncData : [syncData];
  if (ordersToProcess.length === 0) {
    res.json({ message: 'No orders to sync', count: 0 });
    return;
  }
  try {
    const result = await orderService.syncOrders(ordersToProcess);
    res.json({ message: 'Orders synced and saved successfully', ...result });
  } catch (error) {
    res.status(500).json({ message: 'Failed to sync orders', error: String(error) });
  }
};
