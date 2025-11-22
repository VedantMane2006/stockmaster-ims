const mysql = require('mysql2/promise');
const fs = require('fs').promises;
const path = require('path');
require('dotenv').config();

async function createProcedures() {
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
        
        // Read procedures SQL file
        console.log('⚙️ Creating stored procedures...');
        const proceduresSql = await fs.readFile(path.join(__dirname, '../database/procedures_mysql.sql'), 'utf8');
        
        // Remove DELIMITER statements and split procedures
        let cleanSql = proceduresSql.replace(/DELIMITER\s+\$\$/g, '');
        cleanSql = cleanSql.replace(/DELIMITER\s+\$/g, '');
        cleanSql = cleanSql.replace(/DELIMITER\s+;/g, '');
        
        // Split by procedure definitions
        const procedures = cleanSql.split(/DROP PROCEDURE IF EXISTS/i);
        
        let successCount = 0;
        for (let i = 1; i < procedures.length; i++) {
            const procSql = 'DROP PROCEDURE IF EXISTS' + procedures[i];
            const trimmed = procSql.trim().replace(/\$$/g, ';');
            
            if (trimmed && !trimmed.startsWith('--')) {
                try {
                    await connection.query(trimmed);
                    // Extract procedure name
                    const match = trimmed.match(/DROP PROCEDURE IF EXISTS\s+(\w+)/i);
                    if (match) {
                        console.log(`  ✓ Created procedure: ${match[1]}`);
                        successCount++;
                    }
                } catch (err) {
                    console.warn(`  ⚠ Warning: ${err.message.substring(0, 100)}`);
                }
            }
        }
        
        console.log(`✅ Created ${successCount} stored procedures`);
        
    } catch (error) {
        console.error('❌ Failed to create procedures:', error.message);
        // Don't exit with error as procedures are optional
    } finally {
        if (connection) {
            await connection.end();
        }
    }
}

createProcedures();
