import { Router } from 'express';
import * as marketingController from '../controllers/marketing.controller';
import { authenticateToken } from '../middlewares/auth.middleware';

const router = Router();

// Promotions
router.get('/promotions', authenticateToken, marketingController.getPromotions);
router.post('/promotions', authenticateToken, marketingController.createPromotion);
router.delete('/promotions/:id', authenticateToken, marketingController.deletePromotion);

// Coupons
router.get('/coupons', authenticateToken, marketingController.getCoupons);
router.post('/coupons', authenticateToken, marketingController.createCoupon);
router.delete('/coupons/:id', authenticateToken, marketingController.deleteCoupon);

export default router;
