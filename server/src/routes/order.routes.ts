import { Router } from 'express';
import * as orderController from '../controllers/order.controller';

const router = Router();

router.get('/', orderController.getOrders);
router.post('/', orderController.syncOrders);

export default router;
