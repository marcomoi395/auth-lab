### 1. **Giới thiệu dự án**

Dự án xây dựng một hệ thống Authentication \& Authorization mẫu sử dụng Node.js, Express và MongoDB. Mục tiêu là cung cấp một nền tảng thực hành các kỹ thuật xác thực (Authentication) và phân quyền (Authorization) hiện đại, đảm bảo bảo mật, dễ mở rộng và dễ kiểm thử.

---

### 2. **Phạm vi chức năng**

- Đăng ký, đăng nhập, đăng xuất người dùng (Authentication)
- Quản lý phiên làm việc (Session-based) và JWT (Token-based)
- Phân quyền theo vai trò (RBAC): Admin, User, Guest
- Đổi mật khẩu, quên mật khẩu (password reset)
- Các route bảo vệ theo quyền truy cập
- Kiểm thử tự động (unit test, integration test)

---

### 3. **Kiến trúc tổng thể**

#### **3.1. Công nghệ sử dụng**

- Node.js (runtime)
- Express (web framework)
- MongoDB + Mongoose (database \& ODM)
- bcrypt (hash password)
- jsonwebtoken (JWT)
- express-session (session management)
- helmet (bảo mật HTTP headers)
- express-rate-limit (chống brute-force)
- dotenv (quản lý biến môi trường)
- jest, supertest (testing)

#### **3.2. Cấu trúc thư mục**

```
/project-root
├── src/
│   ├── controllers/
│   │   ├── AuthController.js           // Xử lý xác thực người dùng
│   │   ├── UserController.js           // Quản lý thông tin người dùng
│   │   └── AdminController.js          // Chức năng quản trị
│   ├── models/
│   │   ├── User.js                     // Schema người dùng MongoDB
│   │   ├── Role.js                     // Schema vai trò
│   │   └── Session.js                  // Schema phiên làm việc
│   ├── middleware/
│   │   ├── authentication.js           // Middleware xác thực JWT
│   │   ├── authorization.js            // Middleware phân quyền RBAC
│   │   ├── rateLimiter.js             // Middleware chống brute-force
│   │   ├── validation.js              // Middleware validate input
│   │   └── errorHandler.js            // Middleware xử lý lỗi
│   ├── routes/
│   │   ├── authRoutes.js              // Routes xác thực
│   │   ├── userRoutes.js              // Routes người dùng
│   │   └── adminRoutes.js             // Routes quản trị
│   ├── services/
│   │   ├── authService.js             // Business logic xác thực
│   │   ├── userService.js             // Business logic người dùng
│   │   ├── tokenService.js            // Service quản lý JWT
│   │   └── emailService.js            // Service gửi email
│   ├── utils/
│   │   ├── logger.js                  // Utility logging
│   │   ├── validator.js               // Utility validation
│   │   ├── encryptHelper.js           // Helper mã hóa
│   │   └── responseHelper.js          // Helper format response
│   ├── config/
│   │   ├── database.js                // Cấu hình MongoDB
│   │   ├── jwt.js                     // Cấu hình JWT
│   │   ├── security.js                // Cấu hình bảo mật
│   │   └── environment.js             // Biến môi trường
│   └── app.js                         // Entry point ứng dụng
├── tests/
│   ├── unit/                          // Unit tests
│   ├── integration/                   // Integration tests
│   └── security/                      // Security tests
├── docs/
│   ├── api/                           // API documentation
│   ├── security/                      // Security documentation
│   └── deployment/                    // Deployment guides
├── .copilot/
│   ├── instructions.md                // GitHub Copilot instructions
│   └── examples/                      // Code examples for Copilot
├── .env.example                       // Environment variables template
├── package.json
└── README.md
```

#### **3.2. Cấu trúc thư mục**

##### 3.2.1. Auth (Xác thực)

| Phương thức | Endpoint                | Mô tả                   | Quyền truy cập    |
| :---------- | :---------------------- | :---------------------- | :---------------- |
| POST        | `/auth/register`        | Đăng ký tài khoản       | Công khai         |
| POST        | `/auth/login`           | Đăng nhập               | Công khai         |
| POST        | `/auth/logout`          | Đăng xuất               | Đã đăng nhập      |
| POST        | `/auth/forgot-password` | Gửi email quên mật khẩu | Công khai         |
| POST        | `/auth/reset-password`  | Đặt lại mật khẩu        | Công khai (token) |
| POST        | `/auth/refresh-token`   | Làm mới access token    | Đã đăng nhập      |
|             |                         |                         |                   |
|             |                         |                         |                   |

##### 3.2.2. User (Quản lý tài khoản cá nhân)

| Phương thức | Endpoint             | Mô tả                      | Quyền truy cập |
| :---------- | :------------------- | :------------------------- | :------------- |
| GET         | `/users/me`          | Lấy thông tin cá nhân      | Đã đăng nhập   |
| PUT         | `/users/me`          | Cập nhật thông tin cá nhân | Đã đăng nhập   |
| PUT         | `/users/me/password` | Đổi mật khẩu               | Đã đăng nhập   |

##### 3.2.3. Admin (Quản trị)

| Phương thức | Endpoint           | Mô tả                     | Quyền truy cập |
| :---------- | :----------------- | :------------------------ | :------------- |
| GET         | `/admin/users`     | Lấy danh sách user        | Admin          |
| GET         | `/admin/users/:id` | Lấy thông tin user cụ thể | Admin          |
| PUT         | `/admin/users/:id` | Cập nhật user             | Admin          |
| DELETE      | `/admin/users/:id` | Xóa user                  | Admin          |
| GET         | `/admin/roles`     | Lấy danh sách role        | Admin          |
| POST        | `/admin/roles`     | Thêm role mới             | Admin          |
| PUT         | `/admin/roles/:id` | Cập nhật role             | Admin          |
| DELETE      | `/admin/roles/:id` | Xóa role                  | Admin          |

##### 3.2.4. (Tuỳ chọn) Permission

| Phương thức | Endpoint                 | Mô tả                    | Quyền truy cập |
| :---------- | :----------------------- | :----------------------- | :------------- |
| GET         | `/admin/permissions`     | Lấy danh sách permission | Admin          |
| POST        | `/admin/permissions`     | Thêm permission mới      | Admin          |
| PUT         | `/admin/permissions/:id` | Cập nhật permission      | Admin          |
| DELETE      | `/admin/permissions/:id` | Xóa permission           | Admin          |

---

### 4. **Quy trình phát triển**

#### **4.1. Phân chia nhiệm vụ**

- **Backend Developer**: Xây dựng API, middleware, kết nối DB, logic xác thực/phân quyền.
- **Tester**: Viết test case, kiểm thử các flows.
- **DevOps**: Cấu hình môi trường, CI/CD, logging \& monitoring.

#### **4.2. Quy trình phát triển**

1. **Phân tích yêu cầu**: Đọc kỹ tài liệu này, xác định rõ các tính năng bắt buộc.
2. **Thiết kế database**: Xác định schema User, Role, Session, Token.
3. **Xây dựng từng module**: Theo thứ tự: models → controllers → routes → middleware.
4. **Kiểm thử từng phần**: Viết test cho từng module trước khi chuyển sang module tiếp theo.
5. **Tích hợp và kiểm thử tổng thể**: Đảm bảo các flows hoạt động đúng, không lỗi bảo mật.
6. **Viết tài liệu hướng dẫn sử dụng**: README.md, API docs.
7. **Triển khai thử nghiệm**: Trên môi trường staging hoặc local.
8. **Review \& cải tiến**: Code review, tối ưu, fix bug.

---

### 5. **Yêu cầu chi tiết theo module**

#### **5.1. Models**

- User: username, email, password (hashed), role, resetToken, resetTokenExpiry
- Role: roleName, permissions (nếu cần mở rộng)
- Session (nếu dùng session store ngoài)

#### **5.2. Controllers**

- AuthController: register, login, logout, refresh token, reset password
- UserController: get profile, update profile, change password
- AdminController: quản lý user, xem logs (nếu cần)

#### **5.3. Middleware**

- AuthMiddleware: xác thực JWT/session
- RoleMiddleware: kiểm tra quyền truy cập theo role
- RateLimitMiddleware: chống brute-force
- ErrorHandler: xử lý lỗi tập trung

#### **5.4. Routes**

- /auth: register, login, logout, refresh, reset-password
- /users: thông tin cá nhân, đổi mật khẩu
- /admin: quản lý user (chỉ admin truy cập)

---

### 6. **Nguyên tắc phát triển**

- **Tuân thủ chuẩn RESTful API**
- **Code phải có test**: Không merge code chưa có test.
- **Không hardcode secrets**: Sử dụng biến môi trường.
- **Tách biệt rõ business logic và controller**
- **Viết log đầy đủ cho các sự kiện bảo mật**
- **Tối ưu bảo mật đầu vào (validate, sanitize)**
- **Review code trước khi merge**

---

### 7. **Quy tắc commit code \& quản lý source**

- Mỗi chức năng/tính năng mới phải lên branch riêng, đặt tên rõ ràng.
- Commit message rõ ràng, có prefix: `[Feature]`, `[Fix]`, `[Refactor]`, `[Test]`, `[Docs]`.
- Merge request phải có người review.

---

### 8. **Kiểm thử \& triển khai**

- **Unit test**: Đảm bảo từng hàm/middleware hoạt động đúng.
- **Integration test**: Đảm bảo các flows chính xác thực/phân quyền hoạt động đúng.
- **Security test**: Thử brute-force, SQL/NoSQL injection, XSS, CSRF.
- **Triển khai thử nghiệm**: Trên môi trường staging trước khi production.

---

### 9. **Tài liệu \& hướng dẫn sử dụng**

- README.md: Cách cài đặt, chạy, test, cấu hình biến môi trường.
- API docs: Swagger hoặc Postman collection.
- Hướng dẫn mở rộng, bảo trì, xử lý lỗi thường gặp.

---

### 10. **Các lưu ý quan trọng**

- Không được bỏ qua các bước kiểm thử bảo mật.
- Mọi thay đổi liên quan đến authentication/authorization phải được review kỹ.
- Luôn cập nhật các thư viện bảo mật lên phiên bản mới nhất.
- Ghi chú lại mọi quyết định thay đổi thiết kế hoặc logic.

---
