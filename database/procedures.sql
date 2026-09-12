-- ============================================================================
-- StockMaster IMS — Transaction Stored Procedures
-- Database: MySQL 8.0+
-- Description: Atomic inventory operations ensuring ACID transaction integrity
-- ============================================================================

DELIMITER $$

-- ============================================================================
-- 1. VALIDATE INBOUND RECEIPT
-- Fulfills a receipt by updating stock at the receipt location and logging movements
-- ============================================================================
DROP PROCEDURE IF EXISTS sp_validate_receipt$$
CREATE PROCEDURE sp_validate_receipt(
    IN p_receipt_id INT,
    IN p_user_id INT
)
BEGIN
    DECLARE v_location_id INT;
    DECLARE v_product_id INT;
    DECLARE v_quantity_received DECIMAL(15, 2);
    DECLARE v_current_qty DECIMAL(15, 2);
    DECLARE done INT DEFAULT FALSE;
    
    DECLARE line_cursor CURSOR FOR 
        SELECT product_id, quantity_received
        FROM receipt_lines
        WHERE receipt_id = p_receipt_id AND quantity_received > 0;
    
    DECLARE CONTINUE HANDLER FOR NOT FOUND SET done = TRUE;
    
    -- Verify receipt exists and is ready for validation
    SELECT location_id INTO v_location_id
    FROM receipts
    WHERE receipt_id = p_receipt_id AND status = 'READY';
    
    IF v_location_id IS NULL THEN
        SIGNAL SQLSTATE '45000' 
        SET MESSAGE_TEXT = 'Receipt not found or not in READY status';
    END IF;
    
    START TRANSACTION;
    
    OPEN line_cursor;
    
    read_loop: LOOP
        FETCH line_cursor INTO v_product_id, v_quantity_received;
        IF done THEN
            LEAVE read_loop;
        END IF;
        
        -- Retrieve current stock level at destination location
        SET v_current_qty = (SELECT quantity 
                             FROM product_locations 
                             WHERE product_id = v_product_id AND location_id = v_location_id);
        
        -- Upsert stock level
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
        
        -- Append audit record to stock_movements
        INSERT INTO stock_movements (
            product_id, location_id, movement_type, reference_type,
            reference_id, quantity_change, quantity_after, created_by
        ) VALUES (
            v_product_id, v_location_id, 'RECEIPT', 'RECEIPT',
            p_receipt_id, v_quantity_received, v_current_qty, p_user_id
        );
    END LOOP;
    
    CLOSE line_cursor;
    
    -- Mark receipt as completed
    UPDATE receipts
    SET status = 'DONE',
        received_date = NOW()
    WHERE receipt_id = p_receipt_id;
    
    COMMIT;
END$$

-- ============================================================================
-- 2. VALIDATE OUTBOUND DELIVERY
-- Fulfills a customer order by deducting stock and logging movements
-- ============================================================================
DROP PROCEDURE IF EXISTS sp_validate_delivery$$
CREATE PROCEDURE sp_validate_delivery(
    IN p_delivery_id INT,
    IN p_user_id INT
)
BEGIN
    DECLARE v_location_id INT;
    DECLARE v_product_id INT;
    DECLARE v_quantity_delivered DECIMAL(15, 2);
    DECLARE v_current_stock DECIMAL(15, 2);
    DECLARE done INT DEFAULT FALSE;
    
    DECLARE line_cursor CURSOR FOR 
        SELECT product_id, quantity_delivered
        FROM delivery_order_lines
        WHERE delivery_id = p_delivery_id AND quantity_delivered > 0;
    
    DECLARE CONTINUE HANDLER FOR NOT FOUND SET done = TRUE;
    
    -- Verify delivery order exists and is ready
    SELECT location_id INTO v_location_id
    FROM delivery_orders
    WHERE delivery_id = p_delivery_id AND status = 'READY';
    
    IF v_location_id IS NULL THEN
        SIGNAL SQLSTATE '45000' 
        SET MESSAGE_TEXT = 'Delivery not found or not in READY status';
    END IF;
    
    START TRANSACTION;
    
    OPEN line_cursor;
    
    read_loop: LOOP
        FETCH line_cursor INTO v_product_id, v_quantity_delivered;
        IF done THEN
            LEAVE read_loop;
        END IF;
        
        -- Check current stock availability
        SET v_current_stock = (SELECT quantity 
                               FROM product_locations 
                               WHERE product_id = v_product_id AND location_id = v_location_id);
        
        IF v_current_stock IS NULL OR v_current_stock < v_quantity_delivered THEN
            SIGNAL SQLSTATE '45000' 
            SET MESSAGE_TEXT = 'Insufficient stock for delivery';
        END IF;
        
        -- Deduct stock
        UPDATE product_locations
        SET quantity = quantity - v_quantity_delivered
        WHERE product_id = v_product_id AND location_id = v_location_id;
        
        SET v_current_stock = v_current_stock - v_quantity_delivered;
        
        -- Append audit record to stock_movements
        INSERT INTO stock_movements (
            product_id, location_id, movement_type, reference_type,
            reference_id, quantity_change, quantity_after, created_by
        ) VALUES (
            v_product_id, v_location_id, 'DELIVERY', 'DELIVERY',
            p_delivery_id, -v_quantity_delivered, v_current_stock, p_user_id
        );
    END LOOP;
    
    CLOSE line_cursor;
    
    -- Mark delivery as completed
    UPDATE delivery_orders
    SET status = 'DONE',
        delivered_date = NOW()
    WHERE delivery_id = p_delivery_id;
    
    COMMIT;
END$$

-- ============================================================================
-- 3. EXECUTE INTERNAL TRANSFER
-- Moves inventory from one location to another atomically
-- ============================================================================
DROP PROCEDURE IF EXISTS sp_execute_transfer$$
CREATE PROCEDURE sp_execute_transfer(
    IN p_transfer_number VARCHAR(50),
    IN p_product_id INT,
    IN p_from_location_id INT,
    IN p_to_location_id INT,
    IN p_quantity DECIMAL(15, 2),
    IN p_created_by INT,
    IN p_notes TEXT
)
BEGIN
    DECLARE v_current_stock DECIMAL(15, 2);
    DECLARE v_number VARCHAR(50);
    DECLARE v_from_qty DECIMAL(15, 2);
    DECLARE v_to_qty DECIMAL(15, 2);
    DECLARE v_transfer_id INT;
    
    -- Verify available stock at origin location
    SET v_current_stock = (SELECT quantity 
                           FROM product_locations 
                           WHERE product_id = p_product_id AND location_id = p_from_location_id);
    
    IF v_current_stock IS NULL OR v_current_stock < p_quantity THEN
        SIGNAL SQLSTATE '45000' 
        SET MESSAGE_TEXT = 'Insufficient stock at source location';
    END IF;
    
    IF p_transfer_number IS NULL OR p_transfer_number = '' THEN
        SET v_number = CONCAT('TRF-', DATE_FORMAT(NOW(), '%Y%m%d'), '-', LPAD(FLOOR(RAND() * 999999), 6, '0'));
    ELSE
        SET v_number = p_transfer_number;
    END IF;
    
    START TRANSACTION;
    
    -- Create transfer log record
    INSERT INTO internal_transfers (
        transfer_number, product_id, from_location_id, to_location_id,
        quantity, status, completed_date, created_by, notes
    ) VALUES (
        v_number, p_product_id, p_from_location_id, p_to_location_id,
        p_quantity, 'DONE', NOW(), p_created_by, p_notes
    );
    
    SET v_transfer_id = LAST_INSERT_ID();
    
    -- Deduct from origin location
    UPDATE product_locations
    SET quantity = quantity - p_quantity
    WHERE product_id = p_product_id AND location_id = p_from_location_id;
    
    SET v_from_qty = v_current_stock - p_quantity;
    
    -- Add to destination location
    SET v_to_qty = (SELECT quantity 
                    FROM product_locations 
                    WHERE product_id = p_product_id AND location_id = p_to_location_id);
    
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
    
    -- Log departure movement
    INSERT INTO stock_movements (
        product_id, location_id, movement_type, reference_type,
        reference_id, quantity_change, quantity_after, created_by
    ) VALUES (
        p_product_id, p_from_location_id, 'TRANSFER_OUT', 'TRANSFER',
        v_transfer_id, -p_quantity, v_from_qty, p_created_by
    );
    
    -- Log arrival movement
    INSERT INTO stock_movements (
        product_id, location_id, movement_type, reference_type,
        reference_id, quantity_change, quantity_after, created_by
    ) VALUES (
        p_product_id, p_to_location_id, 'TRANSFER_IN', 'TRANSFER',
        v_transfer_id, p_quantity, v_to_qty, p_created_by
    );
    
    COMMIT;
END$$

-- ============================================================================
-- 4. CREATE STOCK ADJUSTMENT
-- Records physical cycle counts and updates stock to match reality
-- ============================================================================
DROP PROCEDURE IF EXISTS sp_create_adjustment$$
CREATE PROCEDURE sp_create_adjustment(
    IN p_adjustment_number VARCHAR(50),
    IN p_product_id INT,
    IN p_location_id INT,
    IN p_quantity_counted DECIMAL(15, 2),
    IN p_reason VARCHAR(20),
    IN p_created_by INT,
    IN p_notes TEXT
)
BEGIN
    DECLARE v_quantity_before DECIMAL(15, 2);
    DECLARE v_quantity_diff DECIMAL(15, 2);
    DECLARE v_number VARCHAR(50);
    DECLARE v_adjustment_id INT;
    
    -- Determine current stock before adjustment
    SET v_quantity_before = (SELECT COALESCE(quantity, 0) 
                             FROM product_locations 
                             WHERE product_id = p_product_id AND location_id = p_location_id);
    
    IF v_quantity_before IS NULL THEN
        SET v_quantity_before = 0.00;
    END IF;
    
    SET v_quantity_diff = p_quantity_counted - v_quantity_before;
    
    IF p_adjustment_number IS NULL OR p_adjustment_number = '' THEN
        SET v_number = CONCAT('ADJ-', DATE_FORMAT(NOW(), '%Y%m%d'), '-', LPAD(FLOOR(RAND() * 999999), 6, '0'));
    ELSE
        SET v_number = p_adjustment_number;
    END IF;
    
    START TRANSACTION;
    
    -- Insert adjustment record
    INSERT INTO stock_adjustments (
        adjustment_number, product_id, location_id, quantity_before,
        quantity_counted, quantity_difference, reason, created_by, notes
    ) VALUES (
        v_number, p_product_id, p_location_id, v_quantity_before,
        p_quantity_counted, v_quantity_diff, p_reason, p_created_by, p_notes
    );
    
    SET v_adjustment_id = LAST_INSERT_ID();
    
    -- Update or insert product location stock
    IF EXISTS (SELECT 1 FROM product_locations WHERE product_id = p_product_id AND location_id = p_location_id) THEN
        UPDATE product_locations
        SET quantity = p_quantity_counted
        WHERE product_id = p_product_id AND location_id = p_location_id;
    ELSE
        INSERT INTO product_locations (product_id, location_id, quantity)
        VALUES (p_product_id, p_location_id, p_quantity_counted);
    END IF;
    
    -- Log movement
    INSERT INTO stock_movements (
        product_id, location_id, movement_type, reference_type,
        reference_id, quantity_change, quantity_after, created_by
    ) VALUES (
        p_product_id, p_location_id, 'ADJUSTMENT', 'ADJUSTMENT',
        v_adjustment_id, v_quantity_diff, p_quantity_counted, p_created_by
    );
    
    COMMIT;
END$$

DELIMITER ;
