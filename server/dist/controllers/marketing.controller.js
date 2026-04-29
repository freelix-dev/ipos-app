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
exports.deleteCoupon = exports.createCoupon = exports.getCoupons = exports.deletePromotion = exports.createPromotion = exports.getPromotions = void 0;
const marketingService = __importStar(require("../services/marketing.service"));
const getPromotions = async (req, res) => {
    try {
        const shopId = req.query.shopId;
        const promotions = await marketingService.getPromotions(shopId);
        res.json(promotions);
    }
    catch (error) {
        res.status(500).json({ message: 'Error fetching promotions', error });
    }
};
exports.getPromotions = getPromotions;
const createPromotion = async (req, res) => {
    try {
        const promotionData = req.body;
        const id = await marketingService.createPromotion(promotionData);
        res.status(201).json({ message: 'Promotion created', id });
    }
    catch (error) {
        res.status(500).json({ message: 'Error creating promotion', error });
    }
};
exports.createPromotion = createPromotion;
const deletePromotion = async (req, res) => {
    try {
        await marketingService.deletePromotion(req.params.id);
        res.json({ message: 'Promotion deleted successfully' });
    }
    catch (error) {
        res.status(500).json({ message: 'Error deleting promotion', error });
    }
};
exports.deletePromotion = deletePromotion;
const getCoupons = async (req, res) => {
    try {
        const shopId = req.query.shopId;
        const coupons = await marketingService.getCoupons(shopId);
        res.json(coupons);
    }
    catch (error) {
        res.status(500).json({ message: 'Error fetching coupons', error });
    }
};
exports.getCoupons = getCoupons;
const createCoupon = async (req, res) => {
    try {
        const couponData = req.body;
        const id = await marketingService.createCoupon(couponData);
        res.status(201).json({ message: 'Coupon created', id });
    }
    catch (error) {
        res.status(500).json({ message: 'Error creating coupon', error });
    }
};
exports.createCoupon = createCoupon;
const deleteCoupon = async (req, res) => {
    try {
        await marketingService.deleteCoupon(req.params.id);
        res.json({ message: 'Coupon deleted successfully' });
    }
    catch (error) {
        res.status(500).json({ message: 'Error deleting coupon', error });
    }
};
exports.deleteCoupon = deleteCoupon;
