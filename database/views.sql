-- Database Views for MySQL

-- Product list with category and total stock
CREATE OR REPLACE VIEW v_products_with_stock AS
SELECT 
    p.product_id,
    p.sku,
    p.product_name,
    c.category_name,
    p.unit_of_measure,
    p.reorder_level,
    COALESCE(SUM(pl.quantity), 0) AS total_stock,
    p.is_active,
    p.created_at
FROM products p
LEFT JOIN categories c ON p.category_id = c.category_id
LEFT JOIN product_locations pl ON p.product_id = pl.product_id
GROUP BY p.product_id, p.sku, p.product_name, c.category_name, 
         p.unit_of_measure, p.reorder_level, p.is_active, p.created_at
ORDER BY p.product_name;

-- Low stock products
CREATE OR REPLACE VIEW v_low_stock_products AS
SELECT 
    p.product_id,
    p.sku,
    p.product_name,
    c.category_name,
    COALESCE(SUM(pl.quantity), 0) AS total_stock,
    p.reorder_level,
    p.reorder_level - COALESCE(SUM(pl.quantity), 0) AS stock_deficit
FROM products p
LEFT JOIN categories c ON p.category_id = c.category_id
LEFT JOIN product_locations pl ON p.product_id = pl.product_id
WHERE p.is_active = TRUE
GROUP BY p.product_id, p.sku, p.product_name, c.category_name, p.reorder_level
HAVING COALESCE(SUM(pl.quantity), 0) <= p.reorder_level
ORDER BY stock_deficit DESC;

-- Product stock by location
CREATE OR REPLACE VIEW v_product_stock_by_location AS
SELECT 
    p.product_id,
    p.sku,
    p.product_name,
    w.warehouse_name,
    l.location_name,
    pl.quantity,
    pl.last_updated
FROM product_locations pl
JOIN products p ON pl.product_id = p.product_id
JOIN locations l ON pl.location_id = l.location_id
JOIN warehouses w ON l.warehouse_id = w.warehouse_id
WHERE pl.quantity > 0
ORDER BY p.product_name, w.warehouse_name, l.location_name;

-- Receipt list with details
CREATE OR REPLACE VIEW v_receipts_list AS
SELECT 
    r.receipt_id,
    r.receipt_number,
    r.supplier_name,
    w.warehouse_name,
    l.location_name,
    r.status,
    r.scheduled_date,
    r.received_date,
    u.full_name AS created_by_name,
    r.created_at,
    COUNT(rl.receipt_line_id) AS line_count,
    SUM(rl.quantity_expected) AS total_expected,
    SUM(rl.quantity_received) AS total_received
FROM receipts r
JOIN warehouses w ON r.warehouse_id = w.warehouse_id
JOIN locations l ON r.location_id = l.location_id
JOIN users u ON r.created_by = u.user_id
LEFT JOIN receipt_lines rl ON r.receipt_id = rl.receipt_id
GROUP BY r.receipt_id, r.receipt_number, r.supplier_name, w.warehouse_name,
         l.location_name, r.status, r.scheduled_date, r.received_date,
         u.full_name, r.created_at
ORDER BY r.created_at DESC;

-- Receipt lines with product details
CREATE OR REPLACE VIEW v_receipt_lines_detail AS
SELECT 
    rl.receipt_line_id,
    rl.receipt_id,
    r.receipt_number,
    p.product_id,
    p.sku,
    p.product_name,
    p.unit_of_measure,
    rl.quantity_expected,
    rl.quantity_received,
    rl.quantity_expected - rl.quantity_received AS quantity_pending
FROM receipt_lines rl
JOIN receipts r ON rl.receipt_id = r.receipt_id
JOIN products p ON rl.product_id = p.product_id
ORDER BY rl.receipt_id, p.product_name;

-- Delivery order list with details
CREATE OR REPLACE VIEW v_deliveries_list AS
SELECT 
    d.delivery_id,
    d.delivery_number,
    d.customer_name,
    w.warehouse_name,
    l.location_name,
    d.status,
    d.scheduled_date,
    d.delivered_date,
    u.full_name AS created_by_name,
    d.created_at,
    COUNT(dl.delivery_line_id) AS line_count,
    SUM(dl.quantity_ordered) AS total_ordered,
    SUM(dl.quantity_delivered) AS total_delivered
FROM delivery_orders d
JOIN warehouses w ON d.warehouse_id = w.warehouse_id
JOIN locations l ON d.location_id = l.location_id
JOIN users u ON d.created_by = u.user_id
LEFT JOIN delivery_order_lines dl ON d.delivery_id = dl.delivery_id
GROUP BY d.delivery_id, d.delivery_number, d.customer_name, w.warehouse_name,
         l.location_name, d.status, d.scheduled_date, d.delivered_date,
         u.full_name, d.created_at
ORDER BY d.created_at DESC;

-- Delivery lines with product details
CREATE OR REPLACE VIEW v_delivery_lines_detail AS
SELECT 
    dl.delivery_line_id,
    dl.delivery_id,
    d.delivery_number,
    p.product_id,
    p.sku,
    p.product_name,
    p.unit_of_measure,
    dl.quantity_ordered,
    dl.quantity_delivered,
    dl.quantity_ordered - dl.quantity_delivered AS quantity_pending
FROM delivery_order_lines dl
JOIN delivery_orders d ON dl.delivery_id = d.delivery_id
JOIN products p ON dl.product_id = p.product_id
ORDER BY dl.delivery_id, p.product_name;

-- Internal transfers list
CREATE OR REPLACE VIEW v_transfers_list AS
SELECT 
    t.transfer_id,
    t.transfer_number,
    p.sku,
    p.product_name,
    wf.warehouse_name AS from_warehouse,
    lf.location_name AS from_location,
    wt.warehouse_name AS to_warehouse,
    lt.location_name AS to_location,
    t.quantity,
    p.unit_of_measure,
    t.status,
    t.scheduled_date,
    t.completed_date,
    u.full_name AS created_by_name,
    t.created_at
FROM internal_transfers t
JOIN products p ON t.product_id = p.product_id
JOIN locations lf ON t.from_location_id = lf.location_id
JOIN warehouses wf ON lf.warehouse_id = wf.warehouse_id
JOIN locations lt ON t.to_location_id = lt.location_id
JOIN warehouses wt ON lt.warehouse_id = wt.warehouse_id
JOIN users u ON t.created_by = u.user_id
ORDER BY t.created_at DESC;

-- Stock adjustments list
CREATE OR REPLACE VIEW v_adjustments_list AS
SELECT 
    sa.adjustment_id,
    sa.adjustment_number,
    p.sku,
    p.product_name,
    w.warehouse_name,
    l.location_name,
    sa.quantity_before,
    sa.quantity_counted,
    sa.quantity_difference,
    p.unit_of_measure,
    sa.reason,
    u.full_name AS created_by_name,
    sa.created_at,
    sa.notes
FROM stock_adjustments sa
JOIN products p ON sa.product_id = p.product_id
JOIN locations l ON sa.location_id = l.location_id
JOIN warehouses w ON l.warehouse_id = w.warehouse_id
JOIN users u ON sa.created_by = u.user_id
ORDER BY sa.created_at DESC;

-- Stock movement history (ledger)
CREATE OR REPLACE VIEW v_stock_movements AS
SELECT 
    sm.movement_id,
    sm.created_at,
    p.sku,
    p.product_name,
    w.warehouse_name,
    l.location_name,
    sm.movement_type,
    sm.reference_type,
    sm.reference_id,
    sm.quantity_change,
    sm.quantity_after,
    p.unit_of_measure,
    u.full_name AS created_by_name
FROM stock_movements sm
JOIN products p ON sm.product_id = p.product_id
JOIN locations l ON sm.location_id = l.location_id
JOIN warehouses w ON l.warehouse_id = w.warehouse_id
JOIN users u ON sm.created_by = u.user_id
ORDER BY sm.created_at DESC
LIMIT 1000;

-- Dashboard summary statistics
CREATE OR REPLACE VIEW v_dashboard_kpis AS
SELECT 
    (SELECT COUNT(*) FROM products WHERE is_active = TRUE) AS total_products,
    (SELECT COUNT(*) FROM v_low_stock_products) AS low_stock_count,
    (SELECT COUNT(DISTINCT p.product_id) FROM products p 
     LEFT JOIN product_locations pl ON p.product_id = pl.product_id
     WHERE p.is_active = TRUE
     GROUP BY p.product_id
     HAVING COALESCE(SUM(pl.quantity), 0) = 0) AS out_of_stock_count,
    (SELECT COUNT(*) FROM receipts WHERE status IN ('DRAFT', 'WAITING', 'READY')) AS pending_receipts,
    (SELECT COUNT(*) FROM delivery_orders WHERE status IN ('DRAFT', 'WAITING', 'READY')) AS pending_deliveries,
    (SELECT COUNT(*) FROM internal_transfers WHERE status IN ('DRAFT', 'WAITING')) AS scheduled_transfers,
    (SELECT COALESCE(SUM(quantity), 0) FROM product_locations) AS total_stock_quantity;

-- Recent activity summary
CREATE OR REPLACE VIEW v_recent_activity AS
SELECT 
    'RECEIPT' AS activity_type,
    receipt_number AS reference_number,
    supplier_name AS party_name,
    status,
    created_at
FROM receipts
UNION ALL
SELECT 
    'DELIVERY' AS activity_type,
    delivery_number AS reference_number,
    customer_name AS party_name,
    status,
    created_at
FROM delivery_orders
UNION ALL
SELECT 
    'TRANSFER' AS activity_type,
    transfer_number AS reference_number,
    'Internal' AS party_name,
    status,
    created_at
FROM internal_transfers
ORDER BY created_at DESC
LIMIT 50;
