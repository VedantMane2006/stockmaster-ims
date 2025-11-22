const express = require('express');
const { query, callProcedure } = require('../config/database');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// Get all deliveries
router.get('/deliveries', authMiddleware, async (req, res) => {
    try {
        const { status, warehouse_id } = req.query;
        
        let sql = 'SELECT * FROM v_deliveries_list WHERE 1=1';
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
        
        const deliveries = await query(sql, params);
        res.json(deliveries);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get single delivery
router.get('/deliveries/:id', authMiddleware, async (req, res) => {
    try {
        const deliveries = await query(
            'SELECT * FROM v_deliveries_list WHERE delivery_id = ?',
            [req.params.id]
        );
        
        if (deliveries.length === 0) {
            return res.status(404).json({ error: 'Delivery not found' });
        }
        
        const lines = await query(
            'SELECT * FROM v_delivery_lines_detail WHERE delivery_id = ?',
            [req.params.id]
        );
        
        res.json({
            delivery: deliveries[0],
            lines
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Create delivery
router.post('/deliveries', authMiddleware, async (req, res) => {
    try {
        const { customer_name, warehouse_id, location_id, scheduled_date, notes, lines } = req.body;
        
        if (!customer_name || !warehouse_id || !location_id) {
            return res.status(400).json({ error: 'Missing required fields' });
        }
        
        // Generate delivery number
        const delivery_number = `DEL-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.floor(Math.random() * 999999).toString().padStart(6, '0')}`;
        
        const result = await query(
            'INSERT INTO delivery_orders (delivery_number, customer_name, warehouse_id, location_id, scheduled_date, created_by, notes) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [delivery_number, customer_name, warehouse_id, location_id, scheduled_date, req.user.user_id, notes]
        );
        
        const delivery_id = result.insertId;
        
        // Add lines if provided
        if (lines && lines.length > 0) {
            for (const line of lines) {
                await query(
                    'INSERT INTO delivery_order_lines (delivery_id, product_id, quantity_ordered) VALUES (?, ?, ?)',
                    [delivery_id, line.product_id, line.quantity_ordered]
                );
            }
        }
        
        res.status(201).json({ delivery_id, message: 'Delivery created' });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Add delivery line
router.post('/deliveries/:id/lines', authMiddleware, async (req, res) => {
    try {
        const { product_id, quantity_ordered } = req.body;
        
        if (!product_id || !quantity_ordered) {
            return res.status(400).json({ error: 'Missing required fields' });
        }
        
        await query(
            'INSERT INTO delivery_order_lines (delivery_id, product_id, quantity_ordered) VALUES (?, ?, ?)',
            [req.params.id, product_id, quantity_ordered]
        );
        
        res.status(201).json({ message: 'Line added' });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Update delivery status
router.put('/deliveries/:id/status', authMiddleware, async (req, res) => {
    try {
        const { status } = req.body;
        
        if (!status) {
            return res.status(400).json({ error: 'Status required' });
        }
        
        await query(
            'UPDATE delivery_orders SET status = ? WHERE delivery_id = ?',
            [status, req.params.id]
        );
        
        res.json({ message: 'Status updated' });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Update delivered quantity
router.put('/deliveries/:id/lines/:lineId/deliver', authMiddleware, async (req, res) => {
    try {
        const { quantity_delivered } = req.body;
        
        if (quantity_delivered === undefined) {
            return res.status(400).json({ error: 'Quantity required' });
        }
        
        await query(
            'UPDATE delivery_order_lines SET quantity_delivered = ? WHERE delivery_line_id = ?',
            [quantity_delivered, req.params.lineId]
        );
        
        res.json({ message: 'Quantity updated' });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Validate delivery
router.post('/deliveries/:id/validate', authMiddleware, async (req, res) => {
    try {
        await callProcedure('sp_validate_delivery', [req.params.id, req.user.user_id]);
        res.json({ message: 'Delivery validated, stock updated' });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

module.exports = router;
