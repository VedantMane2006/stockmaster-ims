const mysql = require('mysql2/promise');
require('dotenv').config();
const fs = require('fs').promises;
const path = require('path');

async function run() {
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST || 'localhost',
        port: process.env.DB_PORT || 3306,
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'stockmaster'
    });
    
    // Instead of parsing, let's just extract the raw bodies of the 2 modified procedures.
    // Procedure 1: sp_validate_receipt
    await connection.query('DROP PROCEDURE IF EXISTS sp_validate_receipt');
    await connection.query(`
        CREATE PROCEDURE sp_validate_receipt(
            IN p_receipt_id INT,
            IN p_user_id INT,
            IN p_final_status VARCHAR(20)
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
                
                INSERT INTO product_locations (product_id, location_id, quantity)
                VALUES (v_product_id, v_location_id, v_quantity_received)
                ON DUPLICATE KEY UPDATE quantity = quantity + v_quantity_received;
                
                SET v_current_qty = (SELECT quantity 
                                     FROM product_locations 
                                     WHERE product_id = v_product_id AND location_id = v_location_id);
                
                INSERT INTO stock_movements (
                    product_id, location_id, movement_type, reference_type,
                    reference_id, quantity_change, quantity_after, created_by
                ) VALUES (
                    v_product_id, v_location_id, 'RECEIPT', 'RECEIPT',
                    p_receipt_id, v_quantity_received, v_current_qty, p_user_id
                );
            END LOOP;
            
            CLOSE line_cursor;
            
            UPDATE receipts
            SET status = p_final_status,
                received_date = NOW()
            WHERE receipt_id = p_receipt_id;
            
            COMMIT;
        END
    `);
    
    // Procedure 2: sp_validate_delivery
    await connection.query('DROP PROCEDURE IF EXISTS sp_validate_delivery');
    await connection.query(`
        CREATE PROCEDURE sp_validate_delivery(
            IN p_delivery_id INT,
            IN p_user_id INT,
            IN p_final_status VARCHAR(20)
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
                
                SET v_current_stock = (SELECT quantity 
                                       FROM product_locations 
                                       WHERE product_id = v_product_id AND location_id = v_location_id);
                                       
                IF v_current_stock IS NULL OR v_current_stock < v_quantity_delivered THEN
                    ROLLBACK;
                    SIGNAL SQLSTATE '45000' 
                    SET MESSAGE_TEXT = 'Insufficient stock for delivery';
                END IF;
                
                UPDATE product_locations
                SET quantity = quantity - v_quantity_delivered
                WHERE product_id = v_product_id AND location_id = v_location_id;
                
                SET v_current_stock = v_current_stock - v_quantity_delivered;
                
                INSERT INTO stock_movements (
                    product_id, location_id, movement_type, reference_type,
                    reference_id, quantity_change, quantity_after, created_by
                ) VALUES (
                    v_product_id, v_location_id, 'DELIVERY', 'DELIVERY',
                    p_delivery_id, -v_quantity_delivered, v_current_stock, p_user_id
                );
            END LOOP;
            
            CLOSE line_cursor;
            
            UPDATE delivery_orders
            SET status = p_final_status,
                delivered_date = NOW()
            WHERE delivery_id = p_delivery_id;
            
            COMMIT;
        END
    `);
    
    console.log('Procedures manually updated successfully!');
    process.exit(0);
}

run();
