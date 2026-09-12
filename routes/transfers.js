const express = require('express');
const { query, callProcedure } = require('../config/database');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// Get all transfers
router.get('/transfers', authMiddleware, async (req, res) => {
    try {
        const { status } = req.query;
        
        let sql = 'SELECT * FROM v_transfers_list WHERE 1=1';
        const params = [];
        
        if (status) {
            sql += ' AND status = ?';
            params.push(status);
        }
        
        sql += ' ORDER BY created_at DESC LIMIT 100';
        
        const transfers = await query(sql, params);
        res.json(transfers);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get single transfer
router.get('/transfers/:id', authMiddleware, async (req, res) => {
    try {
        const transfers = await query(
            'SELECT * FROM v_transfers_list WHERE transfer_id = ?',
            [req.params.id]
        );
        
        if (transfers.length === 0) {
            return res.status(404).json({ error: 'Transfer not found' });
        }
        
        res.json(transfers[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Create and execute transfer
router.post('/transfers', authMiddleware, async (req, res) => {
    try {
        const { product_id, from_location_id, to_location_id, quantity, notes } = req.body;
        
        if (!product_id || !from_location_id || !to_location_id || !quantity) {
            return res.status(400).json({ error: 'Missing required fields' });
        }
        
        if (from_location_id === to_location_id) {
            return res.status(400).json({ error: 'Source and destination must be different' });
        }
        
        // Generate transfer number
        const transfer_number = `TRF-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.floor(Math.random() * 999999).toString().padStart(6, '0')}`;
        
        await callProcedure('sp_execute_transfer', [
            transfer_number,
            product_id,
            from_location_id,
            to_location_id,
            quantity,
            req.user.user_id,
            notes
        ]);
        
        res.status(201).json({ message: 'Transfer completed' });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

module.exports = router;
