const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { query } = require('../config/database');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// Generate JWT token
function generateToken(user) {
    return jwt.sign(
        {
            user_id: user.user_id,
            email: user.email,
            role_id: user.role_id
        },
        process.env.SECRET_KEY || 'dev-secret-key',
        { expiresIn: '24h' }
    );
}

// Register
router.post('/register', async (req, res) => {
    try {
        const { email, password, full_name, role_id = 2 } = req.body;

        if (!email || !password || !full_name) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        // Hash password
        const password_hash = await bcrypt.hash(password, 10);

        // Insert user
        const result = await query(
            'INSERT INTO users (email, password_hash, full_name, role_id) VALUES (?, ?, ?, ?)',
            [email, password_hash, full_name, role_id]
        );

        res.status(201).json({
            message: 'User registered successfully',
            user_id: result.insertId
        });
    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ error: 'Email already exists' });
        }
        res.status(500).json({ error: error.message });
    }
});

// Login
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password required' });
        }

        // Get user
        const users = await query(
            `SELECT u.user_id, u.email, u.password_hash, u.full_name, u.role_id, 
                    r.role_name, u.is_active
             FROM users u
             JOIN roles r ON u.role_id = r.role_id
             WHERE u.email = ?`,
            [email]
        );

        if (users.length === 0) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        const user = users[0];

        if (!user.is_active) {
            return res.status(401).json({ error: 'Account is inactive' });
        }

        // Verify password
        const isValid = await bcrypt.compare(password, user.password_hash);
        
        if (!isValid) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        // Update last login
        await query('UPDATE users SET last_login = NOW() WHERE user_id = ?', [user.user_id]);

        // Generate token
        const token = generateToken(user);

        res.json({
            token,
            user: {
                user_id: user.user_id,
                email: user.email,
                full_name: user.full_name,
                role_id: user.role_id,
                role_name: user.role_name
            }
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Forgot password
router.post('/forgot-password', async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ error: 'Email required' });
        }

        const users = await query(
            'SELECT user_id FROM users WHERE email = ? AND is_active = TRUE',
            [email]
        );

        if (users.length === 0) {
            return res.status(404).json({ error: 'Email not found' });
        }

        // Generate OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const expiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

        await query(
            'UPDATE users SET otp_code = ?, otp_expiry = ? WHERE email = ?',
            [otp, expiry, email]
        );

        // In production, send OTP via email/SMS
        res.json({ message: 'OTP sent', otp }); // For testing only
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Reset password
router.post('/reset-password', async (req, res) => {
    try {
        const { email, otp, new_password } = req.body;

        if (!email || !otp || !new_password) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        const users = await query(
            'SELECT user_id, otp_code, otp_expiry FROM users WHERE email = ? AND is_active = TRUE',
            [email]
        );

        if (users.length === 0) {
            return res.status(400).json({ error: 'Invalid request' });
        }

        const user = users[0];

        if (!user.otp_code || !user.otp_expiry) {
            return res.status(400).json({ error: 'No OTP request found' });
        }

        if (new Date() > new Date(user.otp_expiry)) {
            return res.status(400).json({ error: 'OTP expired' });
        }

        if (user.otp_code !== otp) {
            return res.status(400).json({ error: 'Invalid OTP' });
        }

        // Hash new password
        const password_hash = await bcrypt.hash(new_password, 10);

        await query(
            'UPDATE users SET password_hash = ?, otp_code = NULL, otp_expiry = NULL WHERE user_id = ?',
            [password_hash, user.user_id]
        );

        res.json({ message: 'Password reset successful' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get profile
router.get('/profile', authMiddleware, async (req, res) => {
    try {
        const users = await query(
            `SELECT u.user_id, u.email, u.full_name, u.role_id, r.role_name, 
                    u.is_active, u.created_at, u.last_login
             FROM users u
             JOIN roles r ON u.role_id = r.role_id
             WHERE u.user_id = ?`,
            [req.user.user_id]
        );

        if (users.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json(users[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
