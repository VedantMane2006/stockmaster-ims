const mysql = require('mysql2/promise');
require('dotenv').config();

async function addSampleTransactions() {
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
        
        // Get user ID
        const [users] = await connection.query('SELECT user_id FROM users WHERE email = ?', ['admin@stockmaster.com']);
        const userId = users[0].user_id;
        
        // Get products
        const [products] = await connection.query('SELECT product_id, sku FROM products LIMIT 10');
        
        // Get locations
        const [locations] = await connection.query('SELECT location_id, warehouse_id FROM locations');
        
        console.log('📥 Adding sample receipts...');
        
        // Add 5 receipts
        for (let i = 1; i <= 5; i++) {
            const receiptNumber = `RCP-2024-${String(i).padStart(4, '0')}`;
            const status = ['DONE', 'DONE', 'READY', 'WAITING', 'DRAFT'][i-1];
            const scheduledDate = new Date(Date.now() - (i * 86400000)); // i days ago
            
            const [result] = await connection.query(`
                INSERT INTO receipts (receipt_number, supplier_name, warehouse_id, location_id, status, scheduled_date, created_by)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            `, [receiptNumber, `Supplier ${i}`, locations[0].warehouse_id, locations[0].location_id, status, scheduledDate, userId]);
            
            const receiptId = result.insertId;
            
            // Add 2-3 lines per receipt
            const numLines = Math.floor(Math.random() * 2) + 2;
            for (let j = 0; j < numLines; j++) {
                const product = products[Math.floor(Math.random() * products.length)];
                const quantity = Math.floor(Math.random() * 50) + 10;
                
                await connection.query(`
                    INSERT INTO receipt_lines (receipt_id, product_id, quantity_expected, quantity_received)
                    VALUES (?, ?, ?, ?)
                `, [receiptId, product.product_id, quantity, status === 'DONE' ? quantity : 0]);
            }
            
            console.log(`  ✓ Created receipt ${receiptNumber} (${status})`);
        }
        
        console.log('\n📤 Adding sample deliveries...');
        
        // Add 5 deliveries
        for (let i = 1; i <= 5; i++) {
            const deliveryNumber = `DEL-2024-${String(i).padStart(4, '0')}`;
            const status = ['DONE', 'DONE', 'READY', 'WAITING', 'DRAFT'][i-1];
            const scheduledDate = new Date(Date.now() - (i * 86400000));
            
            const [result] = await connection.query(`
                INSERT INTO delivery_orders (delivery_number, customer_name, warehouse_id, location_id, status, scheduled_date, created_by)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            `, [deliveryNumber, `Customer ${i}`, locations[0].warehouse_id, locations[0].location_id, status, scheduledDate, userId]);
            
            const deliveryId = result.insertId;
            
            // Add 2-3 lines per delivery
            const numLines = Math.floor(Math.random() * 2) + 2;
            for (let j = 0; j < numLines; j++) {
                const product = products[Math.floor(Math.random() * products.length)];
                const quantity = Math.floor(Math.random() * 30) + 5;
                
                await connection.query(`
                    INSERT INTO delivery_order_lines (delivery_id, product_id, quantity_ordered, quantity_delivered)
                    VALUES (?, ?, ?, ?)
                `, [deliveryId, product.product_id, quantity, status === 'DONE' ? quantity : 0]);
            }
            
            console.log(`  ✓ Created delivery ${deliveryNumber} (${status})`);
        }
        
        console.log('\n🔄 Adding sample transfers...');
        
        // Add 5 transfers
        for (let i = 1; i <= 5; i++) {
            const transferNumber = `TRF-2024-${String(i).padStart(4, '0')}`;
            const status = ['DONE', 'DONE', 'WAITING', 'WAITING', 'DRAFT'][i-1];
            const scheduledDate = new Date(Date.now() - (i * 86400000));
            
            const fromLocation = locations[Math.floor(Math.random() * locations.length)];
            let toLocation;
            do {
                toLocation = locations[Math.floor(Math.random() * locations.length)];
            } while (toLocation.location_id === fromLocation.location_id);
            
            const product = products[Math.floor(Math.random() * products.length)];
            const quantity = Math.floor(Math.random() * 20) + 5;
            
            await connection.query(`
                INSERT INTO internal_transfers (transfer_number, product_id, from_location_id, to_location_id, quantity, status, scheduled_date, created_by)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            `, [transferNumber, product.product_id, fromLocation.location_id, toLocation.location_id, quantity, status, scheduledDate, userId]);
            
            console.log(`  ✓ Created transfer ${transferNumber} (${status})`);
        }
        
        console.log('\n⚙️ Adding sample adjustments...');
        
        // Add 5 adjustments
        for (let i = 1; i <= 5; i++) {
            const adjustmentNumber = `ADJ-2024-${String(i).padStart(4, '0')}`;
            const location = locations[Math.floor(Math.random() * locations.length)];
            const product = products[Math.floor(Math.random() * products.length)];
            
            const quantityBefore = Math.floor(Math.random() * 100) + 50;
            const difference = Math.floor(Math.random() * 20) - 10; // -10 to +10
            const quantityCounted = quantityBefore + difference;
            
            const reasons = ['DAMAGED', 'LOST', 'FOUND', 'PHYSICAL_COUNT', 'OTHER'];
            const reason = reasons[Math.floor(Math.random() * reasons.length)];
            
            await connection.query(`
                INSERT INTO stock_adjustments (adjustment_number, product_id, location_id, quantity_before, quantity_counted, quantity_difference, reason, created_by)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            `, [adjustmentNumber, product.product_id, location.location_id, quantityBefore, quantityCounted, difference, reason, userId]);
            
            console.log(`  ✓ Created adjustment ${adjustmentNumber} (${difference > 0 ? '+' : ''}${difference})`);
        }
        
        console.log('\n📊 Summary:');
        const [receiptCount] = await connection.query('SELECT COUNT(*) as count FROM receipts');
        const [deliveryCount] = await connection.query('SELECT COUNT(*) as count FROM delivery_orders');
        const [transferCount] = await connection.query('SELECT COUNT(*) as count FROM internal_transfers');
        const [adjustmentCount] = await connection.query('SELECT COUNT(*) as count FROM stock_adjustments');
        
        console.log(`  Receipts: ${receiptCount[0].count}`);
        console.log(`  Deliveries: ${deliveryCount[0].count}`);
        console.log(`  Transfers: ${transferCount[0].count}`);
        console.log(`  Adjustments: ${adjustmentCount[0].count}`);
        
        console.log('\n🎉 Sample transactions added successfully!\n');
        
    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    } finally {
        if (connection) {
            await connection.end();
        }
    }
}

addSampleTransactions();
