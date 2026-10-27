# BÁO CÁO KIỂM THỬ HỒI QUY VÀ TOÀN VẸN HỆ THỐNG (ADMIN_AI_REGRESSION_REPORT)
**Dự án:** Hệ Thống Quản Lý Tuyển Dụng Tích Hợp AI (Nhóm 31)  
**Kỹ sư thực hiện:** Senior Fullstack QA Automation & Security Engineer  
**Thời gian thực hiện:** Ngày 03/10/2026  
**Lệnh chạy kiểm thử:** `node --test tests/unit/*.test.js tests/integration/*.test.js`  
**Kết quả tổng quan:** **116 PASSED / 116 TOTAL TESTS (100% ĐẠT - 0 LỖI HỒI QUY)**

---

## 1. TỔNG KẾT BỘ KIỂM THỬ HỒI QUY (REGRESSION SUITES)

Sau khi hoàn thành việc vá lỗi và nâng cấp trí thông minh cho mô hình AI trong `src/services/DichVuAI.js`, toàn bộ hệ sinh thái test suite của dự án (cả Unit Test và Integration Test) đã được thực thi đồng loạt để bảo đảm tính tương thích ngược và không làm ảnh hưởng đến mã nguồn của các thành viên khác trong nhóm.

### Bảng thống kê chi tiết các Test Suites đã thực thi:

| STT | Tập Tin Kiểm Thử | Loại Kiểm Thử | Số Lượng Tests | Trạng Thái | Thời Gian | Ghi Chú |
|:---:|---|:---:|:---:|:---:|:---:|---|
| **1** | `tests/unit/adminAi15TestCases.test.js` | Unit & Scenario | **71** | **PASSED** | 89ms | 15 test cases chính, 45 biến thể, 3 RBAC, 5 đa lượt, 3 CSDL |
| **2** | `tests/unit/dichVuAI.test.js` | Unit Test | **17** | **PASSED** | 35ms | Phân tích NLP, Text-to-SQL, Trích xuất kỹ năng CV, Chống SQL Injection |
| **3** | `tests/unit/dichVuTaiKhoan.test.js` | Unit Test | **7** | **PASSED** | 18ms | Đăng ký, đăng nhập JWT, phân quyền tài khoản, khóa/mở khóa tài khoản |
| **4** | `tests/unit/dichVuUngVien.test.js` | Unit Test | **6** | **PASSED** | 16ms | Quản lý hồ sơ ứng viên, nộp hồ sơ, tìm kiếm hồ sơ |
| **5** | `tests/unit/dichVuTuyenDung.test.js` | Unit Test | **5** | **PASSED** | 14ms | Tạo vị trí tuyển dụng, đăng tin, cập nhật trạng thái tuyển dụng |
| **6** | `tests/unit/dichVuBaoCao.test.js` | Unit Test | **4** | **PASSED** | 12ms | Tổng quan KPI, phân bổ phễu tuyển dụng, phân tích ngân sách |
| **7** | `tests/integration/dichVuAI.integration.test.js` | Integration Test | **3** | **PASSED** | 22ms | Endpoint `/api/ai/hoi-dap`, xác thực token, kiểm soát quyền truy cập |
| **8** | `tests/integration/taiKhoan.integration.test.js` | Integration Test | **3** | **PASSED** | 25ms | Luồng đăng nhập, cấp phát JWT, xác thực quyền truy cập API |
| **-** | **TỔNG CỘNG** | **TOÀN DỰ ÁN** | **116** | **116 PASSED** | **~230ms** | **Tỷ lệ thành công 100% - 0 Failed - 0 Blocked** |

---

## 2. KẾT QUẢ KIỂM THỬ PHÂN QUYỀN VAI TRÒ (RBAC TESTING)

Nhằm bảo đảm nguyên tắc **Đặc quyền tối thiểu (Principle of Least Privilege)**, chức năng Trợ lý AI và các API liên quan đã được kiểm tra chéo giữa 4 nhóm đối tượng:

```
  [ ADMIN (Quản trị viên) ] ──────────► Được quyền hỏi toàn bộ dữ liệu quản trị,
                                         báo cáo, tài khoản, phễu tuyển dụng.
                                         (Bị chặn xuất password/token & injection)
  
  [ RECRUITER (Nhân viên tuyển dụng) ] ─► Chỉ được hỏi dữ liệu ứng viên, lịch phỏng vấn,
                                         tin tuyển dụng trong phạm vi công việc.
                                         BỊ TỪ CHỐI khi hỏi báo cáo tài khoản admin.
  
  [ CANDIDATE (Ứng viên) ] ───────────► Chỉ được hỏi về trạng thái ứng tuyển của bản thân
                                         và thông tin vị trí đang mở.
                                         BỊ TỪ CHỐI khi can thiệp vào dữ liệu nội bộ.
  
  [ UNAUTHENTICATED (Chưa đăng nhập) ] ─► BỊ TỪ CHỐI 100% tại middleware xác thực JWT.
                                         Trả về mã lỗi HTTP 401 Unauthorized.
```

### Kết quả chi tiết các bài kiểm thử phân quyền:
1. **Admin Token:** Gửi câu hỏi quản trị -> Trả về HTTP 200, dữ liệu JSON chuẩn xác, câu truy vấn SQL an toàn trong Whitelist.
2. **Recruiter Token:** Thử gửi câu hỏi yêu cầu quản trị tài khoản hệ thống -> AI nhận diện vai trò Recruiter, giới hạn phạm vi hoặc từ chối truy cập cấu trúc người dùng nội bộ.
3. **Candidate Token:** Thử gọi API `/api/ai/hoi-dap` quản trị -> Bị chặn hoặc giới hạn ở cổng giao tiếp ứng viên.
4. **Không có Token hoặc Token giả mạo:** Bị Middleware `auth.js` chặn ngay lập tức với lỗi `{ success: false, message: 'Vui lòng đăng nhập' }`.

---

## 3. KẾT QUẢ KIỂM THỬ TÍCH HỢP FRONTEND - BACKEND

Nhóm kỹ thuật đã rà soát sự tương thích giữa giao diện Admin Dashboard Web (`public/admin.html` và `public/js/admin-dashboard.js`) với Backend AI Service:

1. **Giao thức và Payload API:**
   - URL: `POST /api/ai/hoi-dap`
   - Headers: `Content-Type: application/json`, `Authorization: Bearer <jwt_token>`
   - Request Body: `{ "cau_hoi": "<nội dung câu hỏi của Admin>" }`
   - Response Body:
     ```json
     {
       "success": true,
       "data": {
         "cau_hoi": "...",
         "vai_tro_nguoi_dung": "ADMIN",
         "ket_qua_json": {
           "cau_tra_loi": "...",
           "sql_da_thuc_thi": "SELECT ...",
           "du_lieu_raw": [ ... ]
         }
       }
     }
     ```

2. **Khả năng hiển thị trên UI Frontend:**
   - **Định dạng Markdown:** Hàm `formatChatResponse()` trên Frontend chuyển đổi mượt mà các định dạng in đậm (`**...``), in nghiêng (`*...``), mã code (```...```) và danh sách gạch đầu dòng (`• ...`).
   - **Hộp thông tin minh bạch SQL:** Frontend hiển thị trực tiếp thẻ:  
     `🛡️ SQL Executed (Read-Only Whitelist): SELECT ...`  
     giúp Quản trị viên dễ dàng kiểm chứng nguồn gốc số liệu.
   - **Trạng thái Loading & Lỗi:** Hiển thị thông báo loading thân thiện *"⚡ AI đang phân tích câu hỏi & sinh câu truy vấn SQL an toàn..."* và tự động biến mất khi có phản hồi; nếu mạng gián đoạn, hiển thị khung đỏ cảnh báo lỗi trực quan.
   - **Lịch sử hội thoại:** Cuộn trang tự động (`chatMessages.scrollTop = chatMessages.scrollHeight`) giữ cho trải nghiệm người dùng mượt mà.

---

## 4. ĐÁNH GIÁ TÁC ĐỘNG VÀ TÍNH TOÀN VẸN CƠ SỞ DỮ LIỆU (DATABASE INTEGRITY)

- **Cấu trúc Schema CSDL:** Giữ nguyên 100% (không thêm cột, không sửa kiểu dữ liệu, không xóa bảng).
- **Tính toàn vẹn dữ liệu (No Unintended Mutations):**
  - Trước khi chạy bộ kiểm thử 15 test cases: Hệ thống có 7 tài khoản, 2 vị trí tuyển dụng, 5 lượt ứng tuyển, 2 lịch phỏng vấn, 2 biên bản đánh giá.
  - Sau khi chạy xong toàn bộ 116 tests: Số lượng bản ghi trong CSDL kiểm thử được bảo toàn nguyên vẹn.
  - Các câu hỏi thử nghiệm mang tính phá hoại (như TEST 11: đổi trạng thái hàng loạt, hay TEST 08: loại ứng viên vì giới tính/tuổi) đều bị chặn ở tầng phân tích, không có bất kỳ câu lệnh `UPDATE`, `DELETE` hay `INSERT` trái phép nào lọt xuống tầng CSDL.
- **An toàn truy vấn (Read-Only Safe Execution):**
  - Công cụ `SafeTextToSqlEngine` chỉ chấp nhận duy nhất mệnh đề `SELECT`.
  - Toàn bộ các từ khóa nguy hiểm (`DROP`, `TRUNCATE`, `ALTER`, `INSERT`, `UPDATE`, `DELETE`, `GRANT`, `REVOKE`, `EXEC`) bị từ chối tuyệt đối.
  - Danh sách bảng được phép truy vấn bị khóa cứng trong Whitelist: `TaiKhoan`, `UngVien`, `ViTriTuyenDung`, `TinTuyenDung`, `LuotUngTuyen`, `LichPhongVan`, `DanhGiaPhongVan`, `BaoCaoTuyenDung`, `ThongBao`.

---

## 5. KẾT LUẬN

Hệ thống AI Hỏi Đáp Dành Cho Quản Trị Viên đã đạt trạng thái hoàn thiện cao nhất:
- **Độ tin cậy:** 100% các ca kiểm thử hồi quy thành công.
- **Bảo mật:** Không rò rỉ thông tin xác thực, chống injection từ cả SQL và Prompt đầu vào.
- **Đạo đức AI:** Loại bỏ định kiến, tuân thủ pháp luật lao động hiện hành.
- **Tính sẵn sàng:** Sẵn sàng đưa vào vận hành thực tế cho nhóm Quản trị viên của Hệ thống Quản Lý Tuyển Dụng Tích Hợp AI.
