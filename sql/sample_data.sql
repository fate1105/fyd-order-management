-- sample_data.sql
-- Dữ liệu mẫu cho FYD Order Management DB

USE fyd_db;

-- =========================
-- 1) ROLES
-- =========================
INSERT INTO roles (name, description) VALUES
('ADMIN', 'Quản trị hệ thống'),
('STAFF', 'Nhân viên bán hàng'),
('WAREHOUSE', 'Nhân viên kho');

-- =========================
-- 2) USERS
-- =========================
INSERT INTO users (username, email, password_hash, full_name, role_id) VALUES
('admin', 'admin@fyd.vn', 'hashed_password', 'FYD Admin', 1),
('staff01', 'staff01@fyd.vn', 'hashed_password', 'Nguyễn Văn A', 2),
('warehouse01', 'wh01@fyd.vn', 'hashed_password', 'Trần Văn B', 3);

-- =========================
-- 3) CATEGORIES
-- =========================
INSERT INTO categories (name, description) VALUES
('Áo', 'Các loại áo'),
('Quần', 'Các loại quần');

-- =========================
-- 4) BRANDS
-- =========================
INSERT INTO brands (name, description) VALUES
('FYD', 'Thương hiệu FYD'),
('Basic', 'Dòng cơ bản');

-- =========================
-- 5) PRODUCTS
-- =========================
INSERT INTO products (sku, name, category_id, brand_id, price, description) VALUES
('FYD-AO-001', 'Áo thun FYD đen', 1, 1, 199000, 'Áo thun cotton FYD màu đen'),
('FYD-AO-002', 'Áo thun FYD trắng', 1, 1, 199000, 'Áo thun cotton FYD màu trắng'),
('FYD-AO-003', 'Áo polo FYD', 1, 1, 299000, 'Áo polo FYD lịch sự'),
('BSC-AO-001', 'Áo sơ mi basic', 1, 2, 349000, 'Áo sơ mi form basic'),
('BSC-AO-002', 'Áo hoodie basic', 1, 2, 499000, 'Áo hoodie unisex'),

('FYD-QUAN-001', 'Quần jean FYD xanh', 2, 1, 399000, 'Quần jean FYD màu xanh'),
('FYD-QUAN-002', 'Quần kaki FYD đen', 2, 1, 379000, 'Quần kaki FYD màu đen'),
('BSC-QUAN-001', 'Quần short basic', 2, 2, 249000, 'Quần short basic thoải mái'),
('BSC-QUAN-002', 'Quần jogger basic', 2, 2, 299000, 'Quần jogger thể thao'),
('BSC-QUAN-003', 'Quần jean basic', 2, 2, 389000, 'Quần jean form basic');

-- =========================
-- 6) PRODUCT IMAGES
-- =========================
INSERT INTO product_images (product_id, image_url, is_primary, sort_order) VALUES
(1, '/images/ao-thun-den.jpg', 1, 1),
(2, '/images/ao-thun-trang.jpg', 1, 1),
(3, '/images/ao-polo.jpg', 1, 1),
(4, '/images/ao-so-mi.jpg', 1, 1),
(5, '/images/ao-hoodie.jpg', 1, 1),
(6, '/images/quan-jean-xanh.jpg', 1, 1),
(7, '/images/quan-kaki-den.jpg', 1, 1),
(8, '/images/quan-short.jpg', 1, 1),
(9, '/images/quan-jogger.jpg', 1, 1),
(10,'/images/quan-jean-basic.jpg', 1, 1);

-- =========================
-- 7) INVENTORY
-- =========================
INSERT INTO inventory (product_id, on_hand) VALUES
(1, 50),
(2, 45),
(3, 30),
(4, 25),
(5, 20),
(6, 40),
(7, 35),
(8, 60),
(9, 28),
(10,22);

-- =========================
-- 8) CUSTOMERS
-- =========================
INSERT INTO customers (full_name, phone, email, address) VALUES
('Lê Thị C', '0901234567', 'lethic@gmail.com', 'TP.HCM'),
('Phạm Văn D', '0912345678', 'phamvand@gmail.com', 'TP.HCM');

-- =========================
-- 9) ORDERS
-- =========================
INSERT INTO orders (
  order_code, customer_id, staff_id,
  total_amount, discount_amount, final_amount,
  payment_method, payment_status, status
) VALUES
('FYD-20260115-0001', 1, 2, 598000, 0, 598000, 'CASH', 'PAID', 'COMPLETED');

-- =========================
-- 10) ORDER ITEMS
-- =========================
INSERT INTO order_items (order_id, product_id, quantity, unit_price, line_total) VALUES
(1, 1, 1, 199000, 199000),
(1, 2, 1, 399000, 399000);

-- =========================
-- 11) STOCK MOVEMENTS
-- =========================
INSERT INTO stock_movements (
  product_id, change_qty, movement_type, ref_type, ref_id, reason, created_by
) VALUES
(1, -1, 'OUT', 'ORDER', 1, 'Bán hàng', 2),
(2, -1, 'OUT', 'ORDER', 1, 'Bán hàng', 2);

-- =========================
-- 12) CUSTOMER HISTORY
-- =========================
INSERT INTO customer_history (customer_id, action, details) VALUES
(1, 'PURCHASE', JSON_OBJECT('order_code', 'FYD-20260115-0001'));

-- =========================
-- 13) AI RECOMMENDATIONS
-- =========================
INSERT INTO ai_recommendations (product_id, recommended_product_id, score, reason) VALUES
(1, 6, 0.81, 'FREQUENTLY_BOUGHT_TOGETHER'),
(1, 8, 0.65, 'SIMILAR'),
(5, 9, 0.72, 'TRENDING'),
(6, 10, 0.78, 'SIMILAR');