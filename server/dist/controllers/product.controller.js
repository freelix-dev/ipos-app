"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadImage = exports.updateStock = exports.deleteProduct = exports.updateProduct = exports.createProduct = exports.getProductById = exports.getProducts = void 0;
const productService = __importStar(require("../services/product.service"));
const getProducts = async (req, res) => {
    try {
        const user = req.user;
        const shopId = req.query.shopId;
        let ownerId;
        let userId;
        const isSystemAdmin = user && !user.shop_id && !user.owner_id;
        if (!isSystemAdmin && user) {
            if (!user.owner_id) {
                // This is a top-level owner, they should see everything they own
                ownerId = user.id;
                userId = undefined; // Don't restrict by assigned shops
            }
            else {
                // This is a staff or manager, restrict to their owner and assigned shops
                ownerId = user.owner_id;
                userId = user.id;
            }
        }
        const products = await productService.getAllProducts(shopId, ownerId, userId);
        res.json(products);
    }
    catch (e) {
        console.error('Error in getProducts:', e);
        res.status(500).json({ message: 'Database error' });
    }
};
exports.getProducts = getProducts;
const getProductById = async (req, res) => {
    try {
        const product = await productService.getProductById(req.params.id);
        if (!product)
            res.status(404).json({ message: 'Product not found' });
        else
            res.json(product);
    }
    catch (e) {
        console.error(e);
        res.status(500).json({ message: 'Database error' });
    }
};
exports.getProductById = getProductById;
const createProduct = async (req, res) => {
    try {
        const id = await productService.createProduct(req.body);
        res.status(201).json({ message: 'Product created', id });
    }
    catch (e) {
        console.error('CREATE PRODUCT ERROR:', e);
        res.status(500).json({ message: `Database error: ${e.message}` });
    }
};
exports.createProduct = createProduct;
const updateProduct = async (req, res) => {
    try {
        await productService.updateProduct(req.params.id, req.body);
        res.json({ message: 'Product updated successfully' });
    }
    catch (e) {
        console.error(e);
        res.status(500).json({ message: 'Database error' });
    }
};
exports.updateProduct = updateProduct;
const deleteProduct = async (req, res) => {
    try {
        await productService.deleteProduct(req.params.id);
        res.json({ message: 'Product deleted successfully' });
    }
    catch (e) {
        console.error(e);
        res.status(500).json({ message: 'Database error' });
    }
};
exports.deleteProduct = deleteProduct;
const updateStock = async (req, res) => {
    try {
        await productService.updateStock(req.params.id, req.body.stock);
        res.json({ message: 'Stock updated successfully' });
    }
    catch (e) {
        console.error(e);
        res.status(500).json({ message: 'Database error' });
    }
};
exports.updateStock = updateStock;
const uploadImage = (req, res) => {
    if (!req.file) {
        res.status(400).json({ message: 'No file uploaded' });
        return;
    }
    const filePath = `assets/images/${req.file.filename}`;
    res.json({ imagePath: filePath });
};
exports.uploadImage = uploadImage;
