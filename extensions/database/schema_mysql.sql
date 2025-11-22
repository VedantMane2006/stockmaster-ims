-- StockMaster Database Schema for MySQL
-- MySQL 8.0+

-- Drop existing tables if they exist
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
DROP TABLE IF EXISTS warehouses;
DROP TABLE IF EXISTS locations;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS roles;

-- Roles table
CREATE TABLE roles (
    role_id INT AUTO_INCREMENT PRIMARY KEY,
    role_name VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Users table
CREATE TABLE users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    role_id INT NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    otp_code VARCHAR(6),
    otp_expiry DATETIME,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP NULL,
    FOREIGN KEY (role_id) REFERENCES roles(role_id),
    CHECK (email REGEXP '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$')
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Warehouses table
CREATE TABLE warehouses (
    warehouse_id INT AUTO_INCREMENT PRIMARY KEY,
    warehouse_code VARCHAR(50) UNIQUE NOT NULL,
    warehouse_name VARCHAR(255) NOT NULL,
    address TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Locations within warehouses
CREATE TABLE locations (
    location_id INT AUTO_INCREMENT PRIMARY KEY,
    warehouse_id INT NOT NULL,
    location_code VARCHAR(50) NOT NULL,
    location_name VARCHAR(255) NOT NULL,
    location_type ENUM('RACK', 'SHELF', 'FLOOR', 'PRODUCTION', 'STAGING') NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    FOREIGN KEY (warehouse_id) REFERENCES warehouses(warehouse_id),
    UNIQUE KEY unique_warehouse_location (warehouse_id, location_code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Categories table
CREATE TABLE categories (
    category_id INT AUTO_INCREMENT PRIMARY KEY,
    category_name VARCHAR(255) UNIQUE NOT NULL,
    parent_category_id INT,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (parent_category_id) REFERENCES categories(category_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Products table
CREATE TABLE products (
    product_id INT AUTO_INCREMENT PRIMARY KEY,
    sku VARCHAR(100) UNIQUE NOT NULL,
    product_name VARCHAR(255) NOT NULL,
    category_id INT,
    unit_of_measure ENUM('KG', 'UNIT', 'LITER', 'METER', 'BOX') NOT NULL,
    reorder_level INT DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES categories(category_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Product stock by location
CREATE TABLE product_locations (
    product_location_id INT AUTO_INCREMENT PRIMARY KEY,
    product_id INT NOT NULL,
    location_id INT NOT NULL,
    quantity DECIMAL(15, 2) DEFAULT 0 CHECK (quantity >= 0),
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(product_id),
    FOREIGN KEY (location_id) REFERENCES locations(location_id),
    UNIQUE KEY unique_product_location (product_id, location_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Receipts (Incoming goods)
CREATE TABLE receipts (
    receipt_id INT AUTO_INCREMENT PRIMARY KEY,
    receipt_number VARCHAR(50) UNIQUE NOT NULL,
    supplier_name VARCHAR(255) NOT NULL,
    warehouse_id INT NOT NULL,
    location_id INT NOT NULL,
    status ENUM('DRAFT', 'WAITING', 'READY', 'DONE', 'CANCELLED') DEFAULT 'DRAFT',
    scheduled_date DATE,
    received_date DATETIME,
    created_by INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    notes TEXT,
    FOREIGN KEY (warehouse_id) REFERENCES warehouses(warehouse_id),
    FOREIGN KEY (location_id) REFERENCES locations(location_id),
    FOREIGN KEY (created_by) REFERENCES users(user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE receipt_lines (
    receipt_line_id INT AUTO_INCREMENT PRIMARY KEY,
    receipt_id INT NOT NULL,
    product_id INT NOT NULL,
    quantity_expected DECIMAL(15, 2) NOT NULL CHECK (quantity_expected > 0),
    quantity_received DECIMAL(15, 2) DEFAULT 0 CHECK (quantity_received >= 0),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (receipt_id) REFERENCES receipts(receipt_id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(product_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Delivery Orders (Outgoing goods)
CREATE TABLE delivery_orders (
    delivery_id INT AUTO_INCREMENT PRIMARY KEY,
    delivery_number VARCHAR(50) UNIQUE NOT NULL,
    customer_name VARCHAR(255) NOT NULL,
    warehouse_id INT NOT NULL,
    location_id INT NOT NULL,
    status ENUM('DRAFT', 'WAITING', 'READY', 'DONE', 'CANCELLED') DEFAULT 'DRAFT',
    scheduled_date DATE,
    delivered_date DATETIME,
    created_by INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    notes TEXT,
    FOREIGN KEY (warehouse_id) REFERENCES warehouses(warehouse_id),
    FOREIGN KEY (location_id) REFERENCES locations(location_id),
    FOREIGN KEY (created_by) REFERENCES users(user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE delivery_order_lines (
    delivery_line_id INT AUTO_INCREMENT PRIMARY KEY,
    delivery_id INT NOT NULL,
    product_id INT NOT NULL,
    quantity_ordered DECIMAL(15, 2) NOT NULL CHECK (quantity_ordered > 0),
    quantity_delivered DECIMAL(15, 2) DEFAULT 0 CHECK (quantity_delivered >= 0),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (delivery_id) REFERENCES delivery_orders(delivery_id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(product_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Internal Transfers
CREATE TABLE internal_transfers (
    transfer_id INT AUTO_INCREMENT PRIMARY KEY,
    transfer_number VARCHAR(50) UNIQUE NOT NULL,
    product_id INT NOT NULL,
    from_location_id INT NOT NULL,
    to_location_id INT NOT NULL,
    quantity DECIMAL(15, 2) NOT NULL CHECK (quantity > 0),
    status ENUM('DRAFT', 'WAITING', 'DONE', 'CANCELLED') DEFAULT 'DRAFT',
    scheduled_date DATE,
    completed_date DATETIME,
    created_by INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    notes TEXT,
    FOREIGN KEY (product_id) REFERENCES products(product_id),
    FOREIGN KEY (from_location_id) REFERENCES locations(location_id),
    FOREIGN KEY (to_location_id) REFERENCES locations(location_id),
    FOREIGN KEY (created_by) REFERENCES users(user_id),
    CHECK (from_location_id != to_location_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Stock Adjustments
CREATE TABLE stock_adjustments (
    adjustment_id INT AUTO_INCREMENT PRIMARY KEY,
    adjustment_number VARCHAR(50) UNIQUE NOT NULL,
    product_id INT NOT NULL,
    location_id INT NOT NULL,
    quantity_before DECIMAL(15, 2) NOT NULL,
    quantity_counted DECIMAL(15, 2) NOT NULL CHECK (quantity_counted >= 0),
    quantity_difference DECIMAL(15, 2) NOT NULL,
    reason ENUM('DAMAGED', 'LOST', 'FOUND', 'PHYSICAL_COUNT', 'OTHER') NOT NULL,
    created_by INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    notes TEXT,
    FOREIGN KEY (product_id) REFERENCES products(product_id),
    FOREIGN KEY (location_id) REFERENCES locations(location_id),
    FOREIGN KEY (created_by) REFERENCES users(user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Stock Movement Ledger (Audit trail)
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
    FOREIGN KEY (product_id) REFERENCES products(product_id),
    FOREIGN KEY (location_id) REFERENCES locations(location_id),
    FOREIGN KEY (created_by) REFERENCES users(user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Indexes for performance optimization
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role_id);
CREATE INDEX idx_products_sku ON products(sku);
CREATE INDEX idx_products_category ON products(category_id);
CREATE INDEX idx_product_locations_product ON product_locations(product_id);
CREATE INDEX idx_product_locations_location ON product_locations(location_id);
CREATE INDEX idx_receipts_status ON receipts(status);
CREATE INDEX idx_receipts_warehouse ON receipts(warehouse_id);
CREATE INDEX idx_receipts_date ON receipts(scheduled_date);
CREATE INDEX idx_delivery_status ON delivery_orders(status);
CREATE INDEX idx_delivery_warehouse ON delivery_orders(warehouse_id);
CREATE INDEX idx_delivery_date ON delivery_orders(scheduled_date);
CREATE INDEX idx_transfers_status ON internal_transfers(status);
CREATE INDEX idx_transfers_from_location ON internal_transfers(from_location_id);
CREATE INDEX idx_transfers_to_location ON internal_transfers(to_location_id);
CREATE INDEX idx_stock_movements_product ON stock_movements(product_id);
CREATE INDEX idx_stock_movements_location ON stock_movements(location_id);
CREATE INDEX idx_stock_movements_date ON stock_movements(created_at);
CREATE INDEX idx_stock_movements_type ON stock_movements(movement_type);

-- Insert default roles
INSERT INTO roles (role_name, description) VALUES
('ADMIN', 'System administrator with full access'),
('INVENTORY_MANAGER', 'Manages incoming and outgoing stock'),
('WAREHOUSE_STAFF', 'Performs transfers, picking, and counting');
