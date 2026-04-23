import { Request, Response } from 'express';
import * as exchangeRateService from '../services/exchange-rate.service';

export const getExchangeRates = async (req: Request, res: Response) => {
  try {
    const { shopId } = req.query;
    const rates = await exchangeRateService.getExchangeRates(shopId as string);
    res.json(rates);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Database error' });
  }
};
export const updateExchangeRates = async (req: Request, res: Response) => {
  try {
    const { shopId, rates } = req.body;
    await exchangeRateService.updateExchangeRates(rates, shopId);
    res.json({ message: 'Exchange rates updated successfully' });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Database error' });
  }
};
