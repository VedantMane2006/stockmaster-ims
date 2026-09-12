const express = require('express');
const { query, callProcedure } = require('../config/database');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// Get all receipts
router.get('/receipts', authMiddleware, async (req, res) => {
    try {
        const { status, warehouse_id } = req.query;
        
        let sql = 'SELECT * FROM v_receipts_list WHERE 1=1';
        const params = [];
        
        if (status) {
            sql += ' AND status = ?';
            params.push(status);
        }
        
        if (warehouse_id) {
            sql += ' AND warehouse_id = ?';
            params.push(warehouse_id);
        }
        
        sql += ' ORDER BY created_at DESC LIMIT 100';
        
        const receipts = await query(sql, params);
        res.json(receipts);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get single receipt
router.get('/receipts/:id', authMiddleware, async (req, res) => {
    try {
        const receipts = await query(
            'SELECT * FROM v_receipts_list WHERE receipt_id = ?',
            [req.params.id]
        );
        
        if (receipts.length === 0) {
            return res.status(404).json({ error: 'Receipt not found' });
        }
        
        const lines = await query(
            'SELECT * FROM v_receipt_lines_detail WHERE receipt_id = ?',
            [req.params.id]
        );
        
        res.json({
            receipt: receipts[0],
            lines
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Create receipt
router.post('/receipts', authMiddleware, async (req, res) => {
    try {
        const { supplier_name, warehouse_id, location_id, scheduled_date, notes, lines } = req.body;
        
        if (!supplier_name || !warehouse_id || !location_id) {
            return res.status(400).json({ error: 'Missing required fields' });
        }
        
        // Generate receipt number
        const receipt_number = `RCP-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.floor(Math.random() * 999999).toString().padStart(6, '0')}`;
        
        const result = await query(
            'INSERT INTO receipts (receipt_number, supplier_name, warehouse_id, location_id, scheduled_date, created_by, notes) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [receipt_number, supplier_name, warehouse_id, location_id, scheduled_date, req.user.user_id, notes]
        );
        
        const receipt_id = result.insertId;
        
        // Add lines if provided
        if (lines && lines.length > 0) {
            for (const line of lines) {
                await query(
                    'INSERT INTO receipt_lines (receipt_id, product_id, quantity_expected) VALUES (?, ?, ?)',
                    [receipt_id, line.product_id, line.quantity_expected]
                );
            }
        }
        
        res.status(201).json({ receipt_id, message: 'Receipt created' });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Add receipt line
router.post('/receipts/:id/lines', authMiddleware, async (req, res) => {
    try {
        const { product_id, quantity_expected } = req.body;
        
        if (!product_id || !quantity_expected) {
            return res.status(400).json({ error: 'Missing required fields' });
        }
        
        await query(
            'INSERT INTO receipt_lines (receipt_id, product_id, quantity_expected) VALUES (?, ?, ?)',
            [req.params.id, product_id, quantity_expected]
        );
        
        res.status(201).json({ message: 'Line added' });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Update receipt status
router.put('/receipts/:id/status', authMiddleware, async (req, res) => {
    try {
        const { status } = req.body;
        
        if (!status) {
            return res.status(400).json({ error: 'Status required' });
        }
        
        await query(
            'UPDATE receipts SET status = ? WHERE receipt_id = ?',
            [status, req.params.id]
        );
        
        res.json({ message: 'Status updated' });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Update received quantity
router.put('/receipts/:id/lines/:lineId/receive', authMiddleware, async (req, res) => {
    try {
        const { quantity_received } = req.body;
        
        if (quantity_received === undefined) {
            return res.status(400).json({ error: 'Quantity required' });
        }
        
        await query(
            'UPDATE receipt_lines SET quantity_received = ? WHERE receipt_line_id = ?',
            [quantity_received, req.params.lineId]
        );
        
        res.json({ message: 'Quantity updated' });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Validate receipt
router.post('/receipts/:id/validate', authMiddleware, async (req, res) => {
    try {
        await callProcedure('sp_validate_receipt', [req.params.id, req.user.user_id]);
        res.json({ message: 'Receipt validated, stock updated' });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

module.exports = router;
