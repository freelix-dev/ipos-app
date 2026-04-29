"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadImage = exports.updateStock = exports.deleteProduct = exports.updateProduct = exports.createProduct = exports.getProductById = exports.getProducts = void 0;
const product_service_1 = require("../services/product.service");
const audit_service_1 = require("../services/audit.service");
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
        const products = await (0, product_service_1.getAllProducts)(shopId, ownerId, userId);
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
        const product = await (0, product_service_1.getProductById)(req.params.id);
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
        const id = await (0, product_service_1.createProduct)(req.body);
        const user = req.user;
        await (0, audit_service_1.createAuditLog)({
            user_id: user?.id,
            shop_id: req.body.shop_id || user?.shop_id,
            action: 'Create Product',
            target_type: 'product',
            target_id: id,
            details: `Created product: ${req.body.name}`,
            ip_address: req.ip
        });
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
        await (0, product_service_1.updateProduct)(req.params.id, req.body);
        const user = req.user;
        await (0, audit_service_1.createAuditLog)({
            user_id: user?.id,
            shop_id: req.body.shop_id || user?.shop_id,
            action: 'Update Product',
            target_type: 'product',
            target_id: req.params.id,
            details: `Updated product: ${req.body.name}`,
            ip_address: req.ip
        });
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
        await (0, product_service_1.deleteProduct)(req.params.id);
        const user = req.user;
        await (0, audit_service_1.createAuditLog)({
            user_id: user?.id,
            shop_id: user?.shop_id,
            action: 'Delete Product',
            target_type: 'product',
            target_id: req.params.id,
            details: `Deleted product ID: ${req.params.id}`,
            ip_address: req.ip
        });
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
        await (0, product_service_1.updateStock)(req.params.id, req.body.stock);
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
