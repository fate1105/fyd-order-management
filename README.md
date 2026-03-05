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
| Thành phần | Công nghệ |
|---|---|
| Backend | Java 17, Spring Boot, Spring Security, JWT |
| Frontend | React 19, Vite, CSS |
| Database | MySQL 8.0+ |
| AI | Groq Cloud API |
| Thanh toán | VNPay |

---

## 6. Hướng dẫn cài đặt nhanh (Quick Setup)

### Yêu cầu hệ thống
- **Java**: JDK 17+
- **Node.js**: v18+ (khuyên dùng v20 LTS)
- **MySQL**: 8.0+ (hoặc Docker)

### Bước 1: Clone dự án
```bash
git clone https://github.com/fate1105/fyd-order-management.git
cd fyd-order-management
```

### Bước 2: Tạo Database

#### Cách 1: Dùng Docker ⭐ (Khuyên dùng)
Chỉ cần 1 lệnh — Docker sẽ tự tạo database, user, và import dữ liệu mẫu:
```bash
cd docker
docker compose up -d
```
> MySQL sẽ chạy tại `localhost:3306` với user `fyd` / password `fyd123`, database `fyd_db`.
> File `sql/init_database.sql` được tự động import khi container khởi tạo lần đầu.

Một số lệnh hữu ích:
```bash
docker compose down          # Tắt MySQL
docker compose up -d         # Bật lại (dữ liệu vẫn được giữ)
docker compose down -v       # Xoá toàn bộ dữ liệu và reset lại từ đầu
docker exec -it fyd-mysql mysql -u fyd -pfyd123 fyd_db   # Truy cập MySQL CLI
```

#### Cách 2: Cài MySQL trực tiếp
1. Mở MySQL và chạy:
```sql
CREATE DATABASE fyd_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'fyd'@'localhost' IDENTIFIED BY 'fyd123';
GRANT ALL PRIVILEGES ON fyd_db.* TO 'fyd'@'localhost';
FLUSH PRIVILEGES;
```
2. Import dữ liệu mẫu:
```bash
mysql -u fyd -pfyd123 fyd_db < sql/init_database.sql
```

### Bước 3: Chạy Backend
```bash
cd back-end

# (Tùy chọn) Đặt API key cho tính năng AI
# Windows:
set GROQ_API_KEY=your_key_here
# Linux/Mac:
export GROQ_API_KEY=your_key_here

# Chạy server
./mvnw spring-boot:run
```
> Backend sẽ chạy tại: http://localhost:8080

### Bước 4: Chạy Frontend
```bash
cd front-end

# Copy file env mẫu
cp .env.example .env
# Điền các API key cần thiết vào file .env (Google, Facebook)

# Cài đặt thư viện
npm install

# Chạy dev server
npm run dev
```
> Frontend sẽ chạy tại: http://localhost:5175

---

## 7. Tài khoản đăng nhập mặc định
| Vai trò | Tài khoản | Mật khẩu |
|---|---|---|
| Admin | `admin` | `admin123` |
| Customer | Xem bảng `customers` sau khi import dữ liệu |

---

## 8. Cấu trúc dự án
```
fyd-order-management/
├── back-end/           # Spring Boot API server
│   ├── src/main/java/  # Source code
│   ├── src/main/resources/  # Config (application.yaml)
│   └── pom.xml         # Maven dependencies
├── front-end/          # React + Vite SPA
│   ├── src/            # Source code
│   ├── package.json    # NPM dependencies
│   └── vite.config.js  # Vite config
├── sql/                # Database scripts
│   └── init_database.sql
└── README.md
```
