"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
const db_1 = require("./db");
const routes_1 = __importDefault(require("./routes"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const port = process.env.PORT || 3000;
app.use((0, cors_1.default)());
app.use(express_1.default.json());
// Serve static assets from the server's public directory
app.use('/assets', express_1.default.static(path_1.default.join(__dirname, '../public/assets')));
app.use('/public', express_1.default.static(path_1.default.join(__dirname, '../public')));
app.use('/uploads', express_1.default.static(path_1.default.join(__dirname, '../public/uploads')));
// Initialize DB
(0, db_1.initDb)();
// API Routes
app.use('/api', routes_1.default);
app.get('/', (req, res) => {
    res.send('iPOS API Backend is running...');
});
app.listen(Number(port), '0.0.0.0', () => {
    console.log(`[server]: Server is running at http://0.0.0.0:${port}`);
});
// Capture termination signals
process.on('SIGTERM', () => {
    console.log('[server]: SIGTERM received. Shutting down gracefully...');
    process.exit(0);
});
process.on('SIGINT', () => {
    console.log('[server]: SIGINT received. Shutting down gracefully...');
    process.exit(0);
});
