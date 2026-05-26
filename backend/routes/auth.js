import express from 'express';
import { getDB } from '../database/init.js';
import { generateToken, verifyToken } from '../utils/jwt.js';
import { hashPassword, generateToken as genToken } from '../utils/encryption.js';
import { logAudit } from '../middleware/audit.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Mock users for demo (in production, use real database)
const mockUsers = [
  { id: 1, username: 'admin', email: 'admin@gdz.com', role: 'admin', first_name: 'Admin', last_name: 'User' },
  { id: 2, username: 'hr', email: 'hr@gdz.com', role: 'hr', first_name: 'HR', last_name: 'Manager' },
  { id: 3, username: 'employee', email: 'emp@gdz.com', role: 'employee', first_name: 'Employee', last_name: 'User' }
];

// Login endpoint
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    // Mock authentication (in production, hash and compare passwords)
    const user = mockUsers.find(u => u.username === username);
    
    if (!user) {
      await logAudit(null, 'LOGIN_FAILED', 'user', null, { reason: 'Invalid username' });
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate JWT token
    const token = generateToken({
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role
    });

    await logAudit(user.id, 'LOGIN_SUCCESS', 'user', user.id);

    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        first_name: user.first_name,
        last_name: user.last_name
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

// Verify token
router.post('/verify', authenticateToken, (req, res) => {
  res.json({
    valid: true,
    user: req.user
  });
});

// Logout
router.post('/logout', authenticateToken, async (req, res) => {
  try {
    await logAudit(req.user.id, 'LOGOUT', 'user', req.user.id);
    res.json({ success: true, message: 'Logged out successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Logout failed' });
  }
});

// Register new user
router.post('/register', async (req, res) => {
  try {
    const { username, email, password, first_name, last_name, role = 'employee' } = req.body;
    const db = await getDB();

    // Check if user exists
    const existing = await db.get('SELECT id FROM users WHERE username = ? OR email = ?', [username, email]);
    if (existing) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Create user
    const result = await db.run(
      `INSERT INTO users (username, email, password_hash, first_name, last_name, role)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [username, email, hashPassword(password), first_name, last_name, role]
    );

    await logAudit(result.lastID, 'USER_CREATED', 'user', result.lastID);

    const token = generateToken({
      id: result.lastID,
      username,
      email,
      role
    });

    res.status(201).json({
      success: true,
      token,
      user: {
        id: result.lastID,
        username,
        email,
        role,
        first_name,
        last_name
      }
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
});

// Google OAuth callback
router.get('/google/callback', async (req, res) => {
  try {
    const { code } = req.query;
    
    // In production, exchange code for tokens
    // This is simplified - use google-auth-library in production
    
    res.redirect('http://localhost:5173/dashboard');
  } catch (error) {
    res.redirect('http://localhost:5173/login?error=oauth_failed');
  }
});

// Microsoft OAuth callback
router.get('/microsoft/callback', async (req, res) => {
  try {
    const { code } = req.query;
    
    // In production, exchange code for tokens
    // This is simplified - use passport-microsoft in production
    
    res.redirect('http://localhost:5173/dashboard');
  } catch (error) {
    res.redirect('http://localhost:5173/login?error=oauth_failed');
  }
});

// Get current user
router.get('/me', authenticateToken, async (req, res) => {
  try {
    const db = await getDB();
    const user = await db.get('SELECT id, username, email, role, first_name, last_name FROM users WHERE id = ?', [req.user.id]);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

export default router;
