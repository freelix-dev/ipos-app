import { Router } from 'express';
import authRoutes from './auth.routes';
import userRoutes from './user.routes';
import productRoutes from './product.routes';
import orderRoutes from './order.routes';
import exchangeRateRoutes from './exchange-rate.routes';

const router = Router();

router.use('/', authRoutes);
router.use('/users', userRoutes);
router.use('/products', productRoutes);
router.use('/orders', orderRoutes);
router.use('/exchange-rates', exchangeRateRoutes);

// For compatibility with the original /api/upload which I moved inside /api/products/upload in my initial thought
// but looking back at index.ts it was /api/upload. Let's keep it consistent or redirect.
// Actually, I'll just add it here directly or keep it in products.
// Let's look at index.ts again.
// Line 216: app.post('/api/upload', upload.single('image')...
// I'll add an upload route here too if needed, or just keep it in products.
// To perfectly match original:

import { upload } from '../middlewares/upload.middleware';
import { uploadImage } from '../controllers/product.controller';
router.post('/upload', upload.single('image'), uploadImage);

export default router;
