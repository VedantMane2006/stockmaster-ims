INSERT IGNORE INTO warehouses (warehouse_code, warehouse_name, address) VALUES
('WH001', 'Main Warehouse', '123 Industrial Ave'),
('WH002', 'Production Facility', '456 Factory Road');

INSERT IGNORE INTO locations (warehouse_id, location_code, location_name, location_type) VALUES
(1, 'RACK-A1', 'Rack A1', 'RACK'),
(1, 'RACK-A2', 'Rack A2', 'RACK'),
(1, 'FLOOR-1', 'Floor Storage 1', 'FLOOR'),
(2, 'PROD-1', 'Production Line 1', 'PRODUCTION'),
(2, 'STAGING', 'Staging Area', 'STAGING');

INSERT IGNORE INTO categories (category_name, description) VALUES
('Raw Materials', 'Raw materials for production'),
('Finished Goods', 'Completed products ready for sale'),
('Components', 'Parts and components'),
('Consumables', 'Consumable items');

INSERT IGNORE INTO users (email, password_hash, full_name, role_id) VALUES
('admin@stockmaster.com', '$2a$10$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyYIeWU7u3oi', 'Admin User', 1);
