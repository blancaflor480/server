import { Request, Response } from 'express';
import { AuthRequest } from '../types/express';
import connection from '../config/database';
import crypto from 'crypto';

export const getAccounts = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const offset = (page - 1) * limit;
    const roleFilter = req.query.roleFilter as string;
    const sortOrder = (req.query.sortOrder as string)?.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';

    const conn = await connection;

    // Build WHERE clause
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

    const [countResult] = await conn.execute(
      `SELECT COUNT(*) as total FROM admin_users ${whereClause}`,
      params
    ) as [Array<{ total: number }>, any];

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
  } catch (error) {
    console.error('Error fetching accounts:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const createAccount = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { username, email, password, role, status } = req.body;

    if (!username || !email || !password || !role) {
      res.status(400).json({ message: 'Required fields missing' });
      return;
    }

    const conn = await connection;

    // Check if email already exists
    const [existing] = await conn.execute(
      'SELECT id FROM admin_users WHERE email = ?',
      [email]
    ) as [any[], any];

    if (existing.length > 0) {
      res.status(409).json({ message: 'Email already exists' });
      return;
    }

    // Hash password
    const hashedPassword = crypto.createHash('md5').update(password).digest('hex');

    const [result] = await conn.execute(
      `INSERT INTO admin_users (username, email, password, role, status, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, NOW(), NOW())`,
      [username, email, hashedPassword, role, status || 'Active']
    ) as [any, any];

    res.status(201).json({
      message: 'Account created successfully',
      id: result.insertId
    });
  } catch (error) {
    console.error('Error creating account:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const updateAccount = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { username, email, password, role, status } = req.body;

    const conn = await connection;

    // Check if account exists
    const [existing] = await conn.execute(
      'SELECT id FROM admin_users WHERE id = ?',
      [id]
    ) as [any[], any];

    if (!existing.length) {
      res.status(404).json({ message: 'Account not found' });
      return;
    }

    // Build update query
    const updates = [];
    const params = [];

    if (username) {
      updates.push('username = ?');
      params.push(username);
    }

    if (email) {
      // Check if email is already taken by another user
      const [emailCheck] = await conn.execute(
        'SELECT id FROM admin_users WHERE email = ? AND id != ?',
        [email, id]
      ) as [any[], any];

      if (emailCheck.length > 0) {
        res.status(409).json({ message: 'Email already exists' });
        return;
      }

      updates.push('email = ?');
      params.push(email);
    }

    if (password) {
      updates.push('password = ?');
      const hashedPassword = crypto.createHash('md5').update(password).digest('hex');
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

    // Add id to params for WHERE clause
    params.push(id);

    const updateQuery = `
      UPDATE admin_users 
      SET ${updates.join(', ')} 
      WHERE id = ?
    `;

    await conn.execute(updateQuery, params);

    // Fetch updated account
    const [updated] = await conn.execute(
      'SELECT id, username, email, role, status, last_login, created_at, updated_at FROM admin_users WHERE id = ?',
      [id]
    ) as [any[], any];

    res.json({
      message: 'Account updated successfully',
      account: updated[0]
    });
  } catch (error) {
    console.error('Error updating account:', error);
    res.status(500).json({ message: 'Failed to update account' });
  }
};

export const deleteAccount = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const conn = await connection;

    await conn.execute('DELETE FROM admin_users WHERE id = ?', [id]);

    res.json({ message: 'Account deleted successfully' });
  } catch (error) {
    console.error('Error deleting account:', error);
    res.status(500).json({ message: 'Server error' });
  }
};