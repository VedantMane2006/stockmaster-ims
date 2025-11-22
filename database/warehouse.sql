
-- Warehouse Full SQL: Schema + Triggers + Seed Data + Sample Transactions
-- Generated for user's IMS (MySQL)

CREATE DATABASE IF NOT EXISTS `Warehouse`;
USE `Warehouse`;

-- =========================
-- SCHEMA
-- =========================

-- USERS
CREATE TABLE IF NOT EXISTS users (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(150),
  role ENUM('admin','inventory_manager','warehouse_staff') DEFAULT 'warehouse_staff',
  otp_code VARCHAR(10),
  otp_expiry DATETIME,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- WAREHOUSES
CREATE TABLE IF NOT EXISTS warehouses (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(200) NOT NULL,
  code VARCHAR(50) UNIQUE,
  address TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS locations (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  warehouse_id BIGINT NOT NULL,
  name VARCHAR(200) NOT NULL,
  short_code VARCHAR(50),
  FOREIGN KEY (warehouse_id) REFERENCES warehouses(id) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB;

-- PRODUCT CATEGORIES
CREATE TABLE IF NOT EXISTS product_categories (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(150) UNIQUE NOT NULL
) ENGINE=InnoDB;

-- PRODUCTS
CREATE TABLE IF NOT EXISTS products (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  sku VARCHAR(100) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  category_id BIGINT,
  uom VARCHAR(50),
  reorder_level INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (category_id) REFERENCES product_categories(id) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB;

-- STOCK LEVELS
CREATE TABLE IF NOT EXISTS stock_levels (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  product_id BIGINT NOT NULL,
  warehouse_id BIGINT NOT NULL,
  location_id BIGINT NULL,
  quantity DECIMAL(20,4) DEFAULT 0,
  UNIQUE KEY uq_stock (product_id, warehouse_id, location_id),
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE ON UPDATE CASCADE,
  FOREIGN KEY (warehouse_id) REFERENCES warehouses(id) ON DELETE CASCADE ON UPDATE CASCADE,
  FOREIGN KEY (location_id) REFERENCES locations(id) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB;

-- STOCK LEDGER
CREATE TABLE IF NOT EXISTS stock_ledger (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  product_id BIGINT NOT NULL,
  warehouse_id BIGINT,
  location_id BIGINT,
  `change` DECIMAL(20,4) NOT NULL,
  doc_type ENUM('receipt','delivery','transfer','adjustment') NOT NULL,
  doc_id BIGINT,
  note TEXT,
  created_by BIGINT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE ON UPDATE CASCADE,
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB;

-- RECEIPTS
CREATE TABLE IF NOT EXISTS receipts (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  ref_no VARCHAR(100) UNIQUE,
  supplier VARCHAR(255),
  status ENUM('draft','waiting','ready','done','cancelled') DEFAULT 'draft',
  created_by BIGINT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS receipt_items (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  receipt_id BIGINT NOT NULL,
  product_id BIGINT NOT NULL,
  warehouse_id BIGINT NOT NULL,
  location_id BIGINT NULL,
  qty DECIMAL(20,4) NOT NULL,
  FOREIGN KEY (receipt_id) REFERENCES receipts(id) ON DELETE CASCADE ON UPDATE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE ON UPDATE CASCADE,
  FOREIGN KEY (warehouse_id) REFERENCES warehouses(id) ON DELETE CASCADE ON UPDATE CASCADE,
  FOREIGN KEY (location_id) REFERENCES locations(id) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB;

-- DELIVERIES
CREATE TABLE IF NOT EXISTS deliveries (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  ref_no VARCHAR(100) UNIQUE,
  customer VARCHAR(255),
  status ENUM('draft','waiting','ready','done','cancelled') DEFAULT 'draft',
  created_by BIGINT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS delivery_items (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  delivery_id BIGINT NOT NULL,
  product_id BIGINT NOT NULL,
  warehouse_id BIGINT NOT NULL,
  location_id BIGINT NULL,
  qty DECIMAL(20,4) NOT NULL,
  FOREIGN KEY (delivery_id) REFERENCES deliveries(id) ON DELETE CASCADE ON UPDATE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE ON UPDATE CASCADE,
  FOREIGN KEY (warehouse_id) REFERENCES warehouses(id) ON DELETE CASCADE ON UPDATE CASCADE,
  FOREIGN KEY (location_id) REFERENCES locations(id) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB;

-- TRANSFERS
CREATE TABLE IF NOT EXISTS transfers (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  ref_no VARCHAR(100) UNIQUE,
  from_warehouse_id BIGINT,
  to_warehouse_id BIGINT,
  status ENUM('draft','waiting','ready','done','cancelled') DEFAULT 'draft',
  created_by BIGINT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (from_warehouse_id) REFERENCES warehouses(id) ON DELETE SET NULL ON UPDATE CASCADE,
  FOREIGN KEY (to_warehouse_id) REFERENCES warehouses(id) ON DELETE SET NULL ON UPDATE CASCADE,
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS transfer_items (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  transfer_id BIGINT NOT NULL,
  product_id BIGINT NOT NULL,
  from_location_id BIGINT,
  to_location_id BIGINT,
  qty DECIMAL(20,4) NOT NULL,
  FOREIGN KEY (transfer_id) REFERENCES transfers(id) ON DELETE CASCADE ON UPDATE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE ON UPDATE CASCADE,
  FOREIGN KEY (from_location_id) REFERENCES locations(id) ON DELETE SET NULL ON UPDATE CASCADE,
  FOREIGN KEY (to_location_id) REFERENCES locations(id) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB;

-- ADJUSTMENTS
CREATE TABLE IF NOT EXISTS adjustments (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  ref_no VARCHAR(100) UNIQUE,
  reason TEXT,
  status ENUM('draft','done','cancelled') DEFAULT 'draft',
  created_by BIGINT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS adjustment_items (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  adjustment_id BIGINT NOT NULL,
  product_id BIGINT NOT NULL,
  warehouse_id BIGINT,
  location_id BIGINT,
  qty_counted DECIMAL(20,4),
  qty_prev DECIMAL(20,4),
  `change` DECIMAL(20,4),
  FOREIGN KEY (adjustment_id) REFERENCES adjustments(id) ON DELETE CASCADE ON UPDATE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE ON UPDATE CASCADE,
  FOREIGN KEY (warehouse_id) REFERENCES warehouses(id) ON DELETE SET NULL ON UPDATE CASCADE,
  FOREIGN KEY (location_id) REFERENCES locations(id) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB;

-- Indexes for performance
-- Indexes for performance
CREATE INDEX idx_products_sku ON products(sku);
CREATE INDEX idx_stock_product ON stock_levels(product_id);
CREATE INDEX idx_stock_warehouse ON stock_levels(warehouse_id);
CREATE INDEX idx_ledger_product ON stock_ledger(product_id, created_at);
CREATE INDEX idx_receipts_status ON receipts(status);
CREATE INDEX idx_deliveries_status ON deliveries(status);


-- =========================
-- TRIGGERS
-- =========================

DELIMITER $$

-- Receipt item inserted -> increase stock_levels and insert ledger
CREATE TRIGGER trg_after_insert_receipt_item
AFTER INSERT ON receipt_items
FOR EACH ROW
BEGIN
  -- Upsert stock_levels
  INSERT INTO stock_levels (product_id, warehouse_id, location_id, quantity)
  VALUES (NEW.product_id, NEW.warehouse_id, NEW.location_id, NEW.qty)
  ON DUPLICATE KEY UPDATE quantity = quantity + NEW.qty;

  -- Insert ledger entry (+)
  INSERT INTO stock_ledger (product_id, warehouse_id, location_id, `change`, doc_type, doc_id, note, created_at)
  VALUES (NEW.product_id, NEW.warehouse_id, NEW.location_id, NEW.qty, 'receipt', NEW.receipt_id, CONCAT('Receipt item #', NEW.id), NOW());
END$$

-- Delivery item inserted -> decrease stock_levels and insert ledger
CREATE TRIGGER trg_after_insert_delivery_item
AFTER INSERT ON delivery_items
FOR EACH ROW
BEGIN
  -- Decrease stock_levels (assumes app checks for negative / backorder policy)
  UPDATE stock_levels
    SET quantity = quantity - NEW.qty
    WHERE product_id = NEW.product_id
      AND warehouse_id = NEW.warehouse_id
      AND (location_id = NEW.location_id OR (location_id IS NULL AND NEW.location_id IS NULL));

  -- Insert ledger entry (-)
  INSERT INTO stock_ledger (product_id, warehouse_id, location_id, `change`, doc_type, doc_id, note, created_at)
  VALUES (NEW.product_id, NEW.warehouse_id, NEW.location_id, -NEW.qty, 'delivery', NEW.delivery_id, CONCAT('Delivery item #', NEW.id), NOW());
END$$

-- Transfer item inserted -> move stock out & in and insert ledger entries
CREATE TRIGGER trg_after_insert_transfer_item
AFTER INSERT ON transfer_items
FOR EACH ROW
BEGIN
  DECLARE v_from_wh BIGINT;
  DECLARE v_to_wh BIGINT;

  -- Get warehouse ids from transfers table
  SELECT from_warehouse_id, to_warehouse_id INTO v_from_wh, v_to_wh
    FROM transfers WHERE id = NEW.transfer_id LIMIT 1;

  -- Subtract from source warehouse/location
  UPDATE stock_levels
    SET quantity = quantity - NEW.qty
    WHERE product_id = NEW.product_id
      AND warehouse_id = v_from_wh
      AND (location_id = NEW.from_location_id OR (location_id IS NULL AND NEW.from_location_id IS NULL));

  -- Add to destination warehouse/location (upsert)
  INSERT INTO stock_levels (product_id, warehouse_id, location_id, quantity)
  VALUES (NEW.product_id, v_to_wh, NEW.to_location_id, NEW.qty)
  ON DUPLICATE KEY UPDATE quantity = quantity + NEW.qty;

  -- Ledger: out
  INSERT INTO stock_ledger (product_id, warehouse_id, location_id, `change`, doc_type, doc_id, note, created_at)
  VALUES (NEW.product_id, v_from_wh, NEW.from_location_id, -NEW.qty, 'transfer', NEW.transfer_id, CONCAT('Transfer out item #', NEW.id), NOW());

  -- Ledger: in
  INSERT INTO stock_ledger (product_id, warehouse_id, location_id, `change`, doc_type, doc_id, note, created_at)
  VALUES (NEW.product_id, v_to_wh, NEW.to_location_id, NEW.qty, 'transfer', NEW.transfer_id, CONCAT('Transfer in item #', NEW.id), NOW());
END$$

-- Adjustment item inserted -> set stock_levels to counted qty and insert ledger
CREATE TRIGGER trg_after_insert_adjustment_item
AFTER INSERT ON adjustment_items
FOR EACH ROW
BEGIN
  -- Update stock_levels to counted qty (create if missing)
  INSERT INTO stock_levels (product_id, warehouse_id, location_id, quantity)
  VALUES (NEW.product_id, NEW.warehouse_id, NEW.location_id, NEW.qty_counted)
  ON DUPLICATE KEY UPDATE quantity = NEW.qty_counted;

  -- Insert ledger entry for the change
  INSERT INTO stock_ledger (product_id, warehouse_id, location_id, `change`, doc_type, doc_id, note, created_at)
  VALUES (NEW.product_id, NEW.warehouse_id, NEW.location_id, NEW.`change`, 'adjustment', NEW.adjustment_id, CONCAT('Adjustment item #', NEW.id), NOW());
END$$

DELIMITER ;

-- =========================
-- SAMPLE SEED DATA (users, warehouses, locations, categories, products)
-- =========================

INSERT INTO users (email, password_hash, name, role) VALUES
('admin@gmail.com', 'hash1', 'System Admin', 'admin'),
('manager@gmail.com', 'hash2', 'Inventory Manager', 'inventory_manager'),
('staff@gmail.com', 'hash3', 'Warehouse Staff', 'warehouse_staff');

INSERT INTO warehouses (name, code, address) VALUES
('Main Warehouse', 'WH1', 'Head Office'),
('Spare Warehouse', 'WH2', 'Factory Zone');

INSERT INTO locations (warehouse_id, name, short_code) VALUES
(1, 'Rack A', 'RA'),
(1, 'Rack B', 'RB'),
(2, 'Zone 1', 'Z1');

INSERT INTO product_categories (name) VALUES
('Raw Material'),
('Electronics'),
('Furniture');

INSERT INTO products (sku, name, category_id, uom, reorder_level) VALUES
('STL-100', 'Steel Rod', 1, 'KG', 20),
('CH-001', 'Plastic Chair', 3, 'PCS', 10),
('PCB-900', 'PCB Board', 2, 'PCS', 5);

-- Initialize stock_levels for demo (optional)
INSERT INTO stock_levels (product_id, warehouse_id, location_id, quantity) VALUES
(1, 1, 1, 0),
(2, 1, 1, 0),
(3, 1, 2, 0);

-- =========================
-- SAMPLE TRANSACTIONS (receipts / deliveries / transfers / adjustments)
-- These statements will fire triggers above to update stock_levels & stock_ledger
-- =========================

-- 1) Sample Receipt: Receive 100 KG Steel Rod to Rack A and 25 PCB Boards to Rack B
INSERT INTO receipts (ref_no, supplier, status, created_by) VALUES ('REC-1001', 'Tata Steel', 'done', 2);
INSERT INTO receipt_items (receipt_id, product_id, warehouse_id, location_id, qty) VALUES
(LAST_INSERT_ID(), 1, 1, 1, 100.0000);

-- Note: For PCB sample, create another receipt row
INSERT INTO receipts (ref_no, supplier, status, created_by) VALUES ('REC-1002', 'PCB Supplies', 'done', 2);
INSERT INTO receipt_items (receipt_id, product_id, warehouse_id, location_id, qty) VALUES
(LAST_INSERT_ID(), 3, 1, 2, 25.0000);

-- 2) Sample Delivery: Deliver 10 Plastic Chairs from Rack A
INSERT INTO deliveries (ref_no, customer, status, created_by) VALUES ('DEL-5001', 'RK Industries', 'done', 2);
INSERT INTO delivery_items (delivery_id, product_id, warehouse_id, location_id, qty) VALUES
(LAST_INSERT_ID(), 2, 1, 1, 10.0000);

-- 3) Sample Transfer: Transfer 50 KG Steel from Rack A (location 1) to Rack B (location 2)
INSERT INTO transfers (ref_no, from_warehouse_id, to_warehouse_id, status, created_by) VALUES ('TRN-2001', 1, 1, 'done', 2);
INSERT INTO transfer_items (transfer_id, product_id, from_location_id, to_location_id, qty) VALUES
(LAST_INSERT_ID(), 1, 1, 2, 50.0000);

-- 4) Sample Adjustment: Count correction - Steel Rod reduced from 100 to 95 in Rack A
INSERT INTO adjustments (ref_no, reason, status, created_by) VALUES ('ADJ-3001', 'Count correction - missing 5 KG', 'done', 2);
INSERT INTO adjustment_items (adjustment_id, product_id, warehouse_id, location_id, qty_counted, qty_prev, `change`) VALUES
(LAST_INSERT_ID(), 1, 1, 1, 95.0000, 100.0000, -5.0000);

-- =========================
-- QUICK QUERIES YOU MAY FIND USEFUL
-- =========================

-- 1. Low stock items (<= reorder_level)
SELECT p.id, p.sku, p.name, p.reorder_level, SUM(sl.quantity) AS total_qty
FROM products p
LEFT JOIN stock_levels sl ON sl.product_id = p.id
GROUP BY p.id HAVING total_qty <= p.reorder_level OR total_qty IS NULL;

-- 2. Stock snapshot per product per warehouse
SELECT p.sku, p.name, w.name AS warehouse, SUM(sl.quantity) AS qty
FROM products p
JOIN stock_levels sl ON sl.product_id = p.id
JOIN warehouses w ON w.id = sl.warehouse_id
GROUP BY p.id, w.id;

-- 3. Last 20 ledger entries
SELECT * FROM stock_ledger ORDER BY created_at DESC LIMIT 20;

