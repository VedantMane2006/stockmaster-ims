const mysql = require('mysql2/promise');
require('dotenv').config();

async function loadSampleData() {
    let connection;
    
    try {
        console.log('🔄 Connecting to MySQL...');
        
        connection = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            port: process.env.DB_PORT || 3306,
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '',
            database: process.env.DB_NAME || 'stockmaster'
        });
        
        console.log('✅ Connected to database');
        
        // Add categories
        console.log('📂 Adding categories...');
        await connection.query(`
            INSERT IGNORE INTO categories (category_name, description) VALUES
            ('Electronics', 'Electronic devices and accessories'),
            ('Mobile Devices', 'Smartphones and tablets'),
            ('Computer Accessories', 'Peripherals and accessories'),
            ('Office Supplies', 'Office furniture and supplies')
        `);
        console.log('✅ Categories added');
        
        // Add warehouses
        console.log('🏭 Adding warehouses...');
        await connection.query(`
            INSERT IGNORE INTO warehouses (warehouse_code, warehouse_name, address) VALUES
            ('WH001', 'Main Warehouse', '123 Industrial Ave, Tech City'),
            ('WH002', 'Production Facility', '456 Factory Road, Manufacturing District'),
            ('WH003', 'Distribution Center', '789 Logistics Blvd, Shipping Zone')
        `);
        console.log('✅ Warehouses added');
        
        // Add locations
        console.log('📍 Adding locations...');
        await connection.query(`
            INSERT IGNORE INTO locations (warehouse_id, location_code, location_name, location_type) VALUES
            (1, 'RACK-A1', 'Rack A1', 'RACK'),
            (1, 'RACK-A2', 'Rack A2', 'RACK'),
            (1, 'RACK-B1', 'Rack B1', 'RACK'),
            (1, 'FLOOR-1', 'Floor Storage 1', 'FLOOR'),
            (2, 'PROD-1', 'Production Line 1', 'PRODUCTION'),
            (2, 'STAGING', 'Staging Area', 'STAGING'),
            (3, 'SHIP-1', 'Shipping Zone 1', 'FLOOR'),
            (3, 'SHIP-2', 'Shipping Zone 2', 'FLOOR')
        `);
        console.log('✅ Locations added');
        
        // Add products
        console.log('📦 Adding products...');
        await connection.query(`
            INSERT IGNORE INTO products (sku, product_name, category_id, unit_of_measure, reorder_level) VALUES
            ('SKU001', 'Laptop Dell XPS 15', 1, 'UNIT', 50),
            ('SKU002', 'iPhone 14 Pro', 2, 'UNIT', 100),
            ('SKU003', 'Samsung Galaxy S23', 2, 'UNIT', 80),
            ('SKU004', 'MacBook Pro M2', 1, 'UNIT', 30),
            ('SKU005', 'iPad Air', 2, 'UNIT', 60),
            ('SKU006', 'Sony WH-1000XM5', 3, 'UNIT', 120),
            ('SKU007', 'Logitech MX Master 3', 3, 'UNIT', 200),
            ('SKU008', 'Mechanical Keyboard', 3, 'UNIT', 150),
            ('SKU009', 'USB-C Hub', 3, 'UNIT', 300),
            ('SKU010', 'External SSD 1TB', 1, 'UNIT', 180),
            ('SKU011', 'Webcam HD Pro', 3, 'UNIT', 90),
            ('SKU012', 'Monitor 27" 4K', 1, 'UNIT', 40),
            ('SKU013', 'Desk Lamp LED', 4, 'UNIT', 250),
            ('SKU014', 'Office Chair', 4, 'UNIT', 50),
            ('SKU015', 'Standing Desk', 4, 'UNIT', 25),
            ('SKU016', 'Wireless Charger', 3, 'UNIT', 400),
            ('SKU017', 'Power Bank 20000mAh', 3, 'UNIT', 220),
            ('SKU018', 'HDMI Cable 2m', 3, 'UNIT', 500),
            ('SKU019', 'Laptop Stand', 3, 'UNIT', 180),
            ('SKU020', 'Bluetooth Speaker', 3, 'UNIT', 140),
            ('SKU021', 'Gaming Mouse', 3, 'UNIT', 160),
            ('SKU022', 'USB Flash Drive 64GB', 3, 'UNIT', 600),
            ('SKU023', 'Ethernet Cable 5m', 3, 'UNIT', 400),
            ('SKU024', 'Desk Organizer', 4, 'UNIT', 300),
            ('SKU025', 'Notebook A4', 4, 'UNIT', 800)
        `);
        console.log('✅ Products added');
        
        // Add stock to locations
        console.log('📊 Adding stock to locations...');
        await connection.query(`
            INSERT IGNORE INTO product_locations (product_id, location_id, quantity) VALUES
            (1, 1, 45), (1, 2, 30),
            (2, 1, 95), (2, 3, 50),
            (3, 2, 75), (3, 4, 40),
            (4, 1, 28), (4, 2, 15),
            (5, 2, 58), (5, 3, 35),
            (6, 1, 115), (6, 4, 80),
            (7, 2, 195), (7, 3, 120),
            (8, 1, 145), (8, 4, 90),
            (9, 2, 295), (9, 3, 180),
            (10, 1, 175), (10, 2, 100),
            (11, 2, 88), (11, 3, 55),
            (12, 1, 38), (12, 4, 25),
            (13, 2, 245), (13, 3, 150),
            (14, 1, 48), (14, 4, 30),
            (15, 1, 23), (15, 2, 15),
            (16, 2, 395), (16, 3, 240),
            (17, 1, 215), (17, 4, 130),
            (18, 2, 495), (18, 3, 300),
            (19, 1, 175), (19, 4, 110),
            (20, 2, 138), (20, 3, 85),
            (21, 1, 158), (21, 3, 95),
            (22, 2, 595), (22, 4, 360),
            (23, 1, 395), (23, 3, 240),
            (24, 2, 295), (24, 4, 180),
            (25, 1, 795), (25, 3, 480)
        `);
        console.log('✅ Stock locations added');
        
        // Add users
        console.log('👥 Adding users...');
        await connection.query(`
            INSERT IGNORE INTO users (email, password_hash, full_name, role_id) VALUES
            ('admin@stockmaster.com', '$2a$10$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyYIeWU7u3oi', 'Admin User', 1),
            ('manager@stockmaster.com', '$2a$10$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyYIeWU7u3oi', 'Warehouse Manager', 2),
            ('staff@stockmaster.com', '$2a$10$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyYIeWU7u3oi', 'Staff Member', 3)
        `);
        console.log('✅ Users added');
        
        console.log('');
        console.log('🎉 Sample data loaded successfully!');
        console.log('');
        console.log('📊 Summary:');
        const [categories] = await connection.query('SELECT COUNT(*) as count FROM categories');
        const [warehouses] = await connection.query('SELECT COUNT(*) as count FROM warehouses');
        const [locations] = await connection.query('SELECT COUNT(*) as count FROM locations');
        const [products] = await connection.query('SELECT COUNT(*) as count FROM products');
        const [users] = await connection.query('SELECT COUNT(*) as count FROM users');
        
        console.log(`  Categories: ${categories[0].count}`);
        console.log(`  Warehouses: ${warehouses[0].count}`);
        console.log(`  Locations: ${locations[0].count}`);
        console.log(`  Products: ${products[0].count}`);
        console.log(`  Users: ${users[0].count}`);
        console.log('');
        console.log('🔐 Login credentials (all passwords: admin123):');
        console.log('  Admin: admin@stockmaster.com');
        console.log('  Manager: manager@stockmaster.com');
        console.log('  Staff: staff@stockmaster.com');
        console.log('');
        
    } catch (error) {
        console.error('❌ Failed to load sample data:', error.message);
        process.exit(1);
    } finally {
        if (connection) {
            await connection.end();
        }
    }
}

loadSampleData();
