-- Stored Procedures for MySQL

DELIMITER $$

-- ============================================
-- USER PROCEDURES
-- ============================================

DROP PROCEDURE IF EXISTS sp_create_user$$
CREATE PROCEDURE sp_create_user(
    IN p_email VARCHAR(255),
    IN p_password_hash VARCHAR(255),
    IN p_full_name VARCHAR(255),
    IN p_role_id INT,
    OUT v_user_id INT
)
BEGIN
    INSERT INTO users (email, password_hash, full_name, role_id)
    VALUES (p_email, p_password_hash, p_full_name, p_role_id);
    
    SET v_user_id = LAST_INSERT_ID();
END$$

DROP PROCEDURE IF EXISTS sp_update_user$$
CREATE PROCEDURE sp_update_user(
    IN p_user_id INT,
    IN p_full_name VARCHAR(255),
    IN p_role_id INT,
    OUT v_success BOOLEAN
)
BEGIN
    UPDATE users
    SET full_name = p_full_name,
        role_id = p_role_id
    WHERE user_id = p_user_id;
    
    SET v_success = ROW_COUNT() > 0;
END$$

-- ============================================
-- PRODUCT PROCEDURES
-- ============================================

DROP PROCEDURE IF EXISTS sp_create_product$$
CREATE PROCEDURE sp_create_product(
    IN p_sku VARCHAR(100),
    IN p_product_name VARCHAR(255),
    IN p_category_id INT,
    IN p_unit_of_measure VARCHAR(10),
    IN p_reorder_level INT,
    OUT v_product_id INT
)
BEGIN
    INSERT INTO products (sku, product_name, category_id, unit_of_measure, reorder_level)
    VALUES (p_sku, p_product_name, p_category_id, p_unit_of_measure, p_reorder_level);
    
    SET v_product_id = LAST_INSERT_ID();
END$$

DROP PROCEDURE IF EXISTS sp_update_product$$
CREATE PROCEDURE sp_update_product(
    IN p_product_id INT,
    IN p_product_name VARCHAR(255),
    IN p_category_id INT,
    IN p_reorder_level INT,
    OUT v_success BOOLEAN
)
BEGIN
    UPDATE products
    SET product_name = p_product_name,
        category_id = p_category_id,
        reorder_level = p_reorder_level
    WHERE product_id = p_product_id;
    
    SET v_success = ROW_COUNT() > 0;
END$$

-- ============================================
-- RECEIPT PROCEDURES
-- ============================================

DROP PROCEDURE IF EXISTS sp_create_receipt$$
CREATE PROCEDURE sp_create_receipt(
    IN p_receipt_number VARCHAR(50),
    IN p_supplier_name VARCHAR(255),
    IN p_warehouse_id INT,
    IN p_location_id INT,
    IN p_scheduled_date DATE,
    IN p_created_by INT,
    IN p_notes TEXT,
    OUT v_receipt_id INT
)
BEGIN
    DECLARE v_number VARCHAR(50);
    
    IF p_receipt_number IS NULL OR p_receipt_number = '' THEN
        SET v_number = CONCAT('RCP-', DATE_FORMAT(NOW(), '%Y%m%d'), '-', LPAD(FLOOR(RAND() * 999999), 6, '0'));
    ELSE
        SET v_number = p_receipt_number;
    END IF;
    
    INSERT INTO receipts (receipt_number, supplier_name, warehouse_id, location_id, 
                         scheduled_date, created_by, notes)
    VALUES (v_number, p_supplier_name, p_warehouse_id, p_location_id,
           p_scheduled_date, p_created_by, p_notes);
    
    SET v_receipt_id = LAST_INSERT_ID();
END$$

DROP PROCEDURE IF EXISTS sp_add_receipt_line$$
CREATE PROCEDURE sp_add_receipt_line(
    IN p_receipt_id INT,
    IN p_product_id INT,
    IN p_quantity_expected DECIMAL(15,2),
    OUT v_line_id INT
)
BEGIN
    INSERT INTO receipt_lines (receipt_id, product_id, quantity_expected)
    VALUES (p_receipt_id, p_product_id, p_quantity_expected);
    
    SET v_line_id = LAST_INSERT_ID();
END$$

DROP PROCEDURE IF EXISTS sp_validate_receipt$$
CREATE PROCEDURE sp_validate_receipt(
    IN p_receipt_id INT,
    IN p_user_id INT,
    OUT v_success BOOLEAN
)
BEGIN
    DECLARE v_location_id INT;
    DECLARE v_product_id INT;
    DECLARE v_quantity_received DECIMAL(15,2);
    DECLARE v_current_qty DECIMAL(15,2);
    DECLARE done INT DEFAULT FALSE;
    
    DECLARE line_cursor CURSOR FOR 
        SELECT product_id, quantity_received
        FROM receipt_lines
        WHERE receipt_id = p_receipt_id AND quantity_received > 0;
    
    DECLARE CONTINUE HANDLER FOR NOT FOUND SET done = TRUE;
    
    -- Get receipt location
    SELECT location_id INTO v_location_id
    FROM receipts
    WHERE receipt_id = p_receipt_id AND status = 'READY';
    
    IF v_location_id IS NULL THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Receipt not found or not in READY status';
    END IF;
    
    START TRANSACTION;
    
    OPEN line_cursor;
    
    read_loop: LOOP
        FETCH line_cursor INTO v_product_id, v_quantity_received;
        IF done THEN
            LEAVE read_loop;
        END IF;
        
        -- Update or insert product location stock
        SELECT quantity INTO v_current_qty
        FROM product_locations
        WHERE product_id = v_product_id AND location_id = v_location_id;
        
        IF v_current_qty IS NULL THEN
            INSERT INTO product_locations (product_id, location_id, quantity)
            VALUES (v_product_id, v_location_id, v_quantity_received);
            SET v_current_qty = v_quantity_received;
        ELSE
            UPDATE product_locations
            SET quantity = quantity + v_quantity_received
            WHERE product_id = v_product_id AND location_id = v_location_id;
            SET v_current_qty = v_current_qty + v_quantity_received;
        END IF;
        
        -- Log movement
        INSERT INTO stock_movements (product_id, location_id, movement_type, reference_type,
                                    reference_id, quantity_change, quantity_after, created_by)
        VALUES (v_product_id, v_location_id, 'RECEIPT', 'RECEIPT',
               p_receipt_id, v_quantity_received, v_current_qty, p_user_id);
    END LOOP;
    
    CLOSE line_cursor;
    
    -- Update receipt status
    UPDATE receipts
    SET status = 'DONE',
        received_date = NOW()
    WHERE receipt_id = p_receipt_id;
    
    COMMIT;
    SET v_success = TRUE;
END$$

-- ============================================
-- DELIVERY ORDER PROCEDURES
-- ============================================

DROP PROCEDURE IF EXISTS sp_create_delivery$$
CREATE PROCEDURE sp_create_delivery(
    IN p_delivery_number VARCHAR(50),
    IN p_customer_name VARCHAR(255),
    IN p_warehouse_id INT,
    IN p_location_id INT,
    IN p_scheduled_date DATE,
    IN p_created_by INT,
    IN p_notes TEXT,
    OUT v_delivery_id INT
)
BEGIN
    DECLARE v_number VARCHAR(50);
    
    IF p_delivery_number IS NULL OR p_delivery_number = '' THEN
        SET v_number = CONCAT('DEL-', DATE_FORMAT(NOW(), '%Y%m%d'), '-', LPAD(FLOOR(RAND() * 999999), 6, '0'));
    ELSE
        SET v_number = p_delivery_number;
    END IF;
    
    INSERT INTO delivery_orders (delivery_number, customer_name, warehouse_id, location_id,
                                 scheduled_date, created_by, notes)
    VALUES (v_number, p_customer_name, p_warehouse_id, p_location_id,
           p_scheduled_date, p_created_by, p_notes);
    
    SET v_delivery_id = LAST_INSERT_ID();
END$$

DROP PROCEDURE IF EXISTS sp_add_delivery_line$$
CREATE PROCEDURE sp_add_delivery_line(
    IN p_delivery_id INT,
    IN p_product_id INT,
    IN p_quantity_ordered DECIMAL(15,2),
    OUT v_line_id INT
)
BEGIN
    INSERT INTO delivery_order_lines (delivery_id, product_id, quantity_ordered)
    VALUES (p_delivery_id, p_product_id, p_quantity_ordered);
    
    SET v_line_id = LAST_INSERT_ID();
END$$

DROP PROCEDURE IF EXISTS sp_validate_delivery$$
CREATE PROCEDURE sp_validate_delivery(
    IN p_delivery_id INT,
    IN p_user_id INT,
    OUT v_success BOOLEAN
)
BEGIN
    DECLARE v_location_id INT;
    DECLARE v_product_id INT;
    DECLARE v_quantity_delivered DECIMAL(15,2);
    DECLARE v_current_stock DECIMAL(15,2);
    DECLARE done INT DEFAULT FALSE;
    
    DECLARE line_cursor CURSOR FOR 
        SELECT product_id, quantity_delivered
        FROM delivery_order_lines
        WHERE delivery_id = p_delivery_id AND quantity_delivered > 0;
    
    DECLARE CONTINUE HANDLER FOR NOT FOUND SET done = TRUE;
    
    -- Get delivery location
    SELECT location_id INTO v_location_id
    FROM delivery_orders
    WHERE delivery_id = p_delivery_id AND status = 'READY';
    
    IF v_location_id IS NULL THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Delivery not found or not in READY status';
    END IF;
    
    START TRANSACTION;
    
    OPEN line_cursor;
    
    read_loop: LOOP
        FETCH line_cursor INTO v_product_id, v_quantity_delivered;
        IF done THEN
            LEAVE read_loop;
        END IF;
        
        -- Check stock availability
        SELECT quantity INTO v_current_stock
        FROM product_locations
        WHERE product_id = v_product_id AND location_id = v_location_id;
        
        IF v_current_stock IS NULL OR v_current_stock < v_quantity_delivered THEN
            SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Insufficient stock';
        END IF;
        
        -- Reduce stock
        UPDATE product_locations
        SET quantity = quantity - v_quantity_delivered
        WHERE product_id = v_product_id AND location_id = v_location_id;
        
        SET v_current_stock = v_current_stock - v_quantity_delivered;
        
        -- Log movement
        INSERT INTO stock_movements (product_id, location_id, movement_type, reference_type,
                                    reference_id, quantity_change, quantity_after, created_by)
        VALUES (v_product_id, v_location_id, 'DELIVERY', 'DELIVERY',
               p_delivery_id, -v_quantity_delivered, v_current_stock, p_user_id);
    END LOOP;
    
    CLOSE line_cursor;
    
    -- Update delivery status
    UPDATE delivery_orders
    SET status = 'DONE',
        delivered_date = NOW()
    WHERE delivery_id = p_delivery_id;
    
    COMMIT;
    SET v_success = TRUE;
END$$

-- ============================================
-- INTERNAL TRANSFER PROCEDURES
-- ============================================

DROP PROCEDURE IF EXISTS sp_execute_transfer$$
CREATE PROCEDURE sp_execute_transfer(
    IN p_transfer_number VARCHAR(50),
    IN p_product_id INT,
    IN p_from_location_id INT,
    IN p_to_location_id INT,
    IN p_quantity DECIMAL(15,2),
    IN p_created_by INT,
    IN p_notes TEXT,
    OUT v_transfer_id INT
)
BEGIN
    DECLARE v_current_stock DECIMAL(15,2);
    DECLARE v_number VARCHAR(50);
    DECLARE v_from_qty DECIMAL(15,2);
    DECLARE v_to_qty DECIMAL(15,2);
    
    -- Check stock availability
    SELECT quantity INTO v_current_stock
    FROM product_locations
    WHERE product_id = p_product_id AND location_id = p_from_location_id;
    
    IF v_current_stock IS NULL OR v_current_stock < p_quantity THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Insufficient stock at source location';
    END IF;
    
    IF p_transfer_number IS NULL OR p_transfer_number = '' THEN
        SET v_number = CONCAT('TRF-', DATE_FORMAT(NOW(), '%Y%m%d'), '-', LPAD(FLOOR(RAND() * 999999), 6, '0'));
    ELSE
        SET v_number = p_transfer_number;
    END IF;
    
    START TRANSACTION;
    
    -- Create transfer record
    INSERT INTO internal_transfers (transfer_number, product_id, from_location_id, to_location_id,
                                   quantity, status, completed_date, created_by, notes)
    VALUES (v_number, p_product_id, p_from_location_id, p_to_location_id,
           p_quantity, 'DONE', NOW(), p_created_by, p_notes);
    
    SET v_transfer_id = LAST_INSERT_ID();
    
    -- Reduce from source
    UPDATE product_locations
    SET quantity = quantity - p_quantity
    WHERE product_id = p_product_id AND location_id = p_from_location_id;
    
    SET v_from_qty = v_current_stock - p_quantity;
    
    -- Add to destination
    SELECT quantity INTO v_to_qty
    FROM product_locations
    WHERE product_id = p_product_id AND location_id = p_to_location_id;
    
    IF v_to_qty IS NULL THEN
        INSERT INTO product_locations (product_id, location_id, quantity)
        VALUES (p_product_id, p_to_location_id, p_quantity);
        SET v_to_qty = p_quantity;
    ELSE
        UPDATE product_locations
        SET quantity = quantity + p_quantity
        WHERE product_id = p_product_id AND location_id = p_to_location_id;
        SET v_to_qty = v_to_qty + p_quantity;
    END IF;
    
    -- Log movements
    INSERT INTO stock_movements (product_id, location_id, movement_type, reference_type,
                                reference_id, quantity_change, quantity_after, created_by)
    VALUES (p_product_id, p_from_location_id, 'TRANSFER_OUT', 'TRANSFER',
           v_transfer_id, -p_quantity, v_from_qty, p_created_by);
    
    INSERT INTO stock_movements (product_id, location_id, movement_type, reference_type,
                                reference_id, quantity_change, quantity_after, created_by)
    VALUES (p_product_id, p_to_location_id, 'TRANSFER_IN', 'TRANSFER',
           v_transfer_id, p_quantity, v_to_qty, p_created_by);
    
    COMMIT;
END$$

-- ============================================
-- STOCK ADJUSTMENT PROCEDURES
-- ============================================

DROP PROCEDURE IF EXISTS sp_create_adjustment$$
CREATE PROCEDURE sp_create_adjustment(
    IN p_adjustment_number VARCHAR(50),
    IN p_product_id INT,
    IN p_location_id INT,
    IN p_quantity_counted DECIMAL(15,2),
    IN p_reason VARCHAR(20),
    IN p_created_by INT,
    IN p_notes TEXT,
    OUT v_adjustment_id INT
)
BEGIN
    DECLARE v_quantity_before DECIMAL(15,2);
    DECLARE v_quantity_diff DECIMAL(15,2);
    DECLARE v_number VARCHAR(50);
    
    -- Get current stock
    SELECT COALESCE(quantity, 0) INTO v_quantity_before
    FROM product_locations
    WHERE product_id = p_product_id AND location_id = p_location_id;
    
    SET v_quantity_diff = p_quantity_counted - v_quantity_before;
    
    IF p_adjustment_number IS NULL OR p_adjustment_number = '' THEN
        SET v_number = CONCAT('ADJ-', DATE_FORMAT(NOW(), '%Y%m%d'), '-', LPAD(FLOOR(RAND() * 999999), 6, '0'));
    ELSE
        SET v_number = p_adjustment_number;
    END IF;
    
    START TRANSACTION;
    
    -- Create adjustment record
    INSERT INTO stock_adjustments (adjustment_number, product_id, location_id, quantity_before,
                                   quantity_counted, quantity_difference, reason, created_by, notes)
    VALUES (v_number, p_product_id, p_location_id, v_quantity_before,
           p_quantity_counted, v_quantity_diff, p_reason, p_created_by, p_notes);
    
    SET v_adjustment_id = LAST_INSERT_ID();
    
    -- Update stock
    IF v_quantity_before = 0 THEN
        INSERT INTO product_locations (product_id, location_id, quantity)
        VALUES (p_product_id, p_location_id, p_quantity_counted);
    ELSE
        UPDATE product_locations
        SET quantity = p_quantity_counted
        WHERE product_id = p_product_id AND location_id = p_location_id;
    END IF;
    
    -- Log movement
    INSERT INTO stock_movements (product_id, location_id, movement_type, reference_type,
                                reference_id, quantity_change, quantity_after, created_by)
    VALUES (p_product_id, p_location_id, 'ADJUSTMENT', 'ADJUSTMENT',
           v_adjustment_id, v_quantity_diff, p_quantity_counted, p_created_by);
    
    COMMIT;
END$$

DELIMITER ;
