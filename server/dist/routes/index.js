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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_routes_1 = __importDefault(require("./auth.routes"));
const user_routes_1 = __importDefault(require("./user.routes"));
const product_routes_1 = __importDefault(require("./product.routes"));
const order_routes_1 = __importDefault(require("./order.routes"));
const exchange_rate_routes_1 = __importDefault(require("./exchange-rate.routes"));
const shop_routes_1 = __importDefault(require("./shop.routes"));
const admin_routes_1 = __importDefault(require("./admin.routes"));
const marketing_routes_1 = __importDefault(require("./marketing.routes"));
const auth_middleware_1 = require("../middlewares/auth.middleware");
const adminController = __importStar(require("../controllers/admin.controller"));
const router = (0, express_1.Router)();
// Public App Config (For Flutter Splash Screen)
router.get('/app-config', adminController.getSettings);
router.use('/', auth_routes_1.default);
router.use('/users', auth_middleware_1.authenticateToken, user_routes_1.default);
router.use('/products', auth_middleware_1.authenticateToken, product_routes_1.default);
router.use('/orders', auth_middleware_1.authenticateToken, order_routes_1.default);
router.use('/exchange-rates', auth_middleware_1.authenticateToken, exchange_rate_routes_1.default);
router.use('/shops', shop_routes_1.default);
router.use('/admin', auth_middleware_1.authenticateToken, admin_routes_1.default);
router.use('/marketing', auth_middleware_1.authenticateToken, marketing_routes_1.default);
// For compatibility with the original /api/upload which I moved inside /api/products/upload in my initial thought
// but looking back at index.ts it was /api/upload. Let's keep it consistent or redirect.
// Actually, I'll just add it here directly or keep it in products.
// Let's look at index.ts again.
// Line 216: app.post('/api/upload', upload.single('image')...
// I'll add an upload route here too if needed, or just keep it in products.
// To perfectly match original:
const upload_middleware_1 = require("../middlewares/upload.middleware");
const product_controller_1 = require("../controllers/product.controller");
router.post('/upload', upload_middleware_1.upload.single('image'), product_controller_1.uploadImage);
exports.default = router;
