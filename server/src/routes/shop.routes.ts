import { Router } from 'express';
import * as shopController from '../controllers/shop.controller';
import { uploadLogo, uploadQrImage } from '../middlewares/upload';
import { isAdmin, authenticateToken } from '../middlewares/auth.middleware';

const router = Router();

// Static routes MUST come before dynamic :id routes
router.post('/register', shopController.registerShop);

router.get('/', authenticateToken, shopController.getShops);
router.get('/:id', authenticateToken, shopController.getShop);
router.post('/', authenticateToken, isAdmin, shopController.createShop);
router.put('/:id', authenticateToken, isAdmin, shopController.updateShop);
router.delete('/:id', authenticateToken, isAdmin, shopController.deleteShop);
router.post('/:id/upload-logo', authenticateToken, isAdmin, uploadLogo, shopController.uploadShopLogo);
router.post('/:id/upload-qr', authenticateToken, uploadQrImage, shopController.uploadShopQr);

export default router;
