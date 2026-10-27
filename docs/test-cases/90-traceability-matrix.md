# MA TRẬN TRUY VẾT YÊU CẦU VÀ KIỂM THỬ (REQUIREMENTS TRACEABILITY MATRIX - RTM)

---

### 1. MỤC TIÊU MA TRẬN TRUY VẾT
Tài liệu **Requirements Traceability Matrix (RTM)** thiết lập mối liên kết hai chiều (Bi-directional Traceability) chặt chẽ giữa:
1. **Yêu cầu nghiệp vụ (Business Requirements & User Stories)**
2. **Thực thể CSDL & Endpoint API Backend**
3. **Mã Test Case tương ứng (Test Case IDs)**
4. **Kết quả xác minh cốt lõi (Verification Criteria)**

Ma trận này đảm bảo 100% các chức năng cốt lõi (FR01 - FR15) và các yêu cầu phi chức năng (NFR01 - NFR08) đều được bao phủ bởi các kịch bản kiểm thử độc lập, có thể thực thi và đánh giá kết quả rõ ràng.

---

### 2. BẢNG MA TRẬN TRUY VẾT CHI TIẾT (FR01 - FR15 & NFR)

| Mã Yêu Cầu | Tên Chức Năng / Nghiệp Vụ | Thực Thể CSDL | Express API Endpoint | Test Case IDs Bao Phủ | Kết Quả Mong Đợi Cốt Lõi |
| :---: | :--- | :--- | :--- | :--- | :--- |
| **FR01** | Xác thực & Quản lý phiên đăng nhập | `TaiKhoan` | `POST /api/auth/dang-nhap`<br>`POST /api/auth/dang-ky`<br>`POST /api/auth/dang-xuat`<br>`GET /api/auth/ho-so` | `TC-AUTH-001` đến `TC-AUTH-018` (18 TCs) | Đăng nhập trả về JWT; bảo mật bcrypt salt=10; chặn tài khoản bị khóa (403); bảo vệ endpoint bằng Bearer token. |
| **FR02** | Quản lý Cơ cấu Tổ chức & Phòng ban | `PhongBan` | `GET /api/phong-ban`<br>`POST /api/phong-ban`<br>`PUT /api/phong-ban/:id`<br>`DELETE /api/phong-ban/:id` | `TC-JOB-001`, `TC-JOB-002`, `TC-JOB-003`, `TC-JOB-004` (4 TCs) | Quản lý cây phòng ban; mã phòng ban duy nhất; soft-delete; ràng buộc khóa ngoại khi còn vị trí hoạt động. |
| **FR03** | Quản lý Vị trí Tuyển dụng & Tin đăng | `ViTriTuyenDung`<br>`TinTuyenDung` | `GET /api/tin-tuyen-dung`<br>`POST /api/tin-tuyen-dung`<br>`PUT /api/tin-tuyen-dung/:id`<br>`DELETE /api/tin-tuyen-dung/:id` | `TC-JOB-005` đến `TC-JOB-018` (14 TCs) | Vòng đời tin (`DANG_TUYEN`, `DONG`); hạn nộp phải lớn hơn hiện tại; chặn nộp vào tin đã đóng; phân quyền Scope Recruiter. |
| **FR04** | Tiếp nhận & Xử lý Hồ sơ CV (OCR) | `UngVien`<br>`HoSoCV` | `POST /api/ho-so-cv/upload`<br>`GET /api/ho-so-cv/:id`<br>`GET /api/ho-so-cv/tai-ve/:id` | `TC-CV-001` đến `TC-CV-016` (16 TCs) | Upload PDF/DOCX $\le 10\text{MB}$; OCR trích xuất $\le 100.000$ ký tự; tự động nâng phiên bản v1 $\to$ v2; chặn path traversal. |
| **FR05** | Nộp Hồ sơ Ứng tuyển & Chống trùng | `LuotUngTuyen` | `POST /api/ung-tuyen`<br>`GET /api/ung-tuyen/cua-toi` | `TC-APP-001` đến `TC-APP-006` (6 TCs) | Khởi tạo đơn trạng thái `MOI`; chặn nộp trùng cùng vị trí (409 Conflict); 1 ứng viên nộp được nhiều vị trí khác nhau. |
| **FR06** | Quy trình Tuyển dụng Tuần tự (Pipeline) | `LuotUngTuyen`<br>`SuKienTrangThai` | `PUT /api/ung-tuyen/:id/trang-thai`<br>`GET /api/ung-tuyen`<br>`GET /api/ung-tuyen/:id` | `TC-APP-007` đến `TC-APP-020` (14 TCs) | Chuyển trạng thái nghiêm ngặt (`MOI` $\to$ `DANG_PHONG_VAN` $\to$ `DAT`/`KHONG_DAT`); chặn nhảy cóc (400); lưu audit trail 100%. |
| **FR07** | Lên Lịch & Điều phối Phỏng vấn | `LichPhongVan` | `POST /api/lich-phong-van`<br>`GET /api/lich-phong-van`<br>`PUT /api/lich-phong-van/:id`<br>`DELETE /api/lich-phong-van/:id` | `TC-INT-001` đến `TC-INT-009` (9 TCs) | Lập lịch tự động chuyển đơn sang `DANG_PHONG_VAN`; gửi email thông báo; xác thực thời gian tương lai; cập nhật/hủy lịch. |
| **FR08** | Đánh giá Phỏng vấn Đa tiêu chí | `DanhGiaPhongVan` | `POST /api/danh-gia-phong-van`<br>`GET /api/danh-gia-phong-van/:id` | `TC-INT-010` đến `TC-INT-016` (7 TCs) | Đánh giá 3 tiêu chí thang điểm 1-10; tự động tính điểm trung bình; bắt buộc kèm nhận xét định tính; chặn sửa trái phép. |
| **FR09** | Hệ thống Thông báo & Email Tự động | `ThongBao` | `GET /api/thong-bao`<br>`PUT /api/thong-bao/:id/doc`<br>`PUT /api/thong-bao/doc-tat-ca` | `TC-NOTI-001` đến `TC-NOTI-014` (14 TCs) | Vòng đời email (`CHO_GUI` $\to$ `DA_GUI`/`LOI`); lưu vết `chi_tiet_loi`; đánh dấu đã đọc; chống rò rỉ thông báo ứng viên khác. |
| **FR10** | Báo cáo & Thống kê Hiệu suất & Khoản Chi | `BaoCaoTuyenDung`<br>`KhoanChi` | `GET /api/bao-cao/tong-quan`<br>`GET /api/khoan-chi`<br>`POST /api/khoan-chi`<br>`DELETE /api/khoan-chi/:id` | `TC-REPORT-001` đến `TC-REPORT-018` (18 TCs) | Tính chính xác tỷ lệ chuyển đổi, Cost per Hire; CRUD khoản chi; soft-delete; cập nhật động KPI; xử lý an toàn mẫu số bằng 0. |
| **FR11** | AI Phân tích CV & Gợi ý Câu hỏi | `KetQuaAI` | `POST /api/ai/doi-sanh`<br>`POST /api/ai/goi-y-cau-hoi` | `TC-AI-EMP-001` đến `TC-AI-EMP-007`, `TC-AI-EMP-014` đến `018` (12 TCs) | RAG Grounding không ảo giác; tính điểm 0-100; gợi ý 3 nhóm câu hỏi; AI KHÔNG tự đổi trạng thái; validate `kiemTraHopLe()`. |
| **FR12** | AI Safe Text-to-SQL cho Quản trị viên | `KetQuaAI` | `POST /api/ai/hoi-dap` | `TC-AI-ADMIN-001` đến `TC-AI-ADMIN-022` (22 TCs) | Text-to-SQL 3 lớp an toàn; chặn DROP/DELETE/UPDATE; từ chối lộ mật khẩu/OTP; chống Prompt Injection; chống thiên kiến tuyển dụng. |
| **FR13** | AI Sinh Báo cáo Tuyển dụng Thông minh | `KetQuaAI` | `POST /api/ai/sinh-bao-cao` | `TC-AI-EMP-008`, `TC-AI-EMP-009`, `TC-REPORT-017` (3 TCs) | Phân tích tự động phễu tuyển dụng; khuyến nghị hành động tối ưu chi phí; xử lý an toàn khi hệ thống có 0 đơn nộp. |
| **FR14** | Quản trị Tài khoản Người dùng | `TaiKhoan` | `GET /api/tai-khoan`<br>`POST /api/tai-khoan`<br>`PUT /api/tai-khoan/:id`<br>`DELETE /api/tai-khoan/:id`<br>`PUT /api/tai-khoan/:id/khoa` | `TC-USER-001` đến `TC-USER-016` (16 TCs) | Admin CRUD tài khoản; tìm kiếm, lọc vai trò; khóa/mở khóa; chống tự khóa và chống tự xóa tài khoản Admin đang login. |
| **FR15** | Phân quyền RBAC & Ngăn chặn Leo quyền | `TaiKhoan` | Toàn bộ Router với `authorizeRoles` & `checkRecruiterScope` | `TC-RBAC-001` đến `TC-RBAC-016` (16 TCs) | 3 vai trò (ADMIN, RECRUITER, CANDIDATE); kế thừa quyền; kiểm soát Recruiter Scope; ngăn chặn Privilege Escalation & Token tampering. |
| **FR-AI-CAND** | Trợ lý AI Hỏi đáp & Tư vấn Ứng viên | `TinTuyenDung`<br>`LuotUngTuyen`<br>`LichPhongVan` | `POST /api/ai/tro-ly-ung-vien` | `TC-AI-CAND-001` đến `TC-AI-CAND-022` (22 TCs) | Tìm việc, tư vấn CV chuẩn STAR; tra cứu lịch PV/hồ sơ cá nhân; bảo vệ dữ liệu cá nhân (NĐ 13/2023); chặn Prompt Injection. |
| **NFR-SEC** | Bảo mật Toàn diện Hệ thống | Toàn bộ thực thể | Toàn bộ API Endpoints | Bao phủ trong các TC Security của từng module (Tổng cộng 46 TCs Security) | Chống SQLi, XSS, Path Traversal, BOLA/IDOR, Brute Force, rò rỉ credential và thao túng tham số. |
| **NFR-PERF** | Hiệu năng & Tốc độ Phản hồi | Toàn bộ thực thể | API Auth, Báo cáo, AI | `TC-AUTH-015`, `TC-CV-013`, `TC-REPORT-015`, `TC-AI-EMP-015`, `TC-AI-CAND-020` | Phản hồi API chuẩn $\le 200\text{ms}$; xử lý AI và trích xuất OCR $\le 1000\text{ms}$; không gây nghẽn Event Loop. |

---

### 3. ĐỐI CHIẾU THỰC THỂ CSDL VỚI CÁC BỘ TEST CASE

| Bảng Cơ Sở Dữ Liệu | Khóa Chính | Khóa Ngoại Phụ Thuộc | Module Quản Lý | Bộ Test Case Tương Ứng |
| :--- | :--- | :--- | :--- | :--- |
| `TaiKhoan` | `id` (UUID v4) | Không | Auth, User Management, RBAC | `TC-AUTH-*`, `TC-USER-*`, `TC-RBAC-*` |
| `UngVien` | `id` (UUID v4) | `tai_khoan_id` $\to$ `TaiKhoan.id` | Candidate Profile & CV | `TC-CV-*`, `TC-APP-*` |
| `PhongBan` | `id` (UUID v4) | Không | Job Management | `TC-JOB-001` - `TC-JOB-004` |
| `ViTriTuyenDung` | `id` (UUID v4) | `phong_ban_id` $\to$ `PhongBan.id` | Job Management | `TC-JOB-005` - `TC-JOB-008` |
| `TinTuyenDung` | `id` (UUID v4) | `vi_tri_id`, `nguoi_tao_id` | Job Management | `TC-JOB-009` - `TC-JOB-018` |
| `HoSoCV` | `id` (UUID v4) | `ung_vien_id` $\to$ `UngVien.id` | Candidate Profile & CV | `TC-CV-001` - `TC-CV-016` |
| `LuotUngTuyen` | `id` (UUID v4) | `ung_vien_id`, `tin_tuyen_dung_id`, `ho_so_cv_id` | Applications | `TC-APP-001` - `TC-APP-020` |
| `SuKienTrangThai` | `id` (UUID v4) | `luot_ung_tuyen_id`, `nguoi_thuc_hien_id` | Applications Audit | `TC-APP-014`, `TC-APP-015` |
| `LichPhongVan` | `id` (UUID v4) | `luot_ung_tuyen_id`, `nguoi_tao_id` | Interviews | `TC-INT-001` - `TC-INT-009` |
| `DanhGiaPhongVan`| `id` (UUID v4) | `lich_phong_van_id`, `nguoi_danh_gia_id`| Evaluations | `TC-INT-010` - `TC-INT-016` |
| `ThongBao` | `id` (UUID v4) | `nguoi_nhan_id`, `luot_ung_tuyen_id` | Notifications | `TC-NOTI-001` - `TC-NOTI-014` |
| `BaoCaoTuyenDung`| `id` (UUID v4) | `nguoi_tao_id` $\to$ `TaiKhoan.id` | Reports & Stats | `TC-REPORT-001` - `TC-REPORT-009` |
| `KhoanChi` | `id` (UUID v4) | `tin_tuyen_dung_id`, `nguoi_tao_id` | Reports & Expenses | `TC-REPORT-010` - `TC-REPORT-018` |
| `KetQuaAI` | `id` (UUID v4) | `luot_ung_tuyen_id`, `ho_so_cv_id` | AI Services | `TC-AI-ADMIN-*`, `TC-AI-EMP-*` |

---

### 4. KẾT LUẬN VỀ TÍNH TRUY VẾT
- **100% Chức năng nghiệp vụ (FR01 - FR15)** đều có các Test Case bao phủ chi tiết.
- Không tồn tại chức năng "mồ côi" (Orphan feature - chức năng có code nhưng không có test case).
- Không tồn tại test case "ảo" (Phantom test case - test case viết cho chức năng không tồn tại trong repository).
