# FYD Order Management System

## 1. Giới thiệu
FYD Order Management System là hệ thống website hỗ trợ cửa hàng FYD quản lý
đơn hàng, sản phẩm, khách hàng, tồn kho và doanh thu trên một nền tảng tập trung.
Hệ thống tích hợp mô-đun AI gợi ý sản phẩm dựa trên dữ liệu bán hàng nhằm nâng cao
hiệu quả kinh doanh và cải thiện trải nghiệm người dùng.

Đây là đề tài đồ án chuyên ngành, được thực hiện theo nhóm 2 người trong thời gian 12 tuần.

---

## 2. Mục tiêu
- Số hoá quy trình quản lý đơn hàng và bán hàng tại cửa hàng FYD.
- Giảm sai sót trong quá trình xử lý đơn và quản lý tồn kho.
- Theo dõi doanh thu, sản phẩm bán chạy và lịch sử mua hàng.
- Áp dụng AI để gợi ý sản phẩm dựa trên dữ liệu bán hàng thực tế.

---

## 3. Đối tượng sử dụng
- Quản trị viên (Admin)
- Nhân viên bán hàng (Staff)
- Nhân viên kho (Warehouse)

---

## 4. Chức năng chính
- Quản lý sản phẩm, danh mục và tồn kho.
- Quản lý đơn hàng và trạng thái xử lý đơn.
- Quản lý thông tin và lịch sử mua hàng của khách hàng.
- Thống kê doanh thu và hiệu quả bán hàng.
- Gợi ý sản phẩm bằng AI (bán chạy, mua kèm, sản phẩm tương tự).
- Phân quyền và bảo mật hệ thống.

---

## 5. Công nghệ sử dụng
- Backend: Java Spring Boot, REST API, JWT
- Frontend: HTML, CSS, Bootstrap, JavaScript
- Cơ sở dữ liệu: MySQL
- Công cụ hỗ trợ: Git, GitHub, Swagger/OpenAPI

---

## 6. Hướng dẫn cài đặt (Setup Guide)

Để chạy dự án sau khi clone về máy mới, bạn cần thực hiện các bước sau:

### 1. Yêu cầu hệ thống (Prerequisites)
- **Java**: JDK 17
- **Database**: MySQL 8.0+
- **Node.js**: v18+ (khuyên dùng v20 LTS)
- **Công cụ**: Maven, npm (đi kèm Node.js)

### 2. Thiết lập Cơ sở dữ liệu (Database Setup)
1. Mở MySQL.
2. Tạo database và user (theo cấu hình mặc định trong `application.yaml`):
   ```sql
   CREATE DATABASE fyd_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   CREATE USER 'fyd'@'localhost' IDENTIFIED BY 'fyd123';
   GRANT ALL PRIVILEGES ON fyd_db.* TO 'fyd'@'localhost';
   FLUSH PRIVILEGES;
   ```
3. Import dữ liệu ban đầu:
   - Chạy script SQL tại: `sql/init_database.sql`

### 3. Khởi chạy Backend (Spring Boot)
1. Mở thư mục `back-end` bằng phần mềm lập trình (IntelliJ/VS Code).
2. Thiết lập biến môi trường (Environment Variable):
   - `GROQ_API_KEY`: Key để sử dụng tính năng AI (lấy từ Groq Cloud).
3. Chạy ứng dụng bằng lệnh Maven:
   ```bash
   mvn spring-boot:run
   ```
   *Backend sẽ chạy tại: http://localhost:8080*

### 4. Khởi chạy Frontend (React Vite)
1. Mở thư mục `front-end`.
2. Tạo file `.env` từ file `.env.example`. Điền các ID cần thiết (Google/Facebook).
3. Cài đặt các thư viện:
   ```bash
   npm install
   ```
4. Chạy dự án:
   ```bash
   npm run dev
   ```
   *Frontend sẽ chạy tại: http://localhost:5173*

---

## 7. Tài khoản đăng nhập mặc định
- **Admin**: `admin` / `admin123`
- **Customer**: Xem trong bảng `customers` sau khi import dữ liệu.
