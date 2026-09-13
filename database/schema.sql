-- ============================================================================
-- StockMaster IMS — MySQL Database Schema
-- Database: MySQL 8.0+
-- Description: Minimal, conventional schema for inventory management
-- ============================================================================

SET FOREIGN_KEY_CHECKS = 0;

-- Drop tables in dependency order
DROP TABLE IF EXISTS stock_movements;
DROP TABLE IF EXISTS delivery_order_lines;
DROP TABLE IF EXISTS delivery_orders;
DROP TABLE IF EXISTS receipt_lines;
DROP TABLE IF EXISTS receipts;
DROP TABLE IF EXISTS internal_transfers;
DROP TABLE IF EXISTS stock_adjustments;
DROP TABLE IF EXISTS product_locations;
DROP TABLE IF EXISTS products;
DROP TABLE IF EXISTS categories;
DROP TABLE IF EXISTS locations;
DROP TABLE IF EXISTS warehouses;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS roles;

SET FOREIGN_KEY_CHECKS = 1;

-- ============================================================================
-- 1. AUTHENTICATION & ACCESS CONTROL
-- ============================================================================

-- Roles: User permission tiers (ADMIN, INVENTORY_MANAGER, WAREHOUSE_STAFF)
CREATE TABLE roles (
    role_id INT AUTO_INCREMENT PRIMARY KEY,
    role_name VARCHAR(50) NOT NULL UNIQUE,
    description VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Users: System accounts with bcrypt password hashes
CREATE TABLE users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    role_id INT NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    otp_code VARCHAR(6) NULL,
    otp_expiry DATETIME NULL,
    last_login TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_users_role FOREIGN KEY (role_id) REFERENCES roles(role_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================================
-- 2. WAREHOUSES & LOCATIONS
-- ============================================================================

-- Warehouses: Physical storage facilities
CREATE TABLE warehouses (
    warehouse_id INT AUTO_INCREMENT PRIMARY KEY,
    warehouse_code VARCHAR(50) NOT NULL UNIQUE,
    warehouse_name VARCHAR(255) NOT NULL,
    address TEXT,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Locations: Specific zones, racks, or staging bins within a warehouse
CREATE TABLE locations (
    location_id INT AUTO_INCREMENT PRIMARY KEY,
    warehouse_id INT NOT NULL,
    location_code VARCHAR(50) NOT NULL,
    location_name VARCHAR(255) NOT NULL,
    location_type ENUM('RACK', 'SHELF', 'FLOOR', 'PRODUCTION', 'STAGING') NOT NULL DEFAULT 'RACK',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_locations_warehouse FOREIGN KEY (warehouse_id) REFERENCES warehouses(warehouse_id) ON DELETE CASCADE,
    CONSTRAINT uk_warehouse_location UNIQUE (warehouse_id, location_code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================================
-- 3. PRODUCT CATALOG
-- ============================================================================

-- Categories: Classification taxonomy for items
CREATE TABLE categories (
    category_id INT AUTO_INCREMENT PRIMARY KEY,
    category_name VARCHAR(100) NOT NULL UNIQUE,
    description VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Products: Master item catalog with tracking units and reorder thresholds
CREATE TABLE products (
    product_id INT AUTO_INCREMENT PRIMARY KEY,
    sku VARCHAR(50) NOT NULL UNIQUE,
    product_name VARCHAR(255) NOT NULL,
    category_id INT NULL,
    unit_of_measure VARCHAR(20) NOT NULL DEFAULT 'UNIT',
    reorder_level INT NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_products_category FOREIGN KEY (category_id) REFERENCES categories(category_id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================================
-- 4. INVENTORY STOCK LEVELS
-- ============================================================================

-- Product Locations: On-hand quantity per product at each specific location
CREATE TABLE product_locations (
    product_location_id INT AUTO_INCREMENT PRIMARY KEY,
    product_id INT NOT NULL,
    location_id INT NOT NULL,
    quantity DECIMAL(15, 2) NOT NULL DEFAULT 0.00,
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_pl_product FOREIGN KEY (product_id) REFERENCES products(product_id) ON DELETE CASCADE,
    CONSTRAINT fk_pl_location FOREIGN KEY (location_id) REFERENCES locations(location_id) ON DELETE CASCADE,
    CONSTRAINT uk_product_location UNIQUE (product_id, location_id),
    CONSTRAINT chk_pl_quantity CHECK (quantity >= 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================================
-- 5. INBOUND RECEIPTS (Supplier Purchases)
-- ============================================================================

-- Receipts: Inbound shipment header
CREATE TABLE receipts (
    receipt_id INT AUTO_INCREMENT PRIMARY KEY,
    receipt_number VARCHAR(50) NOT NULL UNIQUE,
    supplier_name VARCHAR(255) NOT NULL,
    warehouse_id INT NOT NULL,
    location_id INT NOT NULL,
    status ENUM('DRAFT', 'WAITING', 'READY', 'DONE', 'CANCELLED') NOT NULL DEFAULT 'DRAFT',
    is_delayed BOOLEAN NOT NULL DEFAULT FALSE,
    scheduled_date DATE,
    received_date DATETIME,
    created_by INT NOT NULL,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_receipts_warehouse FOREIGN KEY (warehouse_id) REFERENCES warehouses(warehouse_id),
    CONSTRAINT fk_receipts_location FOREIGN KEY (location_id) REFERENCES locations(location_id),
    CONSTRAINT fk_receipts_user FOREIGN KEY (created_by) REFERENCES users(user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Receipt Lines: Individual products and expected/received quantities
CREATE TABLE receipt_lines (
    receipt_line_id INT AUTO_INCREMENT PRIMARY KEY,
    receipt_id INT NOT NULL,
    product_id INT NOT NULL,
    quantity_expected DECIMAL(15, 2) NOT NULL,
    quantity_received DECIMAL(15, 2) NOT NULL DEFAULT 0.00,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_rl_receipt FOREIGN KEY (receipt_id) REFERENCES receipts(receipt_id) ON DELETE CASCADE,
    CONSTRAINT fk_rl_product FOREIGN KEY (product_id) REFERENCES products(product_id),
    CONSTRAINT chk_rl_expected CHECK (quantity_expected > 0),
    CONSTRAINT chk_rl_received CHECK (quantity_received >= 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================================
-- 6. OUTBOUND DELIVERIES (Customer Orders)
-- ============================================================================

-- Delivery Orders: Outbound shipment header
CREATE TABLE delivery_orders (
    delivery_id INT AUTO_INCREMENT PRIMARY KEY,
    delivery_number VARCHAR(50) NOT NULL UNIQUE,
    customer_name VARCHAR(255) NOT NULL,
    warehouse_id INT NOT NULL,
    location_id INT NOT NULL,
    status ENUM('DRAFT', 'WAITING', 'READY', 'DONE', 'CANCELLED') NOT NULL DEFAULT 'DRAFT',
    is_delayed BOOLEAN NOT NULL DEFAULT FALSE,
    scheduled_date DATE,
    delivered_date DATETIME,
    created_by INT NOT NULL,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_deliveries_warehouse FOREIGN KEY (warehouse_id) REFERENCES warehouses(warehouse_id),
    CONSTRAINT fk_deliveries_location FOREIGN KEY (location_id) REFERENCES locations(location_id),
    CONSTRAINT fk_deliveries_user FOREIGN KEY (created_by) REFERENCES users(user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Delivery Order Lines: Individual products and ordered/delivered quantities
CREATE TABLE delivery_order_lines (
    delivery_line_id INT AUTO_INCREMENT PRIMARY KEY,
    delivery_id INT NOT NULL,
    product_id INT NOT NULL,
    quantity_ordered DECIMAL(15, 2) NOT NULL,
    quantity_delivered DECIMAL(15, 2) NOT NULL DEFAULT 0.00,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_dl_delivery FOREIGN KEY (delivery_id) REFERENCES delivery_orders(delivery_id) ON DELETE CASCADE,
    CONSTRAINT fk_dl_product FOREIGN KEY (product_id) REFERENCES products(product_id),
    CONSTRAINT chk_dl_ordered CHECK (quantity_ordered > 0),
    CONSTRAINT chk_dl_delivered CHECK (quantity_delivered >= 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================================
-- 7. INTERNAL TRANSFERS & STOCK ADJUSTMENTS
-- ============================================================================

-- Internal Transfers: Moving stock between locations
CREATE TABLE internal_transfers (
    transfer_id INT AUTO_INCREMENT PRIMARY KEY,
    transfer_number VARCHAR(50) NOT NULL UNIQUE,
    product_id INT NOT NULL,
    from_location_id INT NOT NULL,
    to_location_id INT NOT NULL,
    quantity DECIMAL(15, 2) NOT NULL,
    status ENUM('DRAFT', 'WAITING', 'DONE', 'CANCELLED') NOT NULL DEFAULT 'DRAFT',
    scheduled_date DATE,
    completed_date DATETIME,
    created_by INT NOT NULL,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_transfers_product FOREIGN KEY (product_id) REFERENCES products(product_id),
    CONSTRAINT fk_transfers_from_loc FOREIGN KEY (from_location_id) REFERENCES locations(location_id),
    CONSTRAINT fk_transfers_to_loc FOREIGN KEY (to_location_id) REFERENCES locations(location_id),
    CONSTRAINT fk_transfers_user FOREIGN KEY (created_by) REFERENCES users(user_id),
    CONSTRAINT chk_transfers_diff_loc CHECK (from_location_id != to_location_id),
    CONSTRAINT chk_transfers_quantity CHECK (quantity > 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Stock Adjustments: Physical count corrections and discrepancy logs
CREATE TABLE stock_adjustments (
    adjustment_id INT AUTO_INCREMENT PRIMARY KEY,
    adjustment_number VARCHAR(50) NOT NULL UNIQUE,
    product_id INT NOT NULL,
    location_id INT NOT NULL,
    quantity_before DECIMAL(15, 2) NOT NULL,
    quantity_counted DECIMAL(15, 2) NOT NULL,
    quantity_difference DECIMAL(15, 2) NOT NULL,
    reason ENUM('DAMAGED', 'LOST', 'FOUND', 'PHYSICAL_COUNT', 'OTHER') NOT NULL,
    created_by INT NOT NULL,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_adjustments_product FOREIGN KEY (product_id) REFERENCES products(product_id),
    CONSTRAINT fk_adjustments_location FOREIGN KEY (location_id) REFERENCES locations(location_id),
    CONSTRAINT fk_adjustments_user FOREIGN KEY (created_by) REFERENCES users(user_id),
    CONSTRAINT chk_adjustments_counted CHECK (quantity_counted >= 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================================
-- 8. AUDIT LEDGER (Immutable Stock Movements)
-- ============================================================================

-- Stock Movements: Append-only audit history of every inventory change
CREATE TABLE stock_movements (
    movement_id INT AUTO_INCREMENT PRIMARY KEY,
    product_id INT NOT NULL,
    location_id INT NOT NULL,
    movement_type ENUM('RECEIPT', 'DELIVERY', 'TRANSFER_IN', 'TRANSFER_OUT', 'ADJUSTMENT') NOT NULL,
    reference_type VARCHAR(50) NOT NULL,
    reference_id INT NOT NULL,
    quantity_change DECIMAL(15, 2) NOT NULL,
    quantity_after DECIMAL(15, 2) NOT NULL,
    created_by INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_movements_product FOREIGN KEY (product_id) REFERENCES products(product_id),
    CONSTRAINT fk_movements_location FOREIGN KEY (location_id) REFERENCES locations(location_id),
    CONSTRAINT fk_movements_user FOREIGN KEY (created_by) REFERENCES users(user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================================
-- 9. PERFORMANCE INDEXES
-- ============================================================================

CREATE INDEX idx_products_category ON products(category_id);
CREATE INDEX idx_products_sku ON products(sku);
CREATE INDEX idx_product_locations_product ON product_locations(product_id);
CREATE INDEX idx_product_locations_location ON product_locations(location_id);
CREATE INDEX idx_receipts_status ON receipts(status);
CREATE INDEX idx_receipts_warehouse ON receipts(warehouse_id);
CREATE INDEX idx_delivery_orders_status ON delivery_orders(status);
CREATE INDEX idx_delivery_orders_warehouse ON delivery_orders(warehouse_id);
CREATE INDEX idx_internal_transfers_status ON internal_transfers(status);
CREATE INDEX idx_stock_movements_product ON stock_movements(product_id);
CREATE INDEX idx_stock_movements_location ON stock_movements(location_id);
CREATE INDEX idx_stock_movements_created ON stock_movements(created_at);

-- ============================================================================
-- 10. DEFAULT SYSTEM ROLES
-- ============================================================================

INSERT INTO roles (role_name, description) VALUES
('ADMIN', 'System administrator with full access'),
('INVENTORY_MANAGER', 'Manages incoming and outgoing stock'),
('WAREHOUSE_STAFF', 'Performs transfers, picking, and counting');
