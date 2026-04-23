"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ensureAdminExists = exports.findUserByEmailAndPassword = exports.createUser = exports.getAllUsers = void 0;
const db_1 = require("../db");
const uuid_1 = require("uuid");
const getAllUsers = async () => {
    const [users] = await db_1.readPool.query('SELECT id, email, name, role FROM users');
    return users;
};
exports.getAllUsers = getAllUsers;
const createUser = async (userData) => {
    const { name, email, password, role } = userData;
    const id = (0, uuid_1.v4)();
    await db_1.writePool.query('INSERT INTO users (id, name, email, password, role) VALUES (?, ?, ?, ?, ?)', [id, name, email, password, role || 'user']);
    return id;
};
exports.createUser = createUser;
const findUserByEmailAndPassword = async (email, password) => {
    const [users] = await db_1.readPool.query('SELECT id, email, name, role FROM users WHERE email = ? AND password = ? LIMIT 1', [email, password]);
    return users[0] || null;
};
exports.findUserByEmailAndPassword = findUserByEmailAndPassword;
const ensureAdminExists = async () => {
    const email = 'admin@ipos.com';
    const password = '123';
    const [[existing]] = await db_1.readPool.query('SELECT id FROM users WHERE email = ? LIMIT 1', [email]);
    if (!existing) {
        const id = (0, uuid_1.v4)();
        await db_1.writePool.query('INSERT IGNORE INTO users (id, email, password, name, role) VALUES (?,?,?,?,?)', [id, email, password, 'Admin User', 'admin']);
        return { id, email, name: 'Admin User', role: 'admin' };
    }
    const [[user]] = await db_1.readPool.query('SELECT id, email, name, role FROM users WHERE email = ? LIMIT 1', [email]);
    return user;
};
exports.ensureAdminExists = ensureAdminExists;
