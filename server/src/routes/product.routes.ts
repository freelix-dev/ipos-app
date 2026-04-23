import { Router } from 'express';
import * as productController from '../controllers/product.controller';
import { upload } from '../middlewares/upload.middleware';
import { isAdmin } from '../middlewares/auth.middleware';

const router = Router();

router.get('/', productController.getProducts);
router.get('/:id', productController.getProductById);
router.post('/', isAdmin, productController.createProduct);
router.put('/:id', isAdmin, productController.updateProduct);
router.delete('/:id', isAdmin, productController.deleteProduct);
router.patch('/:id/stock', isAdmin, productController.updateStock);
router.post('/upload', isAdmin, upload.single('image'), productController.uploadImage);

export default router;
