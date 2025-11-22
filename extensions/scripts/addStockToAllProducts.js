const mysql = require('mysql2/promise');
require('dotenv').config();

async function addStockToAllProducts() {
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
        
        console.log('✅ Connected to database\n');
        
        // Get all products
        const [products] = await connection.query('SELECT product_id, sku, product_name FROM products');
        console.log(`📦 Found ${products.length} products\n`);
        
        // Get all locations
        const [locations] = await connection.query('SELECT location_id, location_name FROM locations');
        console.log(`📍 Found ${locations.length} locations\n`);
        
        console.log('📊 Adding stock to all products...\n');
        
        let addedCount = 0;
        
        for (const product of products) {
            // Check if product already has stock
            const [existing] = await connection.query(
                'SELECT COUNT(*) as count FROM product_locations WHERE product_id = ?',
                [product.product_id]
            );
            
            if (existing[0].count > 0) {
                console.log(`  ⏭️  ${product.sku} - Already has stock`);
                continue;
            }
            
            // Add stock to 2-3 random locations
            const numLocations = Math.floor(Math.random() * 2) + 2; // 2 or 3 locations
            const usedLocations = new Set();
            
            for (let i = 0; i < numLocations && usedLocations.size < locations.length; i++) {
                let locationIndex;
                do {
                    locationIndex = Math.floor(Math.random() * locations.length);
                } while (usedLocations.has(locationIndex));
                
                usedLocations.add(locationIndex);
                const location = locations[locationIndex];
                
                // Random quantity between 50 and 500
                const quantity = Math.floor(Math.random() * 450) + 50;
                
                await connection.query(
                    'INSERT INTO product_locations (product_id, location_id, quantity) VALUES (?, ?, ?)',
                    [product.product_id, location.location_id, quantity]
                );
                
                console.log(`  ✓ ${product.sku} - Added ${quantity} units to ${location.location_name}`);
                addedCount++;
            }
        }
        
        console.log(`\n✅ Added stock to ${addedCount} product-location combinations\n`);
        
        // Show summary
        console.log('📊 Stock Summary:');
        const [summary] = await connection.query(`
            SELECT 
                p.sku,
                p.product_name,
                COALESCE(SUM(pl.quantity), 0) as total_stock,
                COUNT(pl.product_location_id) as locations
            FROM products p
            LEFT JOIN product_locations pl ON p.product_id = pl.product_id
            GROUP BY p.product_id
            ORDER BY p.sku
        `);
        
        summary.forEach(row => {
            console.log(`  ${row.sku}: ${row.total_stock} units in ${row.locations} locations`);
        });
        
        console.log('\n🎉 Stock added successfully!\n');
        
    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    } finally {
        if (connection) {
            await connection.end();
        }
    }
}

addStockToAllProducts();
