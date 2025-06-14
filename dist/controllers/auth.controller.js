"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.login = void 0;
const database_1 = require("../config/database");
const crypto_1 = __importDefault(require("crypto"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        console.log('Login attempt for email:', email);
        if (!email || !password) {
            res.status(400).json({ message: 'Email and password are required' });
            return;
        }
        const hashedPassword = crypto_1.default.createHash('md5').update(password).digest('hex');
        console.log('Hashed password:', hashedPassword);
        const conn = await database_1.connection;
        const [rows] = await conn.execute('SELECT * FROM admin_users WHERE email = ? AND password = ?', [email, hashedPassword]);
        if (!rows || rows.length === 0) {
            console.log('No user found with email:', email);
            res.status(401).json({ message: 'Invalid credentials' });
            return;
        }
        const user = rows[0];
        const token = jsonwebtoken_1.default.sign({
            id: user.id,
            email: user.email,
            username: user.username
        }, process.env.JWT_SECRET || 'fallbacksecret', { expiresIn: '24h' });
        res.json({
            token,
            user: {
                id: user.id,
                email: user.email,
                username: user.username,
                role: user.role,
            }
        });
    }
    catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};
exports.login = login;
//# sourceMappingURL=auth.controller.js.map