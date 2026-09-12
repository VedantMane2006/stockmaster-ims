const express = require('express');
const { query, callProcedure } = require('../config/database');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// Get all adjustments
router.get('/adjustments', authMiddleware, async (req, res) => {
    try {
        const { product_id } = req.query;
        
        let sql = 'SELECT * FROM v_adjustments_list WHERE 1=1';
        const params = [];
        
        if (product_id) {
            sql += ' AND product_id = ?';
            params.push(product_id);
        }
        
        sql += ' ORDER BY created_at DESC LIMIT 100';
        
        const adjustments = await query(sql, params);
        res.json(adjustments);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get single adjustment
router.get('/adjustments/:id', authMiddleware, async (req, res) => {
    try {
        const adjustments = await query(
            'SELECT * FROM v_adjustments_list WHERE adjustment_id = ?',
            [req.params.id]
        );
        
        if (adjustments.length === 0) {
            return res.status(404).json({ error: 'Adjustment not found' });
        }
        
        res.json(adjustments[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Create adjustment
router.post('/adjustments', authMiddleware, async (req, res) => {
    try {
        const { product_id, location_id, quantity_counted, reason, notes } = req.body;
        
        if (!product_id || !location_id || quantity_counted === undefined || !reason) {
            return res.status(400).json({ error: 'Missing required fields' });
        }
        
        // Generate adjustment number
        const adjustment_number = `ADJ-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.floor(Math.random() * 999999).toString().padStart(6, '0')}`;
        
        await callProcedure('sp_create_adjustment', [
            adjustment_number,
            product_id,
            location_id,
            quantity_counted,
            reason,
            req.user.user_id,
            notes
        ]);
        
        res.status(201).json({ message: 'Adjustment created' });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

module.exports = router;
