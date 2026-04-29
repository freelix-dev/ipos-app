import { Request, Response } from 'express';
import { 
  getAllProducts, 
  getProductById as getProductByIdService, 
  createProduct as createProductService, 
  updateProduct as updateProductService, 
  deleteProduct as deleteProductService, 
  updateStock as updateStockService 
} from '../services/product.service'; 
import { createAuditLog } from '../services/audit.service';

export const getProducts = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const shopId = req.query.shopId as string;
    
    let ownerId: string | undefined;
    let userId: string | undefined;

    const isSystemAdmin = user && !user.shop_id && !user.owner_id;

    if (!isSystemAdmin && user) {
      if (!user.owner_id) {
        // This is a top-level owner, they should see everything they own
        ownerId = user.id;
        userId = undefined; // Don't restrict by assigned shops
      } else {
        // This is a staff or manager, restrict to their owner and assigned shops
        ownerId = user.owner_id;
        userId = user.id;
      }
    }

    const products = await getAllProducts(shopId, ownerId, userId);
    res.json(products);
  } catch (e) {
    console.error('Error in getProducts:', e);
    res.status(500).json({ message: 'Database error' });
  }
};

export const getProductById = async (req: Request, res: Response) => {
  try {
    const product = await getProductByIdService(req.params.id as string);
    if (!product) res.status(404).json({ message: 'Product not found' });
    else res.json(product);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Database error' });
  }
};

export const createProduct = async (req: Request, res: Response) => {
  try {
    const id = await createProductService(req.body);
    const user = (req as any).user;
    
    await createAuditLog({
      user_id: user?.id,
      shop_id: req.body.shop_id || user?.shop_id,
      action: 'Create Product',
      target_type: 'product',
      target_id: id,
      details: `Created product: ${req.body.name}`,
      ip_address: req.ip
    });

    res.status(201).json({ message: 'Product created', id });
  } catch (e: any) {
    console.error('CREATE PRODUCT ERROR:', e);
    res.status(500).json({ message: `Database error: ${e.message}` });
  }
};

export const updateProduct = async (req: Request, res: Response) => {
  try {
    await updateProductService(req.params.id as string, req.body);
    const user = (req as any).user;

    await createAuditLog({
      user_id: user?.id,
      shop_id: req.body.shop_id || user?.shop_id,
      action: 'Update Product',
      target_type: 'product',
      target_id: req.params.id as string,
      details: `Updated product: ${req.body.name}`,
      ip_address: req.ip
    });

    res.json({ message: 'Product updated successfully' });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Database error' });
  }
};

export const deleteProduct = async (req: Request, res: Response) => {
  try {
    await deleteProductService(req.params.id as string);
    const user = (req as any).user;

    await createAuditLog({
      user_id: user?.id,
      shop_id: user?.shop_id,
      action: 'Delete Product',
      target_type: 'product',
      target_id: req.params.id as string,
      details: `Deleted product ID: ${req.params.id}`,
      ip_address: req.ip
    });

    res.json({ message: 'Product deleted successfully' });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Database error' });
  }
};

export const updateStock = async (req: Request, res: Response) => {
  try {
    await updateStockService(req.params.id as string, req.body.stock);
    res.json({ message: 'Stock updated successfully' });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Database error' });
  }
};

export const uploadImage = (req: Request, res: Response) => {
  if (!req.file) {
    res.status(400).json({ message: 'No file uploaded' });
    return;
  }
  const filePath = `assets/images/${req.file.filename}`;
  res.json({ imagePath: filePath });
};
