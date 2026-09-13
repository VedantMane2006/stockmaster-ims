const express = require('express');
const { query, callProcedure } = require('../config/database');
const { authMiddleware, authorize } = require('../middleware/auth');

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
router.post('/receipts', authMiddleware, authorize(['ADMIN', 'MANAGER', 'INVENTORY_CLERK']), async (req, res) => {
    try {
        const { supplier_name, warehouse_id, location_id, scheduled_date, notes, lines } = req.body;
        
        if (!supplier_name || !warehouse_id || !location_id) {
            return res.status(400).json({ error: 'Missing required fields' });
        }
        
        // Generate receipt number
        const receipt_number = `RCP-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.floor(Math.random() * 999999).toString().padStart(6, '0')}`;
        
        const result = await query(
            'INSERT INTO receipts (receipt_number, supplier_name, warehouse_id, location_id, scheduled_date, created_by, notes) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [receipt_number, supplier_name, warehouse_id, location_id, scheduled_date ?? null, req.user.user_id, notes ?? null]
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
router.post('/receipts/:id/lines', authMiddleware, authorize(['ADMIN', 'MANAGER', 'INVENTORY_CLERK']), async (req, res) => {
    try {
        const { product_id, quantity_expected } = req.body;
        
        if (!product_id || !quantity_expected) {
            return res.status(400).json({ error: 'Missing required fields' });
        }
        
        const rcp = await query('SELECT status FROM receipts WHERE receipt_id = ?', [req.params.id]);
        if (rcp.length === 0) return res.status(404).json({ error: 'Receipt not found' });
        if (rcp[0].status !== 'DRAFT') {
            return res.status(403).json({ error: 'Can only add lines to DRAFT receipts.' });
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
        
        const rcp = await query('SELECT status FROM receipts WHERE receipt_id = ?', [req.params.id]);
        if (rcp.length === 0) return res.status(404).json({ error: 'Receipt not found' });
        
        const currentStatus = rcp[0].status;
        const role = req.user.role_name || (req.user.role_id === 1 ? 'ADMIN' : null);
        
        // Role Checks for specific transitions
        if (status === 'WAITING' && currentStatus === 'DRAFT') {
            if (!['ADMIN', 'MANAGER', 'INVENTORY_CLERK'].includes(role)) {
                return res.status(403).json({ error: 'Unauthorized to confirm receipt' });
            }
        } else if (status === 'READY' && currentStatus === 'WAITING') {
            if (!['ADMIN', 'MANAGER', 'WAREHOUSE_WORKER'].includes(role)) {
                return res.status(403).json({ error: 'Unauthorized to mark receipt as ready' });
            }
        } else if (status === 'CANCELLED') {
             if (!['ADMIN', 'MANAGER'].includes(role)) {
                return res.status(403).json({ error: 'Unauthorized to cancel receipt' });
            }
        } else {
             // Block arbitrary transitions like WAITING to DRAFT unless Admin
             if (role !== 'ADMIN') {
                 return res.status(403).json({ error: 'Invalid state transition' });
             }
        }
        
        if (status === 'READY') {
            const lineCount = await query('SELECT COUNT(*) as count FROM receipt_lines WHERE receipt_id = ?', [req.params.id]);
            if (lineCount[0].count === 0) {
                return res.status(400).json({ error: 'Cannot mark as READY: no items in receipt.' });
            }
            
            const lines = await query(
                'SELECT COUNT(*) as mismatch FROM receipt_lines WHERE receipt_id = ? AND quantity_expected != quantity_received',
                [req.params.id]
            );
            if (lines[0].mismatch > 0) {
                return res.status(400).json({ error: 'Cannot mark as READY: all items must be fully received.' });
            }
        }

        await query(
            `UPDATE receipts 
             SET status = ?, 
                 is_delayed = IF(? = 'CANCELLED' AND scheduled_date < CURRENT_DATE(), TRUE, is_delayed) 
             WHERE receipt_id = ?`,
            [status, status, req.params.id]
        );
        
        res.json({ message: 'Status updated' });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Update received quantity
router.put('/receipts/:id/lines/:lineId/receive', authMiddleware, authorize(['ADMIN', 'MANAGER', 'WAREHOUSE_WORKER']), async (req, res) => {
    try {
        const { quantity_received } = req.body;
        
        if (quantity_received === undefined) {
            return res.status(400).json({ error: 'Quantity required' });
        }

        const rcp = await query('SELECT status FROM receipts WHERE receipt_id = ?', [req.params.id]);
        if (rcp.length === 0) return res.status(404).json({ error: 'Receipt not found' });
        if (!['WAITING', 'READY'].includes(rcp[0].status)) {
            return res.status(403).json({ error: 'Can only update physical quantities in WAITING or READY status.' });
        }

        const lineData = await query(
            'SELECT quantity_expected FROM receipt_lines WHERE receipt_line_id = ?',
            [req.params.lineId]
        );

        if (lineData.length === 0) {
            return res.status(404).json({ error: 'Line not found' });
        }

        if (Number(quantity_received) > Number(lineData[0].quantity_expected)) {
            return res.status(400).json({ error: 'Quantity received cannot exceed quantity expected' });
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
router.post('/receipts/:id/validate', authMiddleware, authorize(['ADMIN', 'MANAGER']), async (req, res) => {
    try {
        const rcp = await query('SELECT status, scheduled_date FROM receipts WHERE receipt_id = ?', [req.params.id]);
        if (rcp.length === 0) return res.status(404).json({ error: 'Receipt not found' });
        if (rcp[0].status !== 'READY') return res.status(403).json({ error: 'Receipt must be in READY status to validate' });

        const total = await query('SELECT SUM(quantity_received) as total FROM receipt_lines WHERE receipt_id = ?', [req.params.id]);
        if (!total[0].total || Number(total[0].total) === 0) {
            return res.status(400).json({ error: 'Cannot validate receipt: no items have been received.' });
        }
        
        // Execute stock update
        await callProcedure('sp_validate_receipt', [req.params.id, req.user.user_id]);
        
        // Persist Delayed status
        const isDelayed = rcp[0].scheduled_date ? new Date().setHours(0,0,0,0) > new Date(rcp[0].scheduled_date).setHours(0,0,0,0) : false;

        await query('UPDATE receipts SET status = ?, is_delayed = ?, received_date = NOW() WHERE receipt_id = ?', 
                    ['DONE', isDelayed, req.params.id]);

        res.json({ message: 'Receipt validated, stock updated' });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

module.exports = router;
