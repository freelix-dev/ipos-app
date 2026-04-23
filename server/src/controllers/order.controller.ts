import { Request, Response } from 'express';
import * as orderService from '../services/order.service';

export const getOrders = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const shopId = req.query.shopId as string;
    
    let ownerId: string | undefined;
    let userId: string | undefined;

    const isSystemAdmin = user && !user.shop_id && !user.owner_id;

    if (!isSystemAdmin && user) {
      ownerId = user.owner_id || user.id;
      userId = user.id;
    }

    const orders = await orderService.getAllOrders(shopId, ownerId, userId);
    res.json(orders);
  } catch (error) {
    console.error(error);
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
