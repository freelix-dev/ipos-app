import { Router } from 'express';
import * as exchangeRateController from '../controllers/exchange-rate.controller';
import { isAdmin } from '../middlewares/auth.middleware';

const router = Router();

router.get('/', exchangeRateController.getExchangeRates);
router.post('/', isAdmin, exchangeRateController.updateExchangeRates);

export default router;
