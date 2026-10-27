# BỘ TÀI LIỆU TEST CASE HỆ THỐNG QUẢN LÝ TUYỂN DỤNG TÍCH HỢP AI
## SMART RECRUITMENT MANAGEMENT SYSTEM (v2.0.0)

---

### 📌 GIỚI THIỆU TỔNG QUAN
Bộ tài liệu này là tài sản kiểm thử chính thức (Test Assets & Specifications) của dự án **Hệ Thống Quản Lý Tuyển Dụng Tích Hợp AI**, được xây dựng bởi Senior QA Engineer / Test Architect. Bộ tài liệu bao phủ toàn diện 100% các phân hệ nghiệp vụ, 17 thực thể cơ sở dữ liệu, các giao diện người dùng (Admin, Recruiter, Candidate), mô hình phân quyền RBAC đa tầng và toàn bộ các năng lực Trí tuệ nhân tạo (Safe Text-to-SQL, RAG CV-JD Matching, Anti-Hallucination, Trợ lý nghề nghiệp Ứng viên).

Tất cả các Test Case được thiết kế độc lập, có mã định danh duy nhất (Unique Test Case ID), điều kiện tiên quyết, dữ liệu đầu vào chi tiết, các bước thực thi rõ ràng và kết quả mong đợi có thể lượng hóa và kiểm chứng được.

---

### 📂 CẤU TRÚC BỘ TÀI LIỆU KIỂM THỬ (`docs/test-cases/`)

| Tên Tệp | Nội Dung & Phân Hệ Kiểm Thử | Số Lượng Test Case | Trọng Tâm Nghiệp Vụ |
| :--- | :--- | :---: | :--- |
| [00-test-plan.md](./00-test-plan.md) | **Kế hoạch kiểm thử tổng thể (Master Test Plan)** | - | Chiến lược, phạm vi, môi trường, vai trò, tiêu chí hoàn thành |
| [01-authentication.md](./01-authentication.md) | **Nhóm A: Xác thực & Quản lý phiên (Authentication)** | 18 TCs | Đăng nhập, Đăng ký, JWT Token, Quản lý phiên, Khóa tài khoản |
| [02-account-management.md](./02-account-management.md) | **Nhóm B: Quản trị tài khoản (Account Management - F14)** | 16 TCs | CRUD tài khoản, Tìm kiếm, Lọc vai trò/trạng thái, Khóa/Mở khóa |
| [03-role-permissions.md](./03-role-permissions.md) | **Kiểm soát phân quyền RBAC & Phạm vi Recruiter Scope** | 16 TCs | Phân quyền 3 vai trò, Chặn leo thang quyền (Privilege Escalation) |
| [04-job-management.md](./04-job-management.md) | **Nhóm C: Phòng ban, Vị trí & Tin tuyển dụng (F02 - F03)** | 18 TCs | Trạng thái MO/DONG/DA_LAP_DAY, Đăng tin, Đóng tin, Recruiter Scope |
| [05-candidate-profile-and-cv.md](./05-candidate-profile-and-cv.md) | **Nhóm D: Hồ sơ ứng viên & Tải tệp CV OCR (F04)** | 16 TCs | Upload CV <= 10MB, PDF/DOCX, Bóc tách văn bản OCR, Phiên bản CV |
| [06-applications.md](./06-applications.md) | **Nhóm E: Ứng tuyển & Chuyển trạng thái tuần tự (F05 - F06)** | 20 TCs | Chống nộp trùng (409 Conflict), Quy trình tuần tự, Audit Log |
| [07-interviews-and-evaluations.md](./07-interviews-and-evaluations.md) | **Nhóm F: Lịch phỏng vấn & Đánh giá năng lực (F07)** | 16 TCs | Lên lịch, Điểm chuyên môn/mềm/văn hóa (1-10), Quyền ứng viên |
| [08-notifications.md](./08-notifications.md) | **Nhóm G: Thông báo & Vòng đời Email (F09)** | 14 TCs | Vòng đời CHO_GUI -> DA_GUI / LOI, Đánh dấu đã đọc, Xóa thông báo |
| [09-reports-and-expenses.md](./09-reports-and-expenses.md) | **Nhóm H: Báo cáo tuyển dụng & Khoản chi (F10)** | 18 TCs | Báo cáo KPI, Phễu chuyển đổi, CRUD Khoản chi, Chi phí/hire |
| [10-ai-admin.md](./10-ai-admin.md) | **Nhóm I: AI Safe Text-to-SQL cho Quản trị viên (F12)** | 22 TCs | Safe Text-to-SQL, Anti-Spoofing, Prompt Injection, 15 Test cases |
| [11-ai-employee.md](./11-ai-employee.md) | **Nhóm J: AI Sàng lọc & Gợi ý cho Recruiter (F11, F13)** | 18 TCs | RAG Matching CV-JD, Anti-Hallucination, Gợi ý câu hỏi, Báo cáo AI |
| [12-ai-candidate.md](./12-ai-candidate.md) | **Nhóm K: AI Trợ lý nghề nghiệp Ứng viên (F14 Assistant)** | 22 TCs | Tư vấn nghề nghiệp, Tối ưu CV STAR, Tra cứu cá nhân, Bảo mật dữ liệu |
| [90-traceability-matrix.md](./90-traceability-matrix.md) | **Ma trận truy vết yêu cầu (Traceability Matrix - RTM)** | - | Ánh xạ FR01-FR15, NFR01-NFR08 -> Function -> Test Cases |
| [91-coverage-analysis.md](./91-coverage-analysis.md) | **Phân tích độ bao phủ kiểm thử (Coverage Analysis)** | - | Thống kê theo Module, Vai trò, Loại kiểm thử, Mức độ ưu tiên (Tổng 214 TCs) |
| [92-test-data-and-preconditions.md](./92-test-data-and-preconditions.md) | **Dữ liệu kiểm thử & Điều kiện tiên quyết (Test Data)** | - | Tài khoản mẫu, UUIDs mẫu, JWT Tokens, File CV mẫu, Payload API |
| [93-known-gaps-and-assumptions.md](./93-known-gaps-and-assumptions.md) | **Khoảng trống, Giả định kỹ thuật & Điểm xác minh** | - | Điểm khác biệt giữa Specs và Code, Khuyến nghị nâng cấp |

---

### 🏷️ QUY TẮC ĐẶT MÃ TEST CASE (NAMING CONVENTION)

Cấu trúc mã Test Case được chuẩn hóa theo định dạng: `TC-[MODULE]-[INDEX]`
* **TC-AUTH-xxx**: Xác thực, Đăng nhập, Đăng ký, Token, Quản lý phiên.
* **TC-USER-xxx**: Quản trị tài khoản người dùng, Khóa/Mở khóa.
* **TC-RBAC-xxx**: Phân quyền RBAC, Kiểm soát phạm vi truy cập (Scope).
* **TC-JOB-xxx**: Phòng ban, Vị trí tuyển dụng và Tin đăng.
* **TC-CV-xxx**: Hồ sơ ứng viên, Tải lên tệp CV, OCR parser.
* **TC-APP-xxx**: Lượt ứng tuyển, Chống nộp trùng, Chuyển trạng thái tuần tự.
* **TC-INT-xxx**: Lịch phỏng vấn, Đánh giá kết quả phỏng vấn.
* **TC-NOTI-xxx**: Thông báo hệ thống và Vòng đời gửi email.
* **TC-REPORT-xxx**: Báo cáo KPI tuyển dụng và Quản lý khoản chi (KhoanChi).
* **TC-AI-ADMIN-xxx**: AI Safe Text-to-SQL dành cho Quản trị viên (Admin).
* **TC-AI-EMP-xxx**: AI Đối sánh CV, Gợi ý câu hỏi, Báo cáo tuyển dụng (Recruiter).
* **TC-AI-CAND-xxx**: AI Trợ lý ảo tư vấn nghề nghiệp dành cho Ứng viên (Candidate).

---

### 🎯 HỆ THỐNG PHÂN LOẠI MỨC ĐỘ ƯU TIÊN (PRIORITY)
* **P0 (Blocker / Critical):** Ảnh hưởng nghiêm trọng đến an toàn hệ thống, bảo mật dữ liệu, cơ chế xác thực, tính toàn vẹn trạng thái tuần tự hoặc tính năng cốt lõi không thể sử dụng.
* **P1 (High):** Chức năng nghiệp vụ chính, kiểm soát quyền truy cập theo vai trò (RBAC), quy tắc chống nộp trùng hoặc các tính năng AI trọng yếu.
* **P2 (Medium):** Các luồng nghiệp vụ thông thường, kiểm tra validation đầu vào, trường hợp biên (Boundary) và xử lý ngoại lệ.
* **P3 (Low):** Kiểm tra hiển thị giao diện, định dạng thông báo, trải nghiệm người dùng (UX) và các tình huống ít rủi ro.

---

### ⚙️ HƯỚNG DẪN THỰC THI KIỂM THỬ

#### 1. Kiểm thử tự động (Automated Test Suite)
Dự án tích hợp bộ kiểm thử tự động sử dụng test runner chuẩn Node.js (`node:test`):
```bash
# Chạy toàn bộ bộ test tự động (193 tests)
npm test

# Chạy riêng các kịch bản kiểm thử đơn vị
npm run test:unit

# Chạy riêng kịch bản kiểm thử tích hợp toàn trình
npm run test:integration
```

#### 2. Kiểm thử thủ công & API Testing (Manual & API Testing)
* Khởi động server: `npm start` (mặc định tại cổng `http://localhost:3000`).
* Đăng nhập các tài khoản mẫu sẵn có (xem chi tiết tại [`92-test-data-and-preconditions.md`](./92-test-data-and-preconditions.md)):
  * **Admin:** `admin` / `MatKhau@123`
  * **Recruiter:** `recruiter_linh` / `MatKhau@123`
  * **Candidate:** `candidate_an` / `MatKhau@123`
