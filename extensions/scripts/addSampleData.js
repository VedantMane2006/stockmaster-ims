const mysql = require('mysql2/promise');
require('dotenv').config();

async function addSampleData() {
    let connection;
    
    try {
        console.log('🔄 Connecting to MySQL...');
        
        connection = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            port: process.env.DB_PORT || 3306,
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '',
            database: process.env.DB_NAME || 'stockmaster',
            multipleStatements: true
        });
        
        console.log('✅ Connected to database');
        
        // Add more products
        console.log('📦 Adding products...');
        const products = [
            ['SKU001', 'Laptop Dell XPS 15', 1, 'UNIT', 50],
            ['SKU002', 'iPhone 14 Pro', 2, 'UNIT', 100],
            ['SKU003', 'Samsung Galaxy S23', 2, 'UNIT', 80],
            ['SKU004', 'MacBook Pro M2', 1, 'UNIT', 30],
            ['SKU005', 'iPad Air', 2, 'UNIT', 60],
            ['SKU006', 'Sony WH-1000XM5', 3, 'UNIT', 120],
            ['SKU007', 'Logitech MX Master 3', 3, 'UNIT', 200],
            ['SKU008', 'Mechanical Keyboard', 3, 'UNIT', 150],
            ['SKU009', 'USB-C Hub', 3, 'UNIT', 300],
            ['SKU010', 'External SSD 1TB', 1, 'UNIT', 180],
            ['SKU011', 'Webcam HD Pro', 3, 'UNIT', 90],
            ['SKU012', 'Monitor 27" 4K', 1, 'UNIT', 40],
            ['SKU013', 'Desk Lamp LED', 4, 'UNIT', 250],
            ['SKU014', 'Office Chair', 4, 'UNIT', 50],
            ['SKU015', 'Standing Desk', 4, 'UNIT', 25],
            ['SKU016', 'Wireless Charger', 3, 'UNIT', 400],
            ['SKU017', 'Power Bank 20000mAh', 3, 'UNIT', 220],
            ['SKU018', 'HDMI Cable 2m', 3, 'UNIT', 500],
            ['SKU019', 'Laptop Stand', 3, 'UNIT', 180],
            ['SKU020', 'Bluetooth Speaker', 3, 'UNIT', 140]
        ];
        
        for (const product of products) {
            try {
                await connection.query(
                    `INSERT INTO products (sku, product_name, category_id, unit_of_measure, reorder_level) 
                     VALUES (?, ?, ?, ?, ?)`,
                    product
                );
            } catch (err) {
                if (!err.message.includes('Duplicate entry')) {
                    console.warn(`Warning: ${err.message}`);
                }
            }
        }
        console.log('✅ Products added');
        
        // Add stock to locations
        console.log('📍 Adding stock to locations...');
        const stockData = [
            [1, 1, 45],
            [2, 1, 95],
            [3, 2, 75],
            [4, 1, 28],
            [5, 2, 58],
            [6, 1, 115],
            [7, 2, 195],
            [8, 1, 145],
            [9, 2, 295],
            [10, 1, 175],
            [11, 2, 88],
            [12, 1, 38],
            [13, 2, 245],
            [14, 1, 48],
            [15, 1, 23],
            [16, 2, 395],
            [17, 1, 215],
            [18, 2, 495],
            [19, 1, 175],
            [20, 2, 138]
        ];
        
        for (const stock of stockData) {
            try {
                await connection.query(
                    `INSERT INTO product_locations (product_id, location_id, quantity) 
                     VALUES (?, ?, ?)`,
                    stock
                );
            } catch (err) {
                if (!err.message.includes('Duplicate entry')) {
                    console.warn(`Warning: ${err.message}`);
                }
            }
        }
        console.log('✅ Stock locations added');
        
        // Add more users
        console.log('👥 Adding users...');
        const users = [
            ['manager@stockmaster.com', '$2a$10$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyYIeWU7u3oi', 'Warehouse Manager', 2],
            ['staff@stockmaster.com', '$2a$10$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyYIeWU7u3oi', 'Staff Member', 3]
        ];
        
        for (const user of users) {
            try {
                await connection.query(
                    `INSERT INTO users (email, password_hash, full_name, role_id) 
                     VALUES (?, ?, ?, ?)`,
                    user
                );
            } catch (err) {
                if (!err.message.includes('Duplicate entry')) {
                    console.warn(`Warning: ${err.message}`);
                }
            }
        }
        console.log('✅ Users added');
        
        console.log('');
        console.log('🎉 Sample data added successfully!');
        console.log('');
        console.log('Available login credentials:');
        console.log('  Admin: admin@stockmaster.com / admin123');
        console.log('  Manager: manager@stockmaster.com / admin123');
        console.log('  Staff: staff@stockmaster.com / admin123');
        console.log('');
        
    } catch (error) {
        console.error('❌ Failed to add sample data:', error.message);
        process.exit(1);
    } finally {
        if (connection) {
            await connection.end();
        }
    }
}

addSampleData();
