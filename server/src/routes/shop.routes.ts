import { Router } from 'express';
import * as shopController from '../controllers/shop.controller';

const router = Router();

router.get('/', shopController.getShops);
router.get('/:id', shopController.getShop);
router.post('/', shopController.createShop);
router.put('/:id', shopController.updateShop);
router.delete('/:id', shopController.deleteShop);
router.post('/register', shopController.registerShop);

export default router;
