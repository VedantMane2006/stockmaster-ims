const express = require('express');
const bcrypt = require('bcryptjs');
const { query } = require('../config/database');
const { authMiddleware, authorize } = require('../middleware/auth');

const router = express.Router();

// Get all users (Admin only)
router.get('/users', authMiddleware, authorize(['ADMIN']), async (req, res) => {
    try {
        const users = await query(`
            SELECT u.user_id, u.email, u.full_name, u.role_id, r.role_name, 
                   u.is_active, u.created_at, u.last_login
            FROM users u
            JOIN roles r ON u.role_id = r.role_id
            ORDER BY u.role_id ASC, u.full_name ASC
        `);
        res.json(users);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Create new user (Admin only)
router.post('/users', authMiddleware, authorize(['ADMIN']), async (req, res) => {
    try {
        const { email, password, full_name, role_id } = req.body;

        if (!email || !password || !full_name || !role_id) {
            return res.status(400).json({ error: 'Missing required fields' });
        }
        
        // Single Admin Rule
        if (parseInt(role_id) === 1) {
            return res.status(403).json({ error: 'Cannot create another ADMIN account.' });
        }

        const password_hash = await bcrypt.hash(password, 10);

        const result = await query(
            'INSERT INTO users (email, password_hash, full_name, role_id) VALUES (?, ?, ?, ?)',
            [email, password_hash, full_name, role_id]
        );

        res.status(201).json({
            message: 'Employee account created successfully',
            user_id: result.insertId
        });
    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ error: 'Email already exists' });
        }
        res.status(500).json({ error: error.message });
    }
});

// Update user (Admin only)
router.put('/users/:id', authMiddleware, authorize(['ADMIN']), async (req, res) => {
    try {
        const userId = req.params.id;
        const { role_id, is_active } = req.body;
        
        // Prevent editing the single ADMIN account's role or active status
        const targetUser = await query('SELECT role_id FROM users WHERE user_id = ?', [userId]);
        if (targetUser.length === 0) return res.status(404).json({ error: 'User not found' });
        
        if (targetUser[0].role_id === 1) {
            return res.status(403).json({ error: 'Cannot modify the ADMIN account.' });
        }

        // Prevent assigning the ADMIN role
        if (parseInt(role_id) === 1) {
            return res.status(403).json({ error: 'Cannot assign ADMIN role to an employee.' });
        }

        await query(
            'UPDATE users SET role_id = ?, is_active = ? WHERE user_id = ?',
            [role_id, is_active ? 1 : 0, userId]
        );

        res.json({ message: 'User updated successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get roles (Admin only)
router.get('/roles', authMiddleware, authorize(['ADMIN']), async (req, res) => {
    try {
        const roles = await query('SELECT * FROM roles WHERE role_id > 1 ORDER BY role_id ASC');
        res.json(roles);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
