const mysql = require('mysql2/promise');
require('dotenv').config();

async function fixDashboardView() {
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
        
        // Drop existing view
        await connection.query('DROP VIEW IF EXISTS v_dashboard_kpis');
        
        // Create corrected view
        console.log('📊 Creating dashboard KPIs view...');
        await connection.query(`
            CREATE VIEW v_dashboard_kpis AS
            SELECT 
                (SELECT COUNT(*) FROM products WHERE is_active = TRUE) AS total_products,
                (SELECT COUNT(*) FROM v_low_stock_products) AS low_stock_count,
                (SELECT COUNT(*) 
                 FROM (
                     SELECT p.product_id
                     FROM products p 
                     LEFT JOIN product_locations pl ON p.product_id = pl.product_id
                     WHERE p.is_active = TRUE
                     GROUP BY p.product_id
                     HAVING COALESCE(SUM(pl.quantity), 0) = 0
                 ) AS out_of_stock_products
                ) AS out_of_stock_count,
                (SELECT COUNT(*) FROM receipts WHERE status IN ('DRAFT', 'WAITING', 'READY')) AS pending_receipts,
                (SELECT COUNT(*) FROM delivery_orders WHERE status IN ('DRAFT', 'WAITING', 'READY')) AS pending_deliveries,
                (SELECT COUNT(*) FROM internal_transfers WHERE status IN ('DRAFT', 'WAITING')) AS scheduled_transfers,
                (SELECT COALESCE(SUM(quantity), 0) FROM product_locations) AS total_stock_quantity
        `);
        
        console.log('✅ Dashboard KPIs view created successfully');
        
        // Test the view
        const [result] = await connection.query('SELECT * FROM v_dashboard_kpis');
        console.log('\n📊 Dashboard KPIs:');
        console.log(result[0]);
        
    } catch (error) {
        console.error('❌ Failed to fix dashboard view:', error.message);
        process.exit(1);
    } finally {
        if (connection) {
            await connection.end();
        }
    }
}

fixDashboardView();
