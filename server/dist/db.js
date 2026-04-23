"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.initDb = exports.readPool = exports.writePool = void 0;
const promise_1 = __importDefault(require("mysql2/promise"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
// Create write pool
exports.writePool = promise_1.default.createPool({
    host: process.env.DB_HOST_WRITE,
    port: parseInt(process.env.DB_PORT_WRITE || '3306', 10),
    user: process.env.DB_USER_WRITE,
    password: process.env.DB_PASSWORD_WRITE,
    database: process.env.DB_DATABASE_WRITE,
    connectTimeout: parseInt(process.env.DB_CONNECTTIMEOUT_WRITE || '10000', 10),
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
});
// Log pool errors to prevent silent crashes
exports.writePool.on('error', (err) => {
    console.error('[server]: Unexpected error on idle WRITE database connection', err);
});
// Create read pool
exports.readPool = promise_1.default.createPool({
    host: process.env.DB_HOST_READ,
    port: parseInt(process.env.DB_PORT_READ || '3306', 10),
    user: process.env.DB_USER_READ,
    password: process.env.DB_PASSWORD_READ,
    database: process.env.DB_DATABASE_READ,
    connectTimeout: parseInt(process.env.DB_CONNECTTIMEOUT_READ || '10000', 10),
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
});
exports.readPool.on('error', (err) => {
    console.error('[server]: Unexpected error on idle READ database connection', err);
});
const initDb = async () => {
    try {
        const connection = await exports.writePool.getConnection();
        // Auto-create basic tables if they don't exist
        // DISABLED: user 'app_write' lacks CREATE TABLE privileges.
        console.log('[server]: Database connected successfully.');
        console.log('[server]: WARNING: Please ensure the "products", "orders", and "users" tables are manually created, as the current user lacks CREATE privileges.');
        connection.release();
    }
    catch (error) {
        console.error('[server]: Database initialization error:', error);
    }
};
exports.initDb = initDb;
