const bcrypt = require('bcryptjs');
const mysql = require('mysql2/promise');
require('dotenv').config();

async function run() {
    const hash = await bcrypt.hash('admin123', 10);
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST || 'localhost',
        port: process.env.DB_PORT || 3306,
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'stockmaster'
    });
    await connection.query('UPDATE users SET password_hash = ? WHERE email = ?', [hash, 'admin@stockmaster.com']);
    console.log('Password updated successfully');
    process.exit();
}
run();
