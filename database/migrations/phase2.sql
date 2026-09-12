-- ============================================================================
-- Phase 2 Migrations
-- 1. Roles Definition
-- 2. Delayed Indicator
-- 3. Audit Log View
-- ============================================================================

-- Safely remap any users with old roles to the new defaults (except Admin)
UPDATE users SET role_id = 1 WHERE email = 'admin@stockmaster.com';
UPDATE users SET role_id = 4 WHERE role_id > 1;

-- Temporarily disable foreign keys
SET FOREIGN_KEY_CHECKS = 0;

-- Empty roles table and insert the exact requested roles
TRUNCATE TABLE roles;

INSERT INTO roles (role_id, role_name, description) VALUES
(1, 'ADMIN', 'System administrator with full access (Exactly One)'),
(2, 'MANAGER', 'Validates and commits inventory movements'),
(3, 'INVENTORY_CLERK', 'Handles day-to-day inventory records'),
(4, 'WAREHOUSE_WORKER', 'Handles physical warehouse operations');

SET FOREIGN_KEY_CHECKS = 1;

-- Add delayed indicator to receipts and deliveries
ALTER TABLE receipts 
ADD COLUMN is_delayed BOOLEAN NOT NULL DEFAULT FALSE AFTER status;

ALTER TABLE delivery_orders 
ADD COLUMN is_delayed BOOLEAN NOT NULL DEFAULT FALSE AFTER status;

-- Update Views to include is_delayed
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

-- Create Audit Log View
DROP VIEW IF EXISTS v_audit_log;
CREATE VIEW v_audit_log AS
SELECT 
    m.movement_id,
    m.product_id,
    p.sku,
    p.product_name,
    m.location_id,
    l.location_name,
    w.warehouse_name,
    m.movement_type,
    m.reference_type,
    m.reference_id,
    m.quantity_change,
    m.quantity_after,
    m.created_by,
    u.full_name as created_by_name,
    m.created_at
FROM stock_movements m
JOIN products p ON m.product_id = p.product_id
JOIN locations l ON m.location_id = l.location_id
JOIN warehouses w ON l.warehouse_id = w.warehouse_id
JOIN users u ON m.created_by = u.user_id;
