import { Router } from 'express';
import * as shopController from '../controllers/shop.controller';
import { uploadLogo } from '../middlewares/upload';
import { isAdmin, authenticateToken } from '../middlewares/auth.middleware';

const router = Router();

router.get('/', authenticateToken, shopController.getShops);
router.get('/:id', authenticateToken, shopController.getShop);
router.post('/', authenticateToken, isAdmin, shopController.createShop);
router.put('/:id', authenticateToken, isAdmin, shopController.updateShop);
router.delete('/:id', authenticateToken, isAdmin, shopController.deleteShop);
router.post('/register', shopController.registerShop);
router.post('/:id/upload-logo', authenticateToken, isAdmin, uploadLogo, shopController.uploadShopLogo);

export default router;
