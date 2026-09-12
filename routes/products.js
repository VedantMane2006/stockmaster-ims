const express = require('express');
const { query, callProcedure } = require('../config/database');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// Get low stock products (MUST be before /products/:id)
router.get('/products/low-stock', authMiddleware, async (req, res) => {
    try {
        const products = await query('SELECT * FROM v_low_stock_products LIMIT 50');
        res.json(products);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get all products
router.get('/products', authMiddleware, async (req, res) => {
    try {
        const { category_id, search } = req.query;
        
        let sql = 'SELECT * FROM v_products_with_stock WHERE 1=1';
        const params = [];
        
        if (category_id) {
            sql += ' AND category_id = ?';
            params.push(category_id);
        }
        
        if (search) {
            sql += ' AND (product_name LIKE ? OR sku LIKE ?)';
            params.push(`%${search}%`, `%${search}%`);
        }
        
        sql += ' ORDER BY product_name LIMIT 100';
        
        const products = await query(sql, params);
        res.json(products);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get single product
router.get('/products/:id', authMiddleware, async (req, res) => {
    try {
        const products = await query(
            'SELECT * FROM v_products_with_stock WHERE product_id = ?',
            [req.params.id]
        );
        
        if (products.length === 0) {
            return res.status(404).json({ error: 'Product not found' });
        }
        
        const stock = await query(
            'SELECT * FROM v_product_stock_by_location WHERE product_id = ?',
            [req.params.id]
        );
        
        res.json({
            product: products[0],
            stock_by_location: stock
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Create product
router.post('/products', authMiddleware, async (req, res) => {
    try {
        const { sku, product_name, category_id, unit_of_measure, reorder_level = 0 } = req.body;
        
        if (!sku || !product_name || !unit_of_measure) {
            return res.status(400).json({ error: 'Missing required fields' });
        }
        
        const result = await query(
            'INSERT INTO products (sku, product_name, category_id, unit_of_measure, reorder_level) VALUES (?, ?, ?, ?, ?)',
            [sku, product_name, category_id, unit_of_measure, reorder_level]
        );
        
        res.status(201).json({
            product_id: result.insertId,
            message: 'Product created'
        });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Update product
router.put('/products/:id', authMiddleware, async (req, res) => {
    try {
        const { product_name, category_id, reorder_level } = req.body;
        
        const result = await query(
            'UPDATE products SET product_name = ?, category_id = ?, reorder_level = ? WHERE product_id = ?',
            [product_name, category_id, reorder_level, req.params.id]
        );
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Product not found' });
        }
        
        res.json({ message: 'Product updated' });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Get categories
router.get('/categories', authMiddleware, async (req, res) => {
    try {
        const categories = await query('SELECT * FROM categories ORDER BY category_name');
        res.json(categories);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Create category
router.post('/categories', authMiddleware, async (req, res) => {
    try {
        const { category_name, parent_category_id, description } = req.body;
        
        if (!category_name) {
            return res.status(400).json({ error: 'Category name required' });
        }
        
        const result = await query(
            'INSERT INTO categories (category_name, parent_category_id, description) VALUES (?, ?, ?)',
            [category_name, parent_category_id, description]
        );
        
        res.status(201).json({ message: 'Category created' });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

module.exports = router;
