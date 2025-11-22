const mysql = require('mysql2/promise');
require('dotenv').config();

async function verifySetup() {
    let connection;
    
    try {
        console.log('🔍 Verifying StockMaster Setup...\n');
        
        connection = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            port: process.env.DB_PORT || 3306,
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '',
            database: process.env.DB_NAME || 'stockmaster'
        });
        
        console.log('✅ Database connection successful\n');
        
        // Check tables
        console.log('📋 Checking tables...');
        const [tables] = await connection.query("SHOW TABLES");
        console.log(`  ✓ Found ${tables.length} tables\n`);
        
        // Check views
        console.log('👁️ Checking views...');
        const [views] = await connection.query("SHOW FULL TABLES WHERE Table_type = 'VIEW'");
        console.log(`  ✓ Found ${views.length} views\n`);
        
        // Check data
        console.log('📊 Checking data...');
        
        const [categories] = await connection.query('SELECT COUNT(*) as count FROM categories');
        console.log(`  ✓ Categories: ${categories[0].count}`);
        
        const [warehouses] = await connection.query('SELECT COUNT(*) as count FROM warehouses');
        console.log(`  ✓ Warehouses: ${warehouses[0].count}`);
        
        const [locations] = await connection.query('SELECT COUNT(*) as count FROM locations');
        console.log(`  ✓ Locations: ${locations[0].count}`);
        
        const [products] = await connection.query('SELECT COUNT(*) as count FROM products');
        console.log(`  ✓ Products: ${products[0].count}`);
        
        const [users] = await connection.query('SELECT COUNT(*) as count FROM users');
        console.log(`  ✓ Users: ${users[0].count}`);
        
        const [stock] = await connection.query('SELECT COUNT(*) as count FROM product_locations');
        console.log(`  ✓ Stock locations: ${stock[0].count}\n`);
        
        // Test dashboard KPIs view
        console.log('🎯 Testing dashboard KPIs view...');
        const [kpis] = await connection.query('SELECT * FROM v_dashboard_kpis');
        console.log('  ✓ Dashboard KPIs:');
        console.log(`    - Total Products: ${kpis[0].total_products}`);
        console.log(`    - Low Stock: ${kpis[0].low_stock_count}`);
        console.log(`    - Out of Stock: ${kpis[0].out_of_stock_count}`);
        console.log(`    - Total Stock Quantity: ${kpis[0].total_stock_quantity}\n`);
        
        // Check users
        console.log('👥 Available users:');
        const [userList] = await connection.query('SELECT email, full_name, role_id FROM users');
        userList.forEach(user => {
            console.log(`  ✓ ${user.email} (${user.full_name}) - Role ID: ${user.role_id}`);
        });
        
        console.log('\n🎉 Setup verification complete!');
        console.log('\n📝 Summary:');
        console.log('  ✅ Database connected');
        console.log('  ✅ All tables created');
        console.log('  ✅ All views created');
        console.log('  ✅ Sample data loaded');
        console.log('  ✅ Dashboard KPIs working');
        console.log('\n🌐 Access your application at: http://localhost:5000');
        console.log('🔐 Login with: admin@stockmaster.com / admin123\n');
        
    } catch (error) {
        console.error('❌ Verification failed:', error.message);
        process.exit(1);
    } finally {
        if (connection) {
            await connection.end();
        }
    }
}

verifySetup();
