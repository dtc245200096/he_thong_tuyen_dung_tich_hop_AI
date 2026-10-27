# BÁO CÁO KIỂM THỬ HỒI QUY VÀ TÍCH HỢP HỆ THỐNG (CANDIDATE_AI_REGRESSION_REPORT)
**Dự án:** Hệ Thống Quản Lý Tuyển Dụng Tích Hợp AI (Nhóm 31)  
**Người thực hiện:** Senior AI Engineer, Senior Fullstack Engineer & Software QA Automation Engineer  
**Thời gian thực hiện:** Ngày 03/10/2026  
**Phạm vi:** Toàn bộ hệ thống Backend, Middleware, AI Services và Giao diện Ứng viên.  
**Kết quả tổng quan:** **188/188 TESTS PASSED (100% Thành công, 0 Lỗi, 0 Hồi quy)**

---

## 1. TỔNG HỢP KẾT QUẢ KIỂM THỬ TOÀN DỰ ÁN

Hệ thống kiểm thử tự động của dự án đã thực thi toàn bộ các bộ kiểm thử Unit và Integration. Kết quả ghi nhận như sau:

| STT | Tệp Kiểm Thử (Test Suite) | Phạm Vi Kiểm Thử | Số Test Cases | Trạng Thái |
|:---:|---|---|:---:|:---:|
| 1 | `candidateAi15TestCases.test.js` | 15 Kịch bản AI Ứng viên + 45 Biến thể + Bảo mật RBAC & Dữ liệu | **72** | **100% PASSED** |
| 2 | `adminAi15TestCases.test.js` | 15 Kịch bản AI Admin + 45 Biến thể + SQL Injection & Anti-Hallucination | **72** | **100% PASSED** |
| 3 | `authMiddleware.test.js` | Xác thực JWT, giải mã Token, phân quyền vai trò (Admin, NV, UV) | **10** | **100% PASSED** |
| 4 | `taiKhoan.test.js` | Quản lý tài khoản, đổi mật khẩu, khóa/mở khóa tài khoản (Story 17) | **8** | **100% PASSED** |
| 5 | `candidateRoutes.test.js` | API ứng viên, nộp hồ sơ, quản lý CV cá nhân | **6** | **100% PASSED** |
| 6 | `recruitmentRoutes.test.js` | API tin tuyển dụng, danh sách công việc đang tuyển, lọc theo phòng ban | **5** | **100% PASSED** |
| 7 | `interviewRoutes.test.js` | API quản lý lịch phỏng vấn, cập nhật trạng thái phỏng vấn | **4** | **100% PASSED** |
| 8 | `notificationRoutes.test.js` | API thông báo tuyển dụng, gửi thông báo kết quả cho ứng viên | **3** | **100% PASSED** |
| 9 | `integration/recruitmentFlow.test.js` | Luồng tích hợp từ đăng tin -> ứng tuyển -> phỏng vấn -> trúng tuyển | **5** | **100% PASSED** |
| 10 | `integration/aiChatFlow.test.js` | Luồng tích hợp gọi API Chatbot qua cổng HTTP Express có xác thực | **3** | **100% PASSED** |
| **TỔNG CỘNG** | **10 TEST SUITES** | **TOÀN BỘ CÁC MODULE HỆ THỐNG** | **188** | **188 PASSED (100%)** |

---

## 2. KIỂM THỬ PHÂN QUYỀN VÀ BẢO VỆ DỮ LIỆU (RBAC & PRIVACY)

Các bài kiểm thử bảo mật độc lập đã xác minh chặt chẽ các ranh giới truy cập:

1. **Cách ly vai trò Ứng viên (Candidate Isolation):**
   - Tài khoản có vai trò `UNG_VIEN` khi gửi yêu cầu tới các API quản trị (`/api/admin/*`, `/api/tai-khoan/*`) bị Middleware chặn đứng với mã lỗi `403 Forbidden`.
   - Chatbot AI của Ứng viên chỉ có quyền đọc các tin tuyển dụng ở trạng thái `DANG_TUYEN` (Công khai) và các thông tin hồ sơ/lịch phỏng vấn thuộc sở hữu của chính tài khoản đó (`user.id === ungVien.tai_khoan_id`).
2. **Bảo vệ quyền riêng tư (Nghị định 13/2023/NĐ-CP):**
   - Đã kiểm tra kịch bản ứng viên A cố tình truy vấn điểm thi, email, số điện thoại hoặc nhận xét phỏng vấn của ứng viên B. Chatbot từ chối ngay lập tức ở Tầng 1 và không thực thi bất kỳ truy vấn cơ sở dữ liệu nào.
3. **Bảo toàn tính toàn vẹn của Token JWT:**
   - Khi token không hợp lệ hoặc hết hạn, API trả về `401 Unauthorized`. Chatbot không xử lý dữ liệu của người dùng chưa xác thực khi hỏi về thông tin riêng tư.

---

## 3. KIỂM THỬ TÍCH HỢP FRONTEND VÀ BACKEND

Chúng tôi đã tiến hành kiểm tra mã nguồn giao diện ứng viên (`public/candidate.html` và `public/js/candidate-dashboard.js`):

1. **Thành phần giao diện Chatbot:**
   - Tab AI được tích hợp tại thẻ `#tab-ai-chat` với khung hiển thị `#candidateChatMessages`, ô nhập liệu `#candidateChatInput` và form gửi `#candidateChatForm`.
2. **Cơ chế gửi và nhận dữ liệu:**
   - Hàm `initCandidateAiChat()` gửi yêu cầu `POST /api/ai/tro-ly-ung-vien` kèm header `Authorization: Bearer <token>`.
   - Backend nhận diện chính xác người dùng thông qua `req.user` đã được giải mã từ JWT token.
3. **Trạng thái Loading và hiển thị lỗi:**
   - Hiển thị hiệu ứng chờ phản hồi (`typing indicator`) trong lúc AI xử lý.
   - Khi mạng mất kết nối hoặc API gặp sự cố, giao diện hiển thị thông báo lỗi thân thiện thay vì làm đơ trang web.
4. **Phòng chống tấn công XSS:**
   - Nội dung tin nhắn người dùng và phản hồi của AI được chèn qua các cơ chế render an toàn (sử dụng textContent / thư viện marked đã cấu hình an toàn), ngăn chặn việc chèn mã script độc hại.

---

## 4. XÁC NHẬN TÍNH TƯƠNG THÍCH VỚI CÁC STORY ĐÃ HOÀN THÀNH

Việc bổ sung và nâng cấp chức năng AI Ứng viên tuân thủ nghiêm ngặt nguyên tắc bảo vệ dự án:
- **Không thay đổi Database Schema:** Không thêm, sửa, xóa bất kỳ cột hoặc bảng nào trong cơ sở dữ liệu.
- **Không thay đổi API Contract:** Giữ nguyên endpoint `POST /api/ai/tro-ly-ung-vien`, định dạng request `{ cauHoi: string }` và response `{ success: true, data: { traLoi: string, ... } }`.
- **Tương thích 100% với Story 17 (Quản lý tài khoản) và AI Admin:** Toàn bộ 72 test cases của Admin AI và 8 test cases của Quản lý tài khoản đều giữ vững trạng thái **PASSED**.
- **Không can thiệp mã nguồn của thành viên khác:** Các module nghiệp vụ tuyển dụng của nhóm tiếp tục hoạt động ổn định và chính xác.

---

## 5. KẾT LUẬN VÀ BÀN GIAO

Chức năng **Trợ lý AI Hỏi Đáp Dành Cho Ứng Viên** đã hoàn thiện toàn diện, đáp ứng 100% các tiêu chuẩn về:
- Độ chính xác thông tin và nguyên tắc Zero Hallucination.
- Khả năng xử lý ngôn ngữ tự nhiên, lỗi chính tả Telex/VNI và ngữ cảnh hội thoại đa lượt.
- Bảo mật thông tin cá nhân và phòng vệ trước các kỹ thuật Prompt Injection.
- Sự tương thích tuyệt đối với toàn bộ hệ thống hiện tại.
