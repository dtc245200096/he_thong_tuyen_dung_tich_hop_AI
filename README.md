# Hệ Thống Quản Lý Tuyển Dụng AI (Smart Recruitment System)
> **Kiến trúc Doanh Nghiệp Chuẩn Hóa:** 17 Thực Thể CSDL (UUID & Soft-delete) | Docker Compose | Phân Quyền RBAC 3 Vai Trò | RAG AI Đối Sánh CV Chống Ảo Giác | Safe Text-to-SQL (F12) | 18/18 Automated Tests

---

## 📌 Tổng Quan Dự Án

Hệ thống được thiết kế theo yêu cầu doanh nghiệp nhằm giải quyết trọn vẹn 4 bài toán trọng tâm:
1. **Database & DevOps**: CSDL quan hệ 17 thực thể chuẩn hóa, sử dụng khóa chính UUID (36 ký tự), ràng buộc xóa mềm (`deleted_at`) bảo tồn lịch sử thống kê, kiểm soát dung lượng file CV &le; 10 MiB, định dạng PDF/DOCX, môi trường Docker Compose container hóa.
2. **Backend RESTful API & Phân Quyền RBAC**: Triển khai đầy đủ các chức năng F01 đến F10, phân quyền chặt chẽ giữa Quản trị viên (Admin), Nhân viên tuyển dụng (Recruiter - phạm vi phụ trách), và Ứng viên (Candidate - chỉ xem thông tin cá nhân). Chống nộp trùng CV và quy trình chuyển trạng thái tuần tự: `MOI` &rarr; `DANG_PHONG_VAN` &rarr; `DAT` / `KHONG_DAT`.
3. **Module AI Services & RAG (F11 - F13)**: Lớp `DichVuAI` xử lý 4 nghiệp vụ: Đối sánh CV (`DOI_SANH`), Gợi ý câu hỏi phỏng vấn (`CAU_HOI`), Sinh báo cáo (`BAO_CAO`), và Hỏi đáp dữ liệu tự nhiên (`HOI_DAP`) với cơ chế **Safe Text-to-SQL**. Nghiêm cấm bịa đặt dữ liệu (Anti-hallucination), kiểm tra hợp lệ qua `kiemTraHopLe()` trước khi lưu vào `KetQuaAI`. AI không được phép tự ý thay đổi trạng thái tuyển dụng.
4. **UI/UX Dashboards & Automated Testing**: 3 giao diện Dashboard trực quan (Quản lý, Nhân viên, Ứng viên) đáp ứng NF01 (Dễ sử dụng). Bộ kiểm thử tự động 18/18 Unit & Integration Tests bao phủ toàn diện luồng nghiệp vụ.

---

## 🏗️ Cấu Trúc Dự Án

```
d:\dự án 2\
├── docker-compose.yml           # Thiết lập môi trường Docker: MySQL 8.0, Web App, PhpMyAdmin
├── Dockerfile                   # Dockerfile container hóa ứng dụng Node.js
├── .env.example                 # Mẫu cấu hình biến môi trường
├── package.json                 # Cấu hình dependency & script kiểm thử
├── database/
│   ├── erd.md                   # Sơ đồ quan hệ thực thể ERD Mermaid (17 thực thể)
│   ├── init.sql                 # Script SQL khởi tạo 17 bảng, khóa UUID, CHECK constraints
│   └── seed.sql                 # Dữ liệu mẫu phong phú cho 17 thực thể
├── src/
│   ├── config/
│   │   └── database.js          # Kết nối MySQL & In-Memory Store resilience
│   ├── middleware/
│   │   ├── auth.js              # Xác thực JWT, RBAC & kiểm tra phạm vi phụ trách (Scope)
│   │   └── upload.js            # Kiểm soát tệp CV: <= 10 MiB & định dạng PDF/DOCX
│   ├── services/
│   │   ├── DichVuAI.js          # Module AI: DOI_SANH, CAU_HOI, BAO_CAO, Safe Text-to-SQL
│   │   ├── DichVuEmail.js       # Vòng đời email: CHO_GUI -> DA_GUI / LOI
│   │   └── ocrParser.js         # Trích xuất văn bản từ CV (giới hạn 100.000 ký tự)
│   ├── controllers/
│   │   ├── authController.js    # F01: Đăng nhập/Đăng ký/Xác thực
│   │   ├── phongBanController.js# F02: Phòng ban & Vị trí (MO, DONG, DA_LAP_DAY)
│   │   ├── tinTuyenDungController.js # F03: Tin tuyển dụng & Recruiter Scope
│   │   ├── hoSoCvController.js  # F04: Tải CV & OCR text extraction
│   │   ├── luotUngTuyenController.js # F05, F06: Chống nộp trùng & Trạng thái tuần tự
│   │   ├── lichPhongVanController.js # F07: Lịch phỏng vấn & Đánh giá điểm
│   │   ├── nguonTuyenDungController.js # F08: Kênh tuyển dụng & Talent Pool
│   │   ├── thongBaoController.js# F09: Hệ thống Email & Thông báo
│   │   ├── baoCaoController.js  # F10: Thống kê KPI & Khoản Chi
│   │   └── aiController.js      # F11 - F13: API AI Services & Text-to-SQL
│   ├── routes/
│   │   └── api.js               # Bảng định tuyến RESTful API
│   └── app.js                   # Entrypoint máy chủ Express
├── public/
│   ├── css/
│   │   └── style.css            # Hệ thống giao diện Modern Design, Glassmorphism
│   ├── js/
│   │   ├── app.js               # Client auth state & Quick Login Switcher
│   │   ├── admin-dashboard.js   # Logic Dashboard Quản trị & Chatbot Text-to-SQL
│   │   ├── recruiter-dashboard.js # Logic Dashboard Recruiter & Sàng lọc AI
│   │   └── candidate-dashboard.js # Logic Cổng Ứng viên, Dropzone CV & Timeline
│   ├── index.html               # Trang chủ điều hướng các vai trò
│   ├── admin.html               # Dashboard Quản Trị Viên (Admin)
│   ├── recruiter.html           # Dashboard Chuyên Viên Tuyển Dụng (Recruiter)
│   └── candidate.html           # Cổng Thông Tin Ứng Viên (Candidate)
└── tests/
    ├── unit/
    │   ├── antiDuplicateApply.test.js # Kiểm thử chống nộp trùng CV (409 Conflict)
    │   ├── aiSecurityStatus.test.js   # Kiểm thử AI không tự đổi trạng thái tuyển dụng
    │   └── emailStatus.test.js        # Kiểm thử vòng đời CHO_GUI -> DA_GUI / LOI
    └── integration/
        └── recruitmentFlow.test.js    # Toàn trình tuần tự MOI -> DANG_PHONG_VAN -> DAT
```

---

## 🗄️ 1. Cơ Sở Dữ Liệu & 17 Thực Thể (UUID & Soft-Delete)

Toàn bộ các bảng đều thỏa mãn các tiêu chuẩn kỹ thuật:
1. **Khóa chính**: UUID (`CHAR(36)`).
2. **Bảng `HoSoCV`**:
   - `CHECK (dung_luong_bytes > 0 AND dung_luong_bytes <= 10485760)` (&le; 10 MiB).
   - `CHECK (dinh_dang IN ('pdf', 'docx', 'PDF', 'DOCX'))`.
   - `vanBanTrichXuat MEDIUMTEXT NOT NULL` (Hỗ trợ lưu trữ vượt 100.000 ký tự).
3. **Bảng `ViTriTuyenDung`**: Trạng thái `ENUM('MO', 'DONG', 'DA_LAP_DAY')`.
4. **Khóa ngoại & Xóa mềm**: Toàn bộ 17 bảng đều có cột `deleted_at TIMESTAMP NULL`, các khóa ngoại cấu hình `ON DELETE RESTRICT ON UPDATE CASCADE` nhằm bảo toàn vĩnh viễn dữ liệu lịch sử thống kê khi đóng tin hoặc khóa tài khoản.

### Danh Sách 17 Thực Thể:
- `TaiKhoan`: Tài khoản người dùng (ADMIN, RECRUITER, CANDIDATE).
- `PhongBan`: Phòng ban chuyên môn.
- `ViTriTuyenDung`: Vị trí công việc (Trạng thái MO, DONG, DA_LAP_DAY).
- `TinTuyenDung`: Tin đăng tuyển dụng.
- `UngVien`: Thông tin ứng viên.
- `HoSoCV`: Tệp CV và nội dung trích xuất OCR.
- `LuotUngTuyen`: Đơn ứng tuyển (Unique index chống nộp trùng).
- `LichPhongVan`: Lịch hẹn phỏng vấn.
- `DanhGiaPhongVan`: Đánh giá sau phỏng vấn (Điểm chuyên môn, kỹ năng, văn hóa).
- `NguonTuyenDung`: Kênh tiếp nhận (LinkedIn, TopCV, Website...).
- `HoSoTiemNang`: Talent Pool lưu trữ ứng viên tiềm năng.
- `ThongBao`: Thông báo hệ thống & trạng thái gửi email.
- `KetQuaAI`: Lưu trữ kết quả AI (DOI_SANH, CAU_HOI, BAO_CAO, HOI_DAP).
- `BaoCaoTuyenDung`: Báo cáo hiệu quả định kỳ.
- `SuKienTrangThai`: Audit log vết chuyển trạng thái tuần tự.
- `KhoanChi`: Quản lý chi phí tuyển dụng theo tin/kênh.
- `TuongTac`: Nhật ký tương tác (Gọi điện, Email, Phỏng vấn).

---

## 🚀 2. Hướng Dẫn Khởi Chạy Môi Trường

### Cách 1: Khởi chạy bằng Docker Compose (Khuyên dùng)
```bash
# Khởi động toàn bộ MySQL 8.0, Web Server và PhpMyAdmin
docker compose up -d

# Xem log các container
docker compose logs -f
```
- **Web App**: http://localhost:3000
- **PhpMyAdmin**: http://localhost:8081 (User: `root` / Pass: `rootpassword`)
- **MySQL Direct**: `localhost:3306` (Database: `tuyendung_ai`)

### Cách 2: Khởi chạy cục bộ bằng Node.js
```bash
# Cài đặt thư viện
npm install

# Khởi chạy máy chủ
npm start
```

---

## 🧪 3. Kết Quả Kiểm Thử Tự Động (18/18 Tests Passed)

Chạy bộ kịch bản kiểm thử:
```bash
npm test
```

### Các Kịch Bản Được Kiểm Chứng Nghiêm Ngặt:
1. **Chống nộp trùng CV (Anti-Duplicate Submission)**:
   - Ứng viên nộp lần đầu: `201 Created` &rarr; Trạng thái `MOI`.
   - Cùng ứng viên nộp lại vào cùng tin tuyển dụng: Hệ thống chặn ngay lập tức với mã `409 Conflict` (`DUPLICATE_APPLICATION`).
   - Ứng viên khác hoặc nộp vào tin tuyển dụng khác: Được phép.
2. **Bảo mật trạng thái (AI Security Status)**:
   - Khi AI chạy đối sánh đạt điểm cao (94/100): Trạng thái của ứng viên **VẪN GIỮ NGUYÊN LÀ MOI**.
   - AI tuyệt đối không có quyền tự đổi trạng thái sang `DAT` hoặc `DANG_PHONG_VAN`.
   - Chỉ người dùng có vai trò `RECRUITER` hoặc `ADMIN` mới có quyền thực hiện chuyển trạng thái qua API nghiệp vụ.
3. **Vòng đời API `guiEmail()`**:
   - Khi khởi tạo: Ghi nhận trạng thái `CHO_GUI`.
   - Khi gửi thành công: Cập nhật thành `DA_GUI`.
   - Khi gặp sự cố mạng/máy chủ: Cập nhật thành `LOI` và lưu vết `chi_tiet_loi`.
4. **Quy trình tuần tự (Sequential Pipeline Transition)**:
   - Kiểm tra chặt chẽ: `MOI` &rarr; `DANG_PHONG_VAN` &rarr; `DAT / KHONG_DAT`.
   - Ngăn chặn hành vi nhảy cóc (Ví dụ từ `MOI` nhảy thẳng lên `DAT` sẽ bị trả về lỗi `400 INVALID_STATUS_TRANSITION`).

---

## 🔑 4. Tài Khoản Thử Nghiệm Sẵn Có (Quick Login Switcher)

| Vai Trò | Tên Đăng Nhập | Mật Khẩu | Quyền Hạn Trong Hệ Thống |
| :--- | :--- | :--- | :--- |
| **Quản Trị Viên (ADMIN)** | `admin` | `MatKhau@123` | Toàn quyền cấu hình, xem KPI tổng thể, quản trị phòng ban, duyệt khoản chi, dùng Safe Text-to-SQL |
| **Nhân Viên Tuyển Dụng (RECRUITER)** | `recruiter_linh` | `MatKhau@123` | Quản lý tin phụ trách (Scope), dùng AI Đối Sánh CV, gợi ý câu hỏi PV, lên lịch và duyệt trạng thái tuần tự |
| **Ứng Viên (CANDIDATE)** | `candidate_an` | `MatKhau@123` | Xem tin tuyển dụng, upload CV kéo thả (giới hạn 10MB, PDF/DOCX), theo dõi tiến trình nộp đơn, lịch phỏng vấn và thông báo |
