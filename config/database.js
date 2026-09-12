const mysql = require('mysql2/promise');
require('dotenv').config();

// Create connection pool
const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'stockmaster',
    waitForConnections: true,
    connectionLimit: 20,
    queueLimit: 0,
    enableKeepAlive: true,
    keepAliveInitialDelay: 0
});

// Test connection
pool.getConnection()
    .then(connection => {
        console.log('✅ Database connected successfully');
        connection.release();
    })
    .catch(err => {
        console.error('❌ Database connection failed:', err.message);
    });

// Helper function to execute queries
async function query(sql, params) {
    try {
        const [rows] = await pool.execute(sql, params);
        return rows;
    } catch (error) {
        console.error('Query error:', error);
        throw error;
    }
}

// Helper function to call stored procedures
async function callProcedure(procedureName, params) {
    try {
        const placeholders = params ? params.map(() => '?').join(',') : '';
        const sql = `CALL ${procedureName}(${placeholders})`;
        const [rows] = await pool.execute(sql, params);
        return rows[0]; // Return first result set
    } catch (error) {
        console.error('Procedure error:', error);
        throw error;
    }
}

module.exports = {
    pool,
    query,
    callProcedure
};
