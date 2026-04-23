import { Request, Response } from 'express';
import * as shopService from '../services/shop.service';

export const getShops = async (req: Request, res: Response) => {
  try {
    const shops = await shopService.getAllShops();
    res.json(shops);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching shops', error });
  }
};

export const getShop = async (req: Request, res: Response) => {
  try {
    const shop = await shopService.getShopById(req.params.id as string);
    if (shop) {
      res.json(shop);
    } else {
      res.status(404).json({ message: 'Shop not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Error fetching shop', error });
  }
};

export const createShop = async (req: Request, res: Response) => {
  try {
    const id = await shopService.createShop(req.body);
    res.status(201).json({ id, message: 'Shop created successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error creating shop', error });
  }
};

export const updateShop = async (req: Request, res: Response) => {
  try {
    await shopService.updateShop(req.params.id as string, req.body);
    res.json({ message: 'Shop updated successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error updating shop', error });
  }
};

export const deleteShop = async (req: Request, res: Response) => {
  try {
    await shopService.deleteShop(req.params.id as string);
    res.json({ message: 'Shop deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting shop', error });
  }
};

export const registerShop = async (req: Request, res: Response) => {
  try {
    const result = await shopService.registerShop(req.body);
    res.status(201).json({ ...result, message: 'Shop and Admin registered successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error registering shop', error });
  }
};
