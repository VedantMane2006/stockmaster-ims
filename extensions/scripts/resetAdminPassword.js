const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
require('dotenv').config();

async function resetAdminPassword() {
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
        
        // Hash the password
        console.log('🔐 Hashing password...');
        const password = 'admin123';
        const password_hash = await bcrypt.hash(password, 10);
        
        // Update all users with the new hash
        console.log('👥 Updating user passwords...');
        await connection.query(
            'UPDATE users SET password_hash = ? WHERE email IN (?, ?, ?)',
            [password_hash, 'admin@stockmaster.com', 'manager@stockmaster.com', 'staff@stockmaster.com']
        );
        
        console.log('✅ Passwords updated successfully');
        console.log('\n🔐 All users now have password: admin123');
        console.log('   - admin@stockmaster.com');
        console.log('   - manager@stockmaster.com');
        console.log('   - staff@stockmaster.com\n');
        
    } catch (error) {
        console.error('❌ Failed to reset passwords:', error.message);
        process.exit(1);
    } finally {
        if (connection) {
            await connection.end();
        }
    }
}

resetAdminPassword();
