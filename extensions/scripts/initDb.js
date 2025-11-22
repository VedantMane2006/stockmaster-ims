const mysql = require('mysql2/promise');
const fs = require('fs').promises;
const path = require('path');
require('dotenv').config();

async function executeSqlFile(connection, filepath) {
    try {
        console.log(`Executing ${filepath}...`);
        const sql = await fs.readFile(filepath, 'utf8');
        
        // Split by delimiter for procedures
        if (sql.includes('DELIMITER')) {
            const statements = [];
            let current = [];
            let delimiter = ';';
            
            for (const line of sql.split('\n')) {
                if (line.trim().startsWith('DELIMITER')) {
                    if (current.length > 0) {
                        statements.push(current.join('\n'));
                        current = [];
                    }
                    delimiter = line.trim().split(/\s+/).pop();
                    continue;
                }
                
                current.push(line);
                if (line.includes(delimiter)) {
                    statements.push(current.join('\n'));
                    current = [];
                }
            }
            
            if (current.length > 0) {
                statements.push(current.join('\n'));
            }
            
            for (const statement of statements) {
                const trimmed = statement.trim();
                if (trimmed && !trimmed.startsWith('--')) {
                    try {
                        await connection.query(trimmed);
                    } catch (err) {
                        if (!err.message.includes('already exists')) {
                            console.warn(`Warning: ${err.message}`);
                        }
                    }
                }
            }
        } else {
            // Execute regular SQL
            const statements = sql.split(';');
            for (const statement of statements) {
                const trimmed = statement.trim();
                if (trimmed && !trimmed.startsWith('--')) {
                    try {
                        await connection.query(trimmed);
                    } catch (err) {
                        if (!err.message.includes('already exists')) {
                            console.warn(`Warning: ${err.message}`);
                        }
                    }
                }
            }
        }
        
        console.log(`✅ Executed ${filepath}`);
    } catch (error) {
        console.error(`❌ Error executing ${filepath}:`, error.message);
        throw error;
    }
}

async function initializeDatabase() {
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
        
        // Execute SQL files
        await executeSqlFile(connection, path.join(__dirname, '../database/schema_mysql.sql'));
        await executeSqlFile(connection, path.join(__dirname, '../database/procedures_mysql.sql'));
        await executeSqlFile(connection, path.join(__dirname, '../database/views_mysql.sql'));
        
        // Insert sample data
        console.log('📝 Inserting sample data...');
        
        // Sample warehouses
        try {
            await connection.query(`
                INSERT IGNORE INTO warehouses (warehouse_code, warehouse_name, address) VALUES
                ('WH001', 'Main Warehouse', '123 Industrial Ave'),
                ('WH002', 'Production Facility', '456 Factory Road')
            `);
        } catch (err) {
            console.warn('Warehouses already exist');
        }
        
        // Sample locations
        try {
            await connection.query(`
                INSERT IGNORE INTO locations (warehouse_id, location_code, location_name, location_type) VALUES
                (1, 'RACK-A1', 'Rack A1', 'RACK'),
                (1, 'RACK-A2', 'Rack A2', 'RACK'),
                (1, 'FLOOR-1', 'Floor Storage 1', 'FLOOR'),
                (2, 'PROD-1', 'Production Line 1', 'PRODUCTION'),
                (2, 'STAGING', 'Staging Area', 'STAGING')
            `);
        } catch (err) {
            console.warn('Locations already exist');
        }
        
        // Sample categories
        try {
            await connection.query(`
                INSERT IGNORE INTO categories (category_name, description) VALUES
                ('Raw Materials', 'Raw materials for production'),
                ('Finished Goods', 'Completed products ready for sale'),
                ('Components', 'Parts and components'),
                ('Consumables', 'Consumable items')
            `);
        } catch (err) {
            console.warn('Categories already exist');
        }
        
        // Sample admin user (password: admin123)
        try {
            await connection.query(`
                INSERT IGNORE INTO users (email, password_hash, full_name, role_id) VALUES
                ('admin@stockmaster.com', '$2a$10$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyYIeWU7u3oi', 'Admin User', 1)
            `);
        } catch (err) {
            console.warn('Admin user already exists');
        }
        
        console.log('✅ Sample data inserted');
        console.log('');
        console.log('🎉 Database initialization completed successfully!');
        console.log('');
        console.log('Default login credentials:');
        console.log('  Email: admin@stockmaster.com');
        console.log('  Password: admin123');
        console.log('');
        
    } catch (error) {
        console.error('❌ Database initialization failed:', error.message);
        process.exit(1);
    } finally {
        if (connection) {
            await connection.end();
        }
    }
}

// Run initialization
initializeDatabase();
