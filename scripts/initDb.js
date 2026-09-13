const mysql = require('mysql2/promise');
const fs = require('fs').promises;
const path = require('path');
require('dotenv').config();

async function executeSqlFile(connection, filepath) {
    try {
        console.log(`Executing ${filepath}...`);
        const sql = await fs.readFile(filepath, 'utf8');
        
        if (sql.includes('DELIMITER')) {
            // Procedure files: parse DELIMITER blocks manually
            const statements = [];
            let current = [];
            let delimiter = ';';
            
            for (const line of sql.split('\n')) {
                const trimmedLine = line.trim();
                if (trimmedLine.startsWith('DELIMITER')) {
                    // Flush any accumulated lines before switching delimiter
                    if (current.length > 0) {
                        const block = current.join('\n').trim();
                        if (block) statements.push(block);
                        current = [];
                    }
                    delimiter = trimmedLine.split(/\s+/).pop();
                    continue;
                }
                
                current.push(line);
                
                // Check if line ends with the current delimiter
                if (trimmedLine === delimiter || trimmedLine.endsWith(delimiter)) {
                    const block = current.join('\n').trim();
                    // Remove trailing delimiter
                    const clean = block.endsWith(delimiter) 
                        ? block.slice(0, -delimiter.length).trim() 
                        : block;
                    if (clean && !clean.startsWith('--')) {
                        statements.push(clean);
                    }
                    current = [];
                }
            }
            
            // Flush remaining
            if (current.length > 0) {
                const block = current.join('\n').trim();
                if (block && !block.startsWith('--')) statements.push(block);
            }
            
            for (const stmt of statements) {
                try {
                    await connection.query(stmt);
                } catch (err) {
                    if (!err.message.includes('already exists')) {
                        console.warn(`Warning: ${err.message}`);
                    }
                }
            }
        } else {
            // Schema and Views: run the entire file at once using multipleStatements
            await connection.query(sql);
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
        await executeSqlFile(connection, path.join(__dirname, '../database/schema.sql'));
        await executeSqlFile(connection, path.join(__dirname, '../database/procedures.sql'));
        await executeSqlFile(connection, path.join(__dirname, '../database/views.sql'));
        
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
                ('admin@stockmaster.com', '$2a$10$hPUTbzEYUqJZz5tHqL81/eT5B6lj5Js3kJtElYv.UvGNkqPPQCq2m', 'Admin User', 1)
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
