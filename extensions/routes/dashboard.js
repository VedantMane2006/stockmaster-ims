const express = require('express');
const { query } = require('../config/database');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// Get dashboard KPIs
router.get('/dashboard/kpis', authMiddleware, async (req, res) => {
    try {
        const kpis = await query('SELECT * FROM v_dashboard_kpis');
        res.json(kpis[0] || {});
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get recent activity
router.get('/dashboard/recent-activity', authMiddleware, async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 20;
        const activity = await query(`SELECT * FROM v_recent_activity LIMIT ${limit}`);
        res.json(activity);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get stock movements
router.get('/dashboard/stock-movements', authMiddleware, async (req, res) => {
    try {
        const { product_id, location_id, movement_type, limit = 50 } = req.query;
        
        let sql = 'SELECT * FROM v_stock_movements WHERE 1=1';
        const params = [];
        
        if (product_id) {
            sql += ' AND product_id = ?';
            params.push(product_id);
        }
        
        if (location_id) {
            sql += ' AND location_id = ?';
            params.push(location_id);
        }
        
        if (movement_type) {
            sql += ' AND movement_type = ?';
            params.push(movement_type);
        }
        
        sql += ` ORDER BY created_at DESC LIMIT ${parseInt(limit)}`;
        
        const movements = await query(sql, params);
        res.json(movements);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get warehouses
router.get('/warehouses', authMiddleware, async (req, res) => {
    try {
        const warehouses = await query(
            'SELECT * FROM warehouses WHERE is_active = TRUE ORDER BY warehouse_name'
        );
        res.json(warehouses);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get warehouse locations
router.get('/warehouses/:id/locations', authMiddleware, async (req, res) => {
    try {
        const locations = await query(
            'SELECT * FROM locations WHERE warehouse_id = ? AND is_active = TRUE ORDER BY location_name',
            [req.params.id]
        );
        res.json(locations);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Create warehouse
router.post('/warehouses', authMiddleware, async (req, res) => {
    try {
        const { warehouse_code, warehouse_name, address } = req.body;
        
        if (!warehouse_code || !warehouse_name) {
            return res.status(400).json({ error: 'Missing required fields' });
        }
        
        await query(
            'INSERT INTO warehouses (warehouse_code, warehouse_name, address) VALUES (?, ?, ?)',
            [warehouse_code, warehouse_name, address]
        );
        
        res.status(201).json({ message: 'Warehouse created' });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Create location
router.post('/locations', authMiddleware, async (req, res) => {
    try {
        const { warehouse_id, location_code, location_name, location_type } = req.body;
        
        if (!warehouse_id || !location_code || !location_name || !location_type) {
            return res.status(400).json({ error: 'Missing required fields' });
        }
        
        await query(
            'INSERT INTO locations (warehouse_id, location_code, location_name, location_type) VALUES (?, ?, ?, ?)',
            [warehouse_id, location_code, location_name, location_type]
        );
        
        res.status(201).json({ message: 'Location created' });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

module.exports = router;
