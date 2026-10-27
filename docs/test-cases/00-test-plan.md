# KẾ HOẠCH KIỂM THỬ TỔNG THỂ (MASTER TEST PLAN)
## DỰ ÁN: HỆ THỐNG QUẢN LÝ TUYỂN DỤNG CÓ TÍCH HỢP AI (v2.0.0)

---

### 1. MỤC TIÊU VÀ ĐỐI TƯỢNG KIỂM THỬ

#### 1.1. Mục tiêu kiểm thử
1. Đảm bảo toàn bộ 10 phân hệ chức năng nghiệp vụ (F01 - F10, F14) và các dịch vụ AI (F11 - F13) hoạt động chính xác, ổn định và tuân thủ các quy tắc thiết kế hệ thống.
2. Xác minh tính toàn vẹn của cơ chế **Phân quyền RBAC (Role-Based Access Control)**:
   - Quản trị viên (ADMIN): Toàn quyền quản trị, phân quyền, cấu hình phòng ban, duyệt khoản chi và hỏi đáp Safe Text-to-SQL.
   - Chuyên viên tuyển dụng (RECRUITER): Chỉ thao tác trên các tin tuyển dụng và hồ sơ thuộc phạm vi phụ trách (Scope-based Access Control), không thể truy cập trái phép module quản trị tài khoản.
   - Ứng viên (CANDIDATE): Chỉ xem được thông tin cá nhân, CV và trạng thái các đơn ứng tuyển của chính mình; không thể truy cập dữ liệu ứng viên khác.
3. Đảm bảo nguyên tắc an toàn AI cốt lõi:
   - **Human-in-the-loop**: AI chỉ là công cụ hỗ trợ chấm điểm và đề xuất (Copilot), **tuyệt đối không được tự ý thay đổi trạng thái tuyển dụng** của ứng viên.
   - **Anti-Hallucination**: Chống ảo giác bằng kỹ thuật RAG Grounding, bóc tách kỹ năng thực tế có trong văn bản CV, không tự suy diễn kỹ năng bịa đặt.
   - **Safe Text-to-SQL**: Sandbox 3 lớp (Read-only SELECT, Regex Whitelist, Parameterized queries, Limit 100 bản ghi), chặn đứng 100% tấn công SQL Injection và rò rỉ mật khẩu.
   - **Prompt Injection Defense**: Chặn các câu lệnh độc hại nhúng trong câu hỏi hoặc trong nội dung tệp CV nhằm vượt qua các quy tắc hệ thống.
4. Đảm bảo quy trình chuyển trạng thái tuần tự của hồ sơ ứng tuyển:
   - `MOI` &rarr; `DANG_PHONG_VAN` &rarr; `DAT` hoặc `KHONG_DAT`.
   - Ngăn chặn triệt để hành vi nhảy cóc quy trình (ví dụ: từ `MOI` lên thẳng `DAT`).
   - Ngăn chặn nộp trùng hồ sơ (Anti-duplicate application: 1 ứng viên chỉ được nộp 1 lượt trên 1 tin tuyển dụng còn mở).

#### 1.2. Đối tượng kiểm thử (System Under Test - SUT)
* **Backend API Layer**: Toàn bộ các API RESTful xây dựng bằng Node.js / Express.js (`src/controllers/`, `src/routes/api.js`).
* **Service & AI Layer**: Lớp dịch vụ `DichVuAI.js`, `DichVuEmail.js`, `ocrParser.js`.
* **Database & Persistence Layer**: Mô hình 17 thực thể quan hệ chuẩn 3NF (MySQL 8.0 / In-memory Store fallback bền vững `store_data.json`).
* **Frontend Web Application**: 3 giao diện Dashboard tương tác trực tiếp (`admin.html`, `recruiter.html`, `candidate.html`).

---

### 2. PHẠM VI KIỂM THỬ (SCOPE)

#### 2.1. Trong phạm vi kiểm thử (In-Scope)
* **Xác thực & Quản lý phiên (Authentication)**: Đăng nhập (Email/Username), Đăng ký tài khoản ứng viên, JWT Token, Quản lý tài khoản bị khóa.
* **Quản trị người dùng & Phân quyền (Account & RBAC Management)**: Thêm mới tài khoản, phân quyền vai trò (Role Assignment), khóa/mở khóa tài khoản, xóa mềm tài khoản.
* **Quản lý danh mục & Tin tuyển dụng (Job Management)**: Quản lý phòng ban, quản lý vị trí (vòng đời trạng thái `MO`, `DONG`, `DA_LAP_DAY`), quản lý tin đăng, đóng tin tuyển dụng, kiểm soát phạm vi phụ trách của Recruiter.
* **Hồ sơ ứng viên & Quản lý tệp CV (Candidate CV & OCR)**: Tải lên tệp CV (giới hạn $\le 10\text{ MiB}$, định dạng PDF/DOCX), bóc tách nội dung văn bản qua OCR parser, quản lý phiên bản CV.
* **Ứng tuyển & Quản lý hồ sơ ứng tuyển (Applications)**: Nộp hồ sơ trực tuyến, kiểm tra chống nộp trùng (409 Conflict), ma trận chuyển trạng thái tuần tự, lưu vết nhật ký `SuKienTrangThai`.
* **Phỏng vấn & Đánh giá năng lực (Interviews & Reviews)**: Lên lịch phỏng vấn (tự động chuyển trạng thái sang `DANG_PHONG_VAN`), gửi email mời, chấm điểm đánh giá 3 tiêu chí (Chuyên môn, Kỹ năng mềm, Văn hóa: thang điểm 1-10).
* **Nguồn tuyển dụng & Talent Pool (Sources & Talent Pool)**: Quản lý kênh tuyển dụng (LinkedIn, TopCV, Facebook...), lưu trữ hồ sơ tiềm năng.
* **Thông báo & Dịch vụ gửi Email (Notifications & Email Service)**: Quản lý vòng đời trạng thái email (`CHO_GUI` &rarr; `DA_GUI` hoặc `LOI`), lưu vết lỗi kết nối, đánh dấu đã đọc.
* **Báo cáo & Quản lý chi phí (Reports & Expenses)**: Báo cáo tỷ lệ chuyển đổi phễu tuyển dụng, phân bổ trạng thái, tính chi phí trung bình trên mỗi tuyển dụng thành công (Cost per Hire), quản lý khoản chi (KhoanChi CRUD).
* **Trí tuệ nhân tạo (AI Services)**:
  * Safe Text-to-SQL dành cho Quản trị viên (Admin AI).
  * Đối sánh CV-JD không suy diễn (`DOI_SANH`), gợi ý câu hỏi phỏng vấn (`CAU_HOI`), sinh báo cáo hiệu suất tuyển dụng (`BAO_CAO`).
  * Trợ lý ảo tư vấn nghề nghiệp dành cho Ứng viên (Candidate AI Career Assistant).

#### 2.2. Ngoài phạm vi kiểm thử (Out-of-Scope)
* Tích hợp cổng thanh toán trực tuyến của bên thứ ba (VNPay, Stripe) do hệ thống tuyển dụng nội bộ không thu phí ứng viên.
* Tích hợp tổng đài VoIP tự động gọi điện cho ứng viên.
* Kiểm thử phần cứng quét vân tay hoặc nhận diện khuôn mặt tại cửa văn phòng.

---

### 3. MÔI TRƯỜNG KIỂM THỬ (TEST ENVIRONMENT)

| Thành Phần | Cấu Hình Kiểm Thử Thực Tế | Ghi Chú |
| :--- | :--- | :--- |
| **Hệ Điều Hành** | Windows 11 Pro 64-bit / Linux Ubuntu 22.04 LTS | Môi trường máy chủ và Docker container |
| **Runtime Engine** | Node.js v20.x LTS / Express.js 4.19.2 | Môi trường thực thi chính |
| **Cơ Sở Dữ Liệu** | MySQL 8.0.36 Community / In-memory Store fallback | Hỗ trợ 17 bảng quan hệ chuẩn 3NF, UUID, Soft-delete |
| **Dịch Vụ AI** | Google Gemini API / Module DichVuAI Engine | Tích hợp quy tắc RAG Grounding & Prompt Guardrails |
| **Trình Duyệt Thử Nghiệm** | Google Chrome 129+, Microsoft Edge 129+, Mozilla Firefox 131+ | Kiểm thử giao diện Web Responsive |
| **Công Cụ Kiểm Thử** | `node:test`, `supertest`, Postman v11, OWASP ZAP | Test runner tự động và công cụ thủ công |

---

### 4. CÁC VAI TRÒ NGƯỜI DÙNG (USER ROLES & PERSONAS)

1. **Quản Trị Viên (ADMIN)**:
   - *Tài khoản đại diện:* `admin` / `MatKhau@123`
   - *Quyền hạn:* Toàn quyền hệ thống, xem bảng KPI tổng thể, quản trị phòng ban, phân quyền người dùng, phê duyệt khoản chi, sử dụng công cụ Safe Text-to-SQL hỏi đáp dữ liệu.
2. **Chuyên Viên Tuyển Dụng (RECRUITER)**:
   - *Tài khoản đại diện:* `recruiter_linh` / `MatKhau@123`
   - *Quyền hạn:* Đăng và quản lý tin tuyển dụng thuộc phạm vi phụ trách (`nguoi_phu_trach_id`), sử dụng AI Đối sánh CV, gợi ý câu hỏi phỏng vấn, lên lịch phỏng vấn và cập nhật trạng thái hồ sơ tuần tự.
3. **Ứng Viên Tuyển Dụng (CANDIDATE)**:
   - *Tài khoản đại diện:* `candidate_an` / `MatKhau@123`
   - *Quyền hạn:* Tra cứu tin tuyển dụng mở, nộp hồ sơ, upload tệp CV, theo dõi trạng thái đơn ứng tuyển của chính mình, tương tác với AI Trợ lý nghề nghiệp 24/7.
4. **Người Dùng Chưa Xác Thực (UNAUTHENTICATED / GUEST)**:
   - *Quyền hạn:* Chỉ được phép xem danh sách tin tuyển dụng đang mở (`DANG_TUYEN`), đăng ký tài khoản mới và đăng nhập. Mọi API nghiệp vụ khác đều bị chặn với mã `401 Unauthorized`.

---

### 5. CHIẾN LƯỢC VÀ CÁC CẤP ĐỘ KIỂM THỬ

```
┌──────────────────────────────────────────────────────────────┐
│                    GIAO DIỆN NGƯỜI DÙNG                      │
│      UI/UX Testing, Responsive, Cross-browser (Manual)       │
├──────────────────────────────────────────────────────────────┤
│               PHÂN HỆ TRÍ TUỆ NHÂN TẠO (AI)                  │
│   Safe Text-to-SQL, RAG CV Matching, Prompt Injection Tests  │
├──────────────────────────────────────────────────────────────┤
│                 KIỂM THỬ TÍCH HỢP (INTEGRATION)              │
│       Toàn trình quy trình: Nộp đơn -> Phỏng vấn -> Duyệt    │
├──────────────────────────────────────────────────────────────┤
│                  KIỂM THỬ ĐƠN VỊ (UNIT TESTING)              │
│      Validation, Controllers, Services, RBAC, Database Store │
└──────────────────────────────────────────────────────────────┘
```

1. **Kiểm thử đơn vị (Unit Testing)**:
   - Kiểm tra độc lập từng hàm nghiệp vụ, middleware xác thực, phân quyền vai trò, hàm bóc tách text CV, logic tạo mã UUID và lưu vết `SuKienTrangThai`.
2. **Kiểm thử tích hợp (Integration Testing)**:
   - Kiểm tra luồng tuần tự toàn trình của một đợt tuyển dụng: Ứng viên nộp đơn &rarr; AI tính điểm đối sánh sơ bộ &rarr; Recruiter lên lịch phỏng vấn &rarr; Gửi email thông báo &rarr; Đánh giá phỏng vấn &rarr; Ra quyết định `DAT` hoặc `KHONG_DAT`.
3. **Kiểm thử Trí tuệ Nhân tạo & Bảo mật AI (AI & Safety Testing)**:
   - Kiểm tra 15 kịch bản chính thức và 45 biến thể câu hỏi của Admin AI Safe Text-to-SQL.
   - Kiểm tra 15 kịch bản chính thức và 45 biến thể câu hỏi của Candidate AI Career Assistant.
   - Kiểm thử phòng chống tấn công Prompt Injection (cả Direct Injection và Indirect Injection nhúng trong tệp CV).
   - Kiểm thử phòng chống rò rỉ dữ liệu nhạy cảm (mật khẩu, hash, token, OTP, thông tin cá nhân ứng viên khác).
4. **Kiểm thử Bảo mật hệ thống (Security Testing)**:
   - Kiểm tra SQL Injection qua các tham số truy vấn và đầu vào chatbot.
   - Kiểm tra Broken Object Level Authorization (BOLA / IDOR): Ứng viên cố gắng xem hoặc sửa đơn của ứng viên khác.
   - Kiểm tra leo thang quyền hạn (Privilege Escalation): Recruiter hoặc Candidate cố gắng gọi API cấp quyền của Admin.
5. **Kiểm thử Hồi quy (Regression Testing)**:
   - Đảm bảo khi bổ sung chức năng mới (như quản lý khoản chi hoặc tài khoản), các chức năng hiện có không bị lỗi hoặc suy giảm hiệu năng.

---

### 6. TIÊU CHÍ BẮT ĐẦU VÀ KẾT THÚC (ENTRY & EXIT CRITERIA)

#### 6.1. Tiêu chí bắt đầu (Entry Criteria)
* Mã nguồn đã được build thành công, không có lỗi cú pháp hoặc crash server.
* Cơ sở dữ liệu (hoặc In-memory Store) đã nạp đầy đủ dữ liệu khởi tạo (seed data) cho 17 thực thể.
* Tài liệu yêu cầu chức năng (FR01-FR15), mô tả API và môi trường kiểm thử đã sẵn sàng.

#### 6.2. Tiêu chí kết thúc và Nghiệm thu (Exit Criteria)
1. **100% Test Case mức P0 (Critical) và P1 (High) phải đạt trạng thái PASSED**.
2. **Không có bất kỳ lỗi bảo mật nghiêm trọng (Blocker/Critical)** nào còn tồn đọng (như rò rỉ mật khẩu, bypass phân quyền RBAC, SQL Injection).
3. **Bộ test tự động thực thi đạt tỷ lệ 100% Pass** trên test runner `npm test`.
4. Toàn bộ các chức năng đã có bảng Test Case chi tiết và ma trận truy vết (RTM) hoàn chỉnh.

---

### 7. QUY TRÌNH QUẢN LÝ VÀ PHÂN LOẠI LỖI (DEFECT LIFECYCLE)

Quy trình xử lý lỗi tuân thủ 6 giai đoạn chuẩn quốc tế:
```
[New] ──> [Assigned] ──> [In Progress] ──> [Fixed] ──> [Retest] ──> [Closed]
                                                           │
                                                           └── (Fail) ──> [Reopened]
```

* **Mức độ nghiêm trọng (Severity):**
  - **Critical / Blocker**: Hệ thống sập, rò rỉ thông tin xác thực, nhảy cóc quy trình tuyển dụng, nộp trùng đơn thành công, AI tự động thay đổi trạng thái tuyển dụng.
  - **Major**: Chức năng nghiệp vụ chính không hoạt động đúng kỳ vọng, dữ liệu tính toán sai lệch, lỗi phân quyền phạm vi của Recruiter.
  - **Minor**: Lỗi validation dữ liệu đầu vào, thông báo lỗi chưa rõ ràng, lỗi định dạng ngày tháng hoặc tiền tệ.
  - **Trivial**: Lỗi chính tả trên giao diện, căn chỉnh CSS nhẹ, cải thiện trải nghiệm hiển thị.
