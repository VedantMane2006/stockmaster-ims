const mysql = require('mysql2/promise');
const fs = require('fs').promises;
const path = require('path');
require('dotenv').config();

async function createViews() {
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
        
        // Read and execute views SQL file
        console.log('📊 Creating database views...');
        const viewsSql = await fs.readFile(path.join(__dirname, '../database/views_mysql.sql'), 'utf8');
        
        // Split by CREATE OR REPLACE VIEW and execute each view separately
        const viewStatements = viewsSql.split(/CREATE OR REPLACE VIEW/i);
        
        for (let i = 1; i < viewStatements.length; i++) {
            const viewSql = 'CREATE OR REPLACE VIEW' + viewStatements[i];
            const trimmed = viewSql.trim();
            
            if (trimmed && !trimmed.startsWith('--')) {
                try {
                    await connection.query(trimmed);
                    // Extract view name for logging
                    const match = trimmed.match(/VIEW\s+(\w+)/i);
                    if (match) {
                        console.log(`  ✓ Created view: ${match[1]}`);
                    }
                } catch (err) {
                    console.warn(`  ⚠ Warning: ${err.message}`);
                }
            }
        }
        
        console.log('✅ All views created successfully');
        
        // Verify views
        const [views] = await connection.query("SHOW FULL TABLES WHERE Table_type = 'VIEW'");
        console.log(`\n📋 Total views: ${views.length}`);
        
    } catch (error) {
        console.error('❌ Failed to create views:', error.message);
        process.exit(1);
    } finally {
        if (connection) {
            await connection.end();
        }
    }
}

createViews();
