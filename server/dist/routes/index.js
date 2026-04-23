"use strict";
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
const router = (0, express_1.Router)();
router.use('/', auth_routes_1.default);
router.use('/users', user_routes_1.default);
router.use('/products', product_routes_1.default);
router.use('/orders', order_routes_1.default);
router.use('/exchange-rates', exchange_rate_routes_1.default);
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
