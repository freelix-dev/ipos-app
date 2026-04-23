import { Request, Response } from 'express';
import * as userService from '../services/user.service';

export const getUsers = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const shopId = req.query.shopId as string;
    
    // Logic: 
    // 1. System Admin (no shop_id, no owner_id) sees everything
    // 2. Business Users (Owner or Sub-Admin) see data belonging to their business (owner_id)
    let ownerId = req.query.ownerId as string;
    
    const isSystemAdmin = user && !user.shop_id && !user.owner_id;
    
    if (!isSystemAdmin && user) {
       // For anyone else, scope to their business
       ownerId = user.owner_id || user.id;
    }

    const users = await userService.getAllUsers(shopId, ownerId);
    res.json(users);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Database error' });
  }
};

export const createUser = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const userData = { ...req.body };

    // Automatically set owner_id to the current user's ID (the owner) or their owner_id
    if (user) {
      userData.owner_id = user.owner_id || user.id;
    }

    const id = await userService.createUser(userData);
    res.status(201).json({ message: 'User created', id });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Database error' });
  }
};

export const updateUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await userService.updateUser(id as string, req.body);
    res.json({ message: 'User updated successfully' });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Database error' });
  }
};

export const deleteUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await userService.deleteUser(id as string);
    res.json({ message: 'User deleted successfully' });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Database error' });
  }
};
