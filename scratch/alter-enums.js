const mysql = require('mysql2/promise');
require('dotenv').config();

async function run() {
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST || 'localhost',
        port: process.env.DB_PORT || 3306,
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'stockmaster'
    });
    
    await connection.query("ALTER TABLE receipts MODIFY COLUMN status ENUM('DRAFT', 'WAITING', 'READY', 'PARTIAL', 'DONE', 'CANCELLED') NOT NULL DEFAULT 'DRAFT'");
    await connection.query("ALTER TABLE delivery_orders MODIFY COLUMN status ENUM('DRAFT', 'WAITING', 'READY', 'PARTIAL', 'DONE', 'CANCELLED') NOT NULL DEFAULT 'DRAFT'");
    
    console.log('ENUMs updated successfully!');
    process.exit(0);
}

run();
