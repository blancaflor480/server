import { Request, Response } from 'express';
import connection from '../config/database';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';

interface AdminUser {
  id: number;
  email: string;
  password: string;
  username: string;
  role: string;
}

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;
    console.log('Login attempt for email:', email);

    if (!email || !password) {
      res.status(400).json({ message: 'Email and password are required' });
      return;
    }

    // Create MD5 hash of password
    const hashedPassword = crypto.createHash('md5').update(password).digest('hex');
    console.log('Hashed password:', hashedPassword); // Debug log

    const conn = await connection;
    const [rows] = await conn.execute(
      'SELECT * FROM admin_users WHERE email = ? AND password = ?',
      [email, hashedPassword]
    ) as [AdminUser[], any];

    if (!rows || rows.length === 0) {
      console.log('No user found with email:', email);
      res.status(401).json({ message: 'Invalid credentials' });
      return;
    }

    const user = rows[0]!;

    const token = jwt.sign(
      { 
        id: user.id, 
        email: user.email,
        username: user.username 
      },
      process.env.JWT_SECRET || 'fallbacksecret',
      { expiresIn: '24h' }
    );

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        role: user.role,
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};