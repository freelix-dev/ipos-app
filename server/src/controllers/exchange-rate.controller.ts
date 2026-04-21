import { Request, Response } from 'express';
import * as exchangeRateService from '../services/exchange-rate.service';

export const getExchangeRates = async (req: Request, res: Response) => {
  try {
    const rates = await exchangeRateService.getExchangeRates();
    res.json(rates);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Database error' });
  }
};
