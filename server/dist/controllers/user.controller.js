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
exports.deleteUser = exports.updateUser = exports.createUser = exports.getUsers = void 0;
const userService = __importStar(require("../services/user.service"));
const getUsers = async (req, res) => {
    try {
        const user = req.user;
        const shopId = req.query.shopId;
        // Logic: 
        // 1. System Admin (no shop_id, no owner_id) sees everything
        // 2. Business Users (Owner or Sub-Admin) see data belonging to their business (owner_id)
        let ownerId = req.query.ownerId;
        const isSystemAdmin = user && !user.shop_id && !user.owner_id;
        if (!isSystemAdmin && user) {
            // For anyone else, scope to their business
            ownerId = user.owner_id || user.id;
        }
        const users = await userService.getAllUsers(shopId, ownerId);
        res.json(users);
    }
    catch (e) {
        console.error(e);
        res.status(500).json({ message: 'Database error' });
    }
};
exports.getUsers = getUsers;
const createUser = async (req, res) => {
    try {
        const user = req.user;
        const userData = { ...req.body };
        // Automatically set owner_id to the current user's ID (the owner) or their owner_id
        if (user) {
            userData.owner_id = user.owner_id || user.id;
        }
        const id = await userService.createUser(userData);
        res.status(201).json({ message: 'User created', id });
    }
    catch (e) {
        console.error(e);
        res.status(500).json({ message: 'Database error' });
    }
};
exports.createUser = createUser;
const updateUser = async (req, res) => {
    try {
        const { id } = req.params;
        await userService.updateUser(id, req.body);
        res.json({ message: 'User updated successfully' });
    }
    catch (e) {
        console.error(e);
        res.status(500).json({ message: 'Database error' });
    }
};
exports.updateUser = updateUser;
const deleteUser = async (req, res) => {
    try {
        const { id } = req.params;
        await userService.deleteUser(id);
        res.json({ message: 'User deleted successfully' });
    }
    catch (e) {
        console.error(e);
        res.status(500).json({ message: 'Database error' });
    }
};
exports.deleteUser = deleteUser;
