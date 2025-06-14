"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteAccount = exports.updateAccount = exports.createAccount = exports.getAccounts = void 0;
const database_1 = __importDefault(require("../config/database"));
const crypto_1 = __importDefault(require("crypto"));
const getAccounts = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const offset = (page - 1) * limit;
        const roleFilter = req.query.roleFilter;
        const sortOrder = req.query.sortOrder?.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';
        const conn = await database_1.default;
        const whereConditions = [];
        const params = [];
        if (roleFilter) {
            whereConditions.push('role = ?');
            params.push(roleFilter);
        }
        const whereClause = whereConditions.length > 0
            ? 'WHERE ' + whereConditions.join(' AND ')
            : '';
        const query = `
      SELECT id, username, email, role, status, last_login, created_at, updated_at 
      FROM admin_users 
      ${whereClause}
      ORDER BY username ${sortOrder}
      LIMIT ? OFFSET ?
    `;
        const [items] = await conn.execute(query, [...params, limit, offset]);
        const [countResult] = await conn.execute(`SELECT COUNT(*) as total FROM admin_users ${whereClause}`, params);
        const total = countResult[0]?.total || 0;
        res.json({
            items,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit)
            }
        });
    }
    catch (error) {
        console.error('Error fetching accounts:', error);
        res.status(500).json({ message: 'Server error' });
    }
};
exports.getAccounts = getAccounts;
const createAccount = async (req, res) => {
    try {
        const { username, email, password, role, status } = req.body;
        if (!username || !email || !password || !role) {
            res.status(400).json({ message: 'Required fields missing' });
            return;
        }
        const conn = await database_1.default;
        const [existing] = await conn.execute('SELECT id FROM admin_users WHERE email = ?', [email]);
        if (existing.length > 0) {
            res.status(409).json({ message: 'Email already exists' });
            return;
        }
        const hashedPassword = crypto_1.default.createHash('md5').update(password).digest('hex');
        const [result] = await conn.execute(`INSERT INTO admin_users (username, email, password, role, status, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, NOW(), NOW())`, [username, email, hashedPassword, role, status || 'Active']);
        res.status(201).json({
            message: 'Account created successfully',
            id: result.insertId
        });
    }
    catch (error) {
        console.error('Error creating account:', error);
        res.status(500).json({ message: 'Server error' });
    }
};
exports.createAccount = createAccount;
const updateAccount = async (req, res) => {
    try {
        const { id } = req.params;
        const { username, email, password, role, status } = req.body;
        const conn = await database_1.default;
        const [existing] = await conn.execute('SELECT id FROM admin_users WHERE id = ?', [id]);
        if (!existing.length) {
            res.status(404).json({ message: 'Account not found' });
            return;
        }
        const updates = [];
        const params = [];
        if (username) {
            updates.push('username = ?');
            params.push(username);
        }
        if (email) {
            const [emailCheck] = await conn.execute('SELECT id FROM admin_users WHERE email = ? AND id != ?', [email, id]);
            if (emailCheck.length > 0) {
                res.status(409).json({ message: 'Email already exists' });
                return;
            }
            updates.push('email = ?');
            params.push(email);
        }
        if (password) {
            updates.push('password = ?');
            const hashedPassword = crypto_1.default.createHash('md5').update(password).digest('hex');
            params.push(hashedPassword);
        }
        if (role) {
            updates.push('role = ?');
            params.push(role);
        }
        if (status) {
            updates.push('status = ?');
            params.push(status);
        }
        updates.push('updated_at = NOW()');
        if (updates.length === 0) {
            res.status(400).json({ message: 'No fields to update' });
            return;
        }
        params.push(id);
        const updateQuery = `
      UPDATE admin_users 
      SET ${updates.join(', ')} 
      WHERE id = ?
    `;
        await conn.execute(updateQuery, params);
        const [updated] = await conn.execute('SELECT id, username, email, role, status, last_login, created_at, updated_at FROM admin_users WHERE id = ?', [id]);
        res.json({
            message: 'Account updated successfully',
            account: updated[0]
        });
    }
    catch (error) {
        console.error('Error updating account:', error);
        res.status(500).json({ message: 'Failed to update account' });
    }
};
exports.updateAccount = updateAccount;
const deleteAccount = async (req, res) => {
    try {
        const { id } = req.params;
        const conn = await database_1.default;
        await conn.execute('DELETE FROM admin_users WHERE id = ?', [id]);
        res.json({ message: 'Account deleted successfully' });
    }
    catch (error) {
        console.error('Error deleting account:', error);
        res.status(500).json({ message: 'Server error' });
    }
};
exports.deleteAccount = deleteAccount;
//# sourceMappingURL=account.controller.js.map