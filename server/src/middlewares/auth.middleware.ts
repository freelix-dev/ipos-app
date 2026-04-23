import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export const authenticateToken = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Authentication token required' });
  }

  jwt.verify(token, process.env.JWT_SECRET || 'ipos_secret_key_2024', (err: any, user: any) => {
    if (err) return res.status(403).json({ message: 'Invalid or expired token' });
    (req as any).user = user;
    next();
  });
};

export const isAdmin = (req: Request, res: Response, next: NextFunction) => {
  const user = (req as any).user;
  
  if (user && user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ message: 'Forbidden: Manager access required' });
  }
};
