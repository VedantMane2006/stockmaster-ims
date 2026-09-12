const mysql = require('mysql2/promise');
require('dotenv').config();

async function fixViews() {
    const dbConfig = {
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || 'password',
        database: process.env.DB_NAME || 'stockmaster',
        multipleStatements: true
    };
    
    try {
        const connection = await mysql.createConnection(dbConfig);
        const sql = `
DROP VIEW IF EXISTS v_receipts_list;
CREATE VIEW v_receipts_list AS
SELECT 
    r.receipt_id,
    r.receipt_number,
    r.supplier_name,
    r.warehouse_id,
    w.warehouse_name,
    r.location_id,
    l.location_name,
    r.status,
    r.is_delayed,
    r.scheduled_date,
    r.received_date,
    r.created_by,
    r.created_at,
    u.full_name as created_by_name,
    r.notes,
    COUNT(rl.receipt_line_id) as line_count,
    COALESCE(SUM(rl.quantity_expected), 0) as total_expected,
    COALESCE(SUM(rl.quantity_received), 0) as total_received
FROM receipts r
JOIN warehouses w ON r.warehouse_id = w.warehouse_id
JOIN locations l ON r.location_id = l.location_id
JOIN users u ON r.created_by = u.user_id
LEFT JOIN receipt_lines rl ON r.receipt_id = rl.receipt_id
GROUP BY r.receipt_id;

DROP VIEW IF EXISTS v_deliveries_list;
CREATE VIEW v_deliveries_list AS
SELECT 
    d.delivery_id,
    d.delivery_number,
    d.customer_name,
    d.warehouse_id,
    w.warehouse_name,
    d.location_id,
    l.location_name,
    d.status,
    d.is_delayed,
    d.scheduled_date,
    d.delivered_date,
    d.created_by,
    d.created_at,
    u.full_name as created_by_name,
    d.notes,
    COUNT(dl.delivery_line_id) as line_count,
    COALESCE(SUM(dl.quantity_ordered), 0) as total_ordered,
    COALESCE(SUM(dl.quantity_delivered), 0) as total_delivered
FROM delivery_orders d
JOIN warehouses w ON d.warehouse_id = w.warehouse_id
JOIN locations l ON d.location_id = l.location_id
JOIN users u ON d.created_by = u.user_id
LEFT JOIN delivery_order_lines dl ON d.delivery_id = dl.delivery_id
GROUP BY d.delivery_id;
`;
        await connection.query(sql);
        console.log('Views updated successfully!');
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}
fixViews();
