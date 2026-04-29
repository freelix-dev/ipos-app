import { Router } from 'express';
import authRoutes from './auth.routes';
import userRoutes from './user.routes';
import productRoutes from './product.routes';
import orderRoutes from './order.routes';
import exchangeRateRoutes from './exchange-rate.routes';
import shopRoutes from './shop.routes';
import adminRoutes from './admin.routes';
import marketingRoutes from './marketing.routes';
import { authenticateToken } from '../middlewares/auth.middleware';

import * as adminController from '../controllers/admin.controller';

const router = Router();

// Public App Config (For Flutter Splash Screen)
router.get('/app-config', adminController.getSettings);

router.use('/', authRoutes);
router.use('/users', authenticateToken, userRoutes);
router.use('/products', authenticateToken, productRoutes);
router.use('/orders', authenticateToken, orderRoutes);
router.use('/exchange-rates', authenticateToken, exchangeRateRoutes);
router.use('/shops', shopRoutes);
router.use('/admin', authenticateToken, adminRoutes);
router.use('/marketing', authenticateToken, marketingRoutes);

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
