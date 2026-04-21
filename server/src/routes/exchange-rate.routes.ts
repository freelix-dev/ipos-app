import { Router } from 'express';
import * as exchangeRateController from '../controllers/exchange-rate.controller';

const router = Router();

router.get('/', exchangeRateController.getExchangeRates);

export default router;
