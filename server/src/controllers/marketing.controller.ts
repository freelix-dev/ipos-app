import { Request, Response } from 'express';
import * as marketingService from '../services/marketing.service';

export const getPromotions = async (req: Request, res: Response) => {
  try {
    const shopId = req.query.shopId as string;
    const promotions = await marketingService.getPromotions(shopId);
    res.json(promotions);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching promotions', error });
  }
};

export const createPromotion = async (req: Request, res: Response) => {
  try {
    const promotionData = req.body;
    const id = await marketingService.createPromotion(promotionData);
    res.status(201).json({ message: 'Promotion created', id });
  } catch (error) {
    res.status(500).json({ message: 'Error creating promotion', error });
  }
};

export const deletePromotion = async (req: Request, res: Response) => {
  try {
    await marketingService.deletePromotion(req.params.id as string);
    res.json({ message: 'Promotion deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting promotion', error });
  }
};

export const getCoupons = async (req: Request, res: Response) => {
  try {
    const shopId = req.query.shopId as string;
    const coupons = await marketingService.getCoupons(shopId);
    res.json(coupons);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching coupons', error });
  }
};

export const createCoupon = async (req: Request, res: Response) => {
  try {
    const couponData = req.body;
    const id = await marketingService.createCoupon(couponData);
    res.status(201).json({ message: 'Coupon created', id });
  } catch (error) {
    res.status(500).json({ message: 'Error creating coupon', error });
  }
};

export const deleteCoupon = async (req: Request, res: Response) => {
  try {
    await marketingService.deleteCoupon(req.params.id as string);
    res.json({ message: 'Coupon deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting coupon', error });
  }
};
