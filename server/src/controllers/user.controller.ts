import { Request, Response } from 'express';
import * as userService from '../services/user.service';

export const getUsers = async (req: Request, res: Response) => {
  try {
    const shopId = req.query.shopId as string;
    const users = await userService.getAllUsers(shopId);
    res.json(users);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Database error' });
  }
};

export const createUser = async (req: Request, res: Response) => {
  try {
    const id = await userService.createUser(req.body);
    res.status(201).json({ message: 'User created', id });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Database error' });
  }
};
