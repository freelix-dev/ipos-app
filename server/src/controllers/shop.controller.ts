import { Request, Response } from 'express';
import * as shopService from '../services/shop.service';

export const getShops = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    let ownerId = req.query.ownerId as string;
    
    const isSystemAdmin = user && !user.shop_id && !user.owner_id;

    if (!isSystemAdmin && user) {
      ownerId = user.owner_id || user.id;
    }
    
    const shops = await shopService.getAllShops(ownerId, user?.id);
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
    const { name, address, phone, ownerId } = req.body;
    // If no ownerId provided in body, we could use current logged in user ID
    const id = await shopService.createShop({ name, address, phone, owner_id: ownerId });
    res.status(201).json({ message: 'Shop created', id });
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

export const uploadShopLogo = async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }
    const shopId = req.params.id;
    // Build the public URL path for the uploaded file
    const logoPath = `/uploads/logos/${req.file.filename}`;
    await shopService.updateShop(shopId as string, { logoPath });
    res.json({ message: 'Logo uploaded successfully', logoPath });
  } catch (error) {
    res.status(500).json({ message: 'Error uploading logo', error });
  }
};
