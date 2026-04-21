import { Router } from 'express';
import * as productController from '../controllers/product.controller';
import { upload } from '../middlewares/upload.middleware';

const router = Router();

router.get('/', productController.getProducts);
router.get('/:id', productController.getProductById);
router.post('/', productController.createProduct);
router.put('/:id', productController.updateProduct);
router.delete('/:id', productController.deleteProduct);
router.patch('/:id/stock', productController.updateStock);
router.post('/upload', upload.single('image'), productController.uploadImage);

export default router;
