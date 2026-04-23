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
exports.uploadShopLogo = exports.registerShop = exports.deleteShop = exports.updateShop = exports.createShop = exports.getShop = exports.getShops = void 0;
const shopService = __importStar(require("../services/shop.service"));
const getShops = async (req, res) => {
    try {
        const user = req.user;
        let ownerId = req.query.ownerId;
        const isSystemAdmin = user && !user.shop_id && !user.owner_id;
        if (!isSystemAdmin && user) {
            ownerId = user.owner_id || user.id;
        }
        const shops = await shopService.getAllShops(ownerId, user?.id);
        res.json(shops);
    }
    catch (error) {
        res.status(500).json({ message: 'Error fetching shops', error });
    }
};
exports.getShops = getShops;
const getShop = async (req, res) => {
    try {
        const shop = await shopService.getShopById(req.params.id);
        if (shop) {
            res.json(shop);
        }
        else {
            res.status(404).json({ message: 'Shop not found' });
        }
    }
    catch (error) {
        res.status(500).json({ message: 'Error fetching shop', error });
    }
};
exports.getShop = getShop;
const createShop = async (req, res) => {
    try {
        const { name, address, phone, ownerId } = req.body;
        // If no ownerId provided in body, we could use current logged in user ID
        const id = await shopService.createShop({ name, address, phone, owner_id: ownerId });
        res.status(201).json({ message: 'Shop created', id });
    }
    catch (error) {
        res.status(500).json({ message: 'Error creating shop', error });
    }
};
exports.createShop = createShop;
const updateShop = async (req, res) => {
    try {
        await shopService.updateShop(req.params.id, req.body);
        res.json({ message: 'Shop updated successfully' });
    }
    catch (error) {
        res.status(500).json({ message: 'Error updating shop', error });
    }
};
exports.updateShop = updateShop;
const deleteShop = async (req, res) => {
    try {
        await shopService.deleteShop(req.params.id);
        res.json({ message: 'Shop deleted successfully' });
    }
    catch (error) {
        res.status(500).json({ message: 'Error deleting shop', error });
    }
};
exports.deleteShop = deleteShop;
const registerShop = async (req, res) => {
    try {
        const result = await shopService.registerShop(req.body);
        res.status(201).json({ ...result, message: 'Shop and Admin registered successfully' });
    }
    catch (error) {
        res.status(500).json({ message: 'Error registering shop', error });
    }
};
exports.registerShop = registerShop;
const uploadShopLogo = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }
        const shopId = req.params.id;
        // Build the public URL path for the uploaded file
        const logoPath = `/uploads/logos/${req.file.filename}`;
        await shopService.updateShop(shopId, { logoPath });
        res.json({ message: 'Logo uploaded successfully', logoPath });
    }
    catch (error) {
        res.status(500).json({ message: 'Error uploading logo', error });
    }
};
exports.uploadShopLogo = uploadShopLogo;
