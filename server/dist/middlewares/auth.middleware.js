"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.isAdmin = exports.authenticateToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) {
        return res.status(401).json({ message: 'Authentication token required' });
    }
    jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET || 'ipos_secret_key_2024', (err, user) => {
        if (err)
            return res.status(403).json({ message: 'Invalid or expired token' });
        req.user = user;
        next();
    });
};
exports.authenticateToken = authenticateToken;
const isAdmin = (req, res, next) => {
    const user = req.user;
    if (user && user.role === 'admin') {
        next();
    }
    else {
        res.status(403).json({ message: 'Forbidden: Manager access required' });
    }
};
exports.isAdmin = isAdmin;
