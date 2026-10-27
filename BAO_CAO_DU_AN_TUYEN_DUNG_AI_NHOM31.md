# BÁO CÁO ĐỒ ÁN MÔN HỌC: ỨNG DỤNG TRÍ TUỆ NHÂN TẠO
## ĐỀ TÀI: HỆ THỐNG QUẢN LÝ TUYỂN DỤNG CÓ TÍCH HỢP AI (SMART RECRUITMENT MANAGEMENT SYSTEM)

---
**Đơn vị:** Khoa Công nghệ Thông tin - Trường Đại học Công nghệ Thông tin & Truyền thông  
**Lớp chuyên ngành:** CNTT K23B  
**Nhóm thực hiện:** Nhóm 31  
**Sinh viên thực hiện:**
- **HOÀNG TUẤN MINH** (Trưởng nhóm - Backend, Database & Test Architect)
- **DƯƠNG NAM PHONG** (Thành viên - AI Engineer & System Analyst)  
**Giảng viên hướng dẫn:** [Chờ bổ sung]  
**Năm học:** 2025 - 2026  

---

# DANH MỤC TỪ VIẾT TẮT
| Từ viết tắt | Thuật ngữ tiếng Anh | Diễn giải ý nghĩa nghiệp vụ |
| :---: | :--- | :--- |
| **AI** | Artificial Intelligence | Trí tuệ nhân tạo |
| **ATS** | Applicant Tracking System | Hệ thống quản lý quy trình ứng tuyển và theo dõi ứng viên |
| **CV** | Curriculum Vitae | Hồ sơ năng lực và lý lịch nghề nghiệp của ứng viên |
| **JD** | Job Description | Bản mô tả chi tiết công việc và yêu cầu tuyển dụng |
| **RAG** | Retrieval-Augmented Generation | Kỹ thuật tăng cường truy xuất thông tin cho mô hình sinh AI |
| **RBAC** | Role-Based Access Control | Mô hình kiểm soát truy cập và phân quyền theo vai trò |
| **LLM** | Large Language Model | Mô hình ngôn ngữ lớn (Google Gemini, OpenAI GPT) |
| **Text-to-SQL** | Natural Language to SQL | Cơ chế chuyển đổi ngôn ngữ tự nhiên thành câu truy vấn CSDL |
| **JWT** | JSON Web Token | Chuẩn mã hóa thông tin xác thực phiên làm việc |
| **ERD** | Entity Relationship Diagram | Sơ đồ quan hệ thực thể cơ sở dữ liệu quan hệ |

---

# BẢNG ĐỐI CHIẾU CẤU TRÚC GIỮA ĐỀ TÀI THƯ VIỆN AI VÀ ĐỀ TÀI TUYỂN DỤNG AI

| Cấu trúc Báo cáo mẫu | Nghiệp vụ Hệ thống Thư viện AI (Tài liệu mẫu) | Nghiệp vụ Chuyển đổi: Hệ thống Tuyển dụng AI (Nhóm 31) |
| :--- | :--- | :--- |
| **Chương 1: Tổng quan & Kế hoạch** | Bối cảnh thư viện truyền thống, độc giả mượn/trả sách; Kế hoạch 9 tuần cho độc giả, thủ thư. | Bối cảnh khủng hoảng quá tải CV và khoảng cách sàng lọc kỹ năng (Matching Gap); Kế hoạch 9 tuần phân bổ cho 2 sinh viên (Hoàng Tuấn Minh, Dương Nam Phong). |
| **Chương 2: Khảo sát & Yêu cầu** | 20 câu hỏi về sách, thẻ thư viện, phiếu phạt; FR/NFR mượn trả; Phân rã chức năng thư viện. | 25 câu hỏi chuyên sâu về tuyển dụng, hồ sơ, phỏng vấn, bảo mật CV; FR01-FR15, NFR01-NFR08; Biểu đồ phân rã WBS phân hệ tuyển dụng và AI. |
| **Chương 3: Phân tích & Thiết kế** | 6 Use Case: Đăng nhập, Quản lý sách, Mượn/trả, Gợi ý sách, Semantic search, Chatbot. | 10 Use Case chuẩn ATS (UC001-UC010): Đăng nhập RBAC, Quản lý JD, Nộp CV, AI Trích xuất CV, AI Đối chiếu Matching, AI Chatbot, Lịch phỏng vấn, Đánh giá, Trạng thái, Báo cáo KPI. |
| **Quy trình nghiệp vụ cốt lõi** | Nhập sách → Tìm kiếm → Lập phiếu mượn → Trả sách → Phạt quá hạn. | Đăng tin → Nộp hồ sơ → AI Trích xuất & Chấm điểm sơ bộ → Sàng lọc → Phỏng vấn → Đánh giá hội đồng → Quyết định (DAT/KHONG_DAT) → Email tự động. |
| **Chương 4: Kiến trúc & AI** | OCR bìa sách, TF-IDF / Cosine gợi ý sách, Chatbot nội quy 24/7. | AI Trích xuất thực thể CV (Named Entity Recognition), Phân tích khoảng cách kỹ năng (Skill Gap Analysis), AI Matching CV-JD với điểm tương đồng, Safe Text-to-SQL 3 tầng. |
| **Tối ưu hóa Prompt** | 3 vòng lặp Prompt cho Chatbot thư viện (giảm bịa tầng sách, tiền phạt). | 3 vòng lặp Prompt cho AI Trích xuất CV & Đối chiếu JD (loại bỏ ảo giác suy diễn kỹ năng, áp đặt JSON Schema nghiêm ngặt và Confidence Score). |
| **Kiểm thử hệ thống** | Bộ Test Case mượn sách, phạt quá hạn và Chatbot thư viện. | 35/35 Automated Test Cases thực tế (Unit & Integration tests) của dự án, kiểm thử toàn diện Auth, Job, Candidate, Interview, AI Services đạt 100% Pass. |
| **Chương 5: Thiết kế CSDL** | 8 bảng: NGUOI_DUNG, SACH, PHIEU_MUON, DAT_TRUOC, DANH_MUC, TAC_GIA, NXB, LICH_SU_CHATBOT. | 17 bảng chuẩn 3NF: NGUOI_DUNG, VAI_TRO, QUYEN, VAI_TRO_QUYEN, UNG_VIEN, HO_SO, KY_NANG, HO_SO_KY_NANG, VI_TRI_TUYEN_DUNG, TIN_DANG, TIEU_CHI, LICH_PHONG_VAN, DANH_GIA, LICH_SU_TRANG_THAI, THONG_BAO, LICH_SU_CHATBOT, KET_QUA_PHAN_TICH_AI. |
| **Đặc tả API & Minh chứng** | API REST mượn trả FastAPI; Minh chứng AI sinh ERD sách. | Chuẩn RFC RESTful JSON API cho toàn bộ 5 phân hệ tuyển dụng; Minh chứng đối sánh mã nguồn thực tế Express.js, MySQL 8.0, Gemini API và Docker. |

---

# CHƯƠNG 1: TỔNG QUAN DỰ ÁN VÀ KẾ HOẠCH TRIỂN KHAI

## 1.1. Bối cảnh và thực trạng công tác tuyển dụng nhân sự
Trong thời đại số hóa, doanh nghiệp phải đối mặt với áp lực lớn trong tuyển dụng nhân tài:
1. **Quá tải hồ sơ (CV Overload):** Một tin tuyển dụng thu hút từ vài trăm đến hàng ngàn hồ sơ chỉ trong vài ngày.
2. **Nút thắt sàng lọc thủ công:** Chuyên viên nhân sự chỉ có 6–10 giây cho một CV, dễ dẫn đến mệt mỏi nhận thức và đánh giá cảm tính.
3. **Khoảng cách ngữ nghĩa (Semantic Gap):** CV và JD diễn đạt cùng kỹ năng theo các từ ngữ khác nhau, khiến bộ lọc từ khóa truyền thống loại bỏ nhầm ứng viên giỏi.
4. **Thiếu minh bạch:** Ít có hệ thống giải thích rõ nguyên nhân ứng viên chưa phù hợp để phục vụ phản hồi và nâng cao thương hiệu tuyển dụng.

## 1.2. Lý do lựa chọn đề tài
Nghiên cứu ứng dụng các mô hình ngôn ngữ lớn (LLM - Google Gemini) và kỹ thuật NLP hiện đại vào xây dựng Hệ thống Quản lý Tuyển dụng có tích hợp AI (Smart Recruitment Management System) nhằm tự động hóa quy trình bóc tách thông tin, chấm điểm độ phù hợp và phân tích kỹ năng thiếu một cách minh bạch, khách quan.

## 1.3. Mục tiêu nghiên cứu và phát triển
- **Mục tiêu tổng quát:** Xây dựng hệ thống ATS hoàn chỉnh tích hợp AI Copilot hỗ trợ doanh nghiệp tối ưu hóa 70% thời gian xử lý hồ sơ thủ công.
- **Mục tiêu cụ thể:**
  1. Quản lý toàn diện vòng đời tuyển dụng từ đăng tin đến ra quyết định tuyển dụng.
  2. Bóc tách thực thể CV và tính điểm Matching Score (thang 100) theo 4 trọng số khoa học.
  3. Tích hợp AI Chatbot 24/7 và cơ chế Safe Text-to-SQL 3 tầng bảo vệ.
  4. Vượt qua 100% các bài kiểm thử tự động (35/35 Test Cases Pass).

## 1.4. Vai trò của Trí tuệ Nhân tạo (AI) trong hệ thống
> **NGUYÊN TẮC CỐT LÕI VỀ VAI TRÒ CỦA AI:**  
> AI trong hệ thống đóng vai trò là **Trợ lý thông minh (AI Copilot)** hỗ trợ chuyên viên nhân sự ra quyết định, **tuyệt đối không tự động quyết định loại hay tuyển dụng ứng viên**. Quyền quyết định thuộc về con người (Human-in-the-loop).

## 1.5. Kế hoạch triển khai 9 tuần
| Tuần | Thời gian | Công việc cụ thể | Phụ trách | Sản phẩm bàn giao | Tiến độ |
| :---: | :---: | :--- | :--- | :--- | :---: |
| Tuần 1 | 27/07 - 02/08/2026 | Khảo sát bài toán, thu thập yêu cầu ATS, lập kế hoạch. | Minh, Phong | Tài liệu khảo sát & Yêu cầu | 100% |
| Tuần 2 | 03/08 - 09/08/2026 | Đặc tả FR, NFR, xây dựng Use Case và phân rã WBS. | Hoàng Tuấn Minh | Tài liệu SRS & Biểu đồ URM | 100% |
| Tuần 3 | 10/08 - 16/08/2026 | Thiết kế CSDL 17 thực thể (3NF), kiến trúc 4 tầng, API Specs. | Dương Nam Phong | Sơ đồ ERD, Data Dictionary, API | 100% |
| Tuần 4 | 17/08 - 23/08/2026 | Xây dựng Backend Express.js, Docker, module Auth JWT. | Hoàng Tuấn Minh | Source Core Backend, Auth RBAC | 100% |
| Tuần 5 | 24/08 - 30/08/2026 | Tích hợp Google Gemini API, thiết kế Prompt CV-JD. | Dương Nam Phong | DichVuAI.js, Prompt Templates | 100% |
| Tuần 6 | 31/08 - 06/09/2026 | Phát triển Controllers tuyển dụng, Multer upload, Email. | Hoàng Tuấn Minh | 11 Controllers, Email Service | 100% |
| Tuần 7 | 07/09 - 13/09/2026 | Xây dựng Safe Text-to-SQL 3 lớp, Chatbot Guardrails. | Dương Nam Phong | Text-to-SQL Sandbox, Chatbot | 100% |
| Tuần 8 | 14/09 - 20/09/2026 | Viết kịch bản kiểm thử, chạy 35 Unit & Integration tests. | Minh, Phong | Test suite 35/35 Pass (100%) | 100% |
| Tuần 9 | 21/09 - 27/09/2026 | Đóng gói sản phẩm, hoàn thiện báo cáo DOCX và nghiệm thu. | Minh, Phong | Báo cáo hoàn chỉnh & Mã nguồn | 100% |

---

# CHƯƠNG 2: KHẢO SÁT VÀ PHÂN TÍCH YÊU CẦU BÀI TOÁN

## 2.1. Khảo sát nghiệp vụ thực tế (Bộ 25 câu hỏi - trả lời chuyên sâu)
Hệ thống tổng hợp 25 câu hỏi chuẩn mực phân theo 10 phân hệ nghiệp vụ tuyển dụng (Xác thực, Phân quyền RBAC, Quản lý vị trí, Nộp hồ sơ, AI Trích xuất CV, AI Đối chiếu JD, Tìm kiếm hồ sơ, Quy trình phỏng vấn, Quyết định tuyển dụng, Bảo mật thông tin cá nhân).

## 2.2. Đặc tả yêu cầu
### Yêu cầu chức năng (FR01 - FR15)
- **FR01:** Đăng ký & Xác thực an toàn (Bcrypt, JWT).
- **FR02:** Quản lý thông tin hồ sơ cá nhân.
- **FR03:** Phân quyền truy cập RBAC 3 vai trò (Admin, Recruiter, Candidate).
- **FR04:** Quản lý vị trí & Tin tuyển dụng kèm JD chi tiết.
- **FR05:** Tìm kiếm & Tra cứu việc làm công khai.
- **FR06:** Ứng tuyển trực tuyến & Tải lên tệp CV (PDF/DOCX < 5MB).
- **FR07:** AI Trích xuất thông tin CV tự động (Học vấn, Kinh nghiệm, Kỹ năng).
- **FR08:** AI Đối chiếu CV - JD & Tính Matching Score (thang 100).
- **FR09:** Sàng lọc & Lọc hồ sơ nâng cao theo kỹ năng và điểm số.
- **FR10:** Quản lý quy trình & Lập lịch phỏng vấn trực tuyến.
- **FR11:** Đánh giá & Chấm điểm kết quả phỏng vấn.
- **FR12:** Cập nhật trạng thái hồ sơ chuẩn (MOI -> DANG_PHONG_VAN -> DAT/KHONG_DAT).
- **FR13:** Hệ thống thông báo & Kích hoạt Email tự động.
- **FR14:** AI Chatbot tư vấn ứng viên 24/7 có Guardrails.
- **FR15:** Báo cáo thống kê hiệu quả tuyển dụng & Biểu đồ phân tích.

### Yêu cầu phi chức năng (NFR01 - NFR08)
- **NFR01:** Bảo mật mã hóa Bcrypt salt=10, phòng chống SQL Injection và XSS.
- **NFR02:** Thời gian phản hồi API < 300ms; xử lý Gemini AI < 3.5s.
- **NFR03:** Kiến trúc phân tầng Express.js mở rộng linh hoạt.
- **NFR04:** Tỷ lệ bao phủ kiểm thử tự động 35/35 Test Cases đạt 100% Pass.
- **NFR05:** Giao diện Responsive trên Desktop và Mobile.
- **NFR06:** Tính toàn vẹn giao dịch MySQL ACID Transaction.
- **NFR07:** Bảo vệ dữ liệu cá nhân theo nguyên tắc PDPA/GDPR.
- **NFR08:** Tính minh bạch của AI (Explainable AI), giải thích rõ căn cứ tính điểm.

## 2.3. Sơ đồ phân cấp chức năng (FHD / WBS)
![Biểu đồ phân rã chức năng](file:///d:/d%E1%BB%B1%20%C3%A1n%202/docs_images/hinh_1_2_phan_ra_chuc_nang.png)  
*Hình 2.1. Biểu đồ Phân rã Chức năng Hệ thống (Functional Decomposition / WBS).*

---

# CHƯƠNG 3: PHÂN TÍCH VÀ THIẾT KẾ HỆ THỐNG

## 3.1. Mô hình Use Case tổng quan (URM)
![Sơ đồ Use Case tổng quan URM](file:///d:/d%E1%BB%B1%20%C3%A1n%202/docs_images/hinh_1_1_urm.png)  
*Hình 3.1. Sơ đồ Use Case tổng quan và Phân quyền Vai trò (URM).*

## 3.2. Danh mục Use Case cốt lõi (UC001 - UC010)
Bao gồm: UC001 (Đăng nhập), UC002 (Đăng tin tuyển dụng), UC003 (Nộp CV), UC004 (AI Trích xuất CV), UC005 (AI Matching CV-JD), UC006 (AI Chatbot), UC007 (Lịch phỏng vấn), UC008 (Đánh giá phỏng vấn), UC009 (Lịch sử trạng thái & Thông báo), UC010 (Báo cáo thống kê).

## 3.3. Luồng nghiệp vụ và Vòng đời hồ sơ
`
[Đăng tin tuyển dụng] 
       ↓
[Ứng viên nộp hồ sơ & CV] → [Trạng thái: MOI]
       ↓
[AI Trích xuất & Chấm điểm sơ bộ Matching Score]
       ↓
[Nhà tuyển dụng sàng lọc] 
       ↓ (Mời phỏng vấn)
[Trạng thái: DANG_PHONG_VAN] → [Hội đồng phỏng vấn chấm điểm]
       ↓
[Nhà tuyển dụng ra quyết định cuối cùng] 
       ↓
[Trạng thái: DAT] HOẶC [Trạng thái: KHONG_DAT] → [Gửi Email tự động]
`
Mọi thao tác chuyển trạng thái đều được lưu vết đầy đủ trong bảng LICH_SU_TRANG_THAI.

---

# CHƯƠNG 4: KIẾN TRÚC CÔNG NGHỆ, BẢO MẬT VÀ TRÍ TUỆ NHÂN TẠO

## 4.1. Kiến trúc hệ thống 4 tầng
1. **Client Layer:** Web Responsive UI, Bootstrap, Axios AJAX.
2. **Backend Layer:** Node.js, Express.js, JWT Authentication, Multer Upload, Winston Logger.
3. **Database Layer:** MySQL 8.0, Connection Pool, InnoDB, ACID Transactions.
4. **AI Service Layer:** Google Gemini API (@google/genai), Safe Text-to-SQL Sandbox.

## 4.2. Giải pháp An toàn và Bảo mật
- Xác thực JWT Token & Phân quyền RBAC.
- Bảo vệ tải tệp CV: Whitelist MIME-type, hash UUID tên tệp, cô lập thư mục tải lên.
- **Safe Text-to-SQL 3 lớp:** (1) Regex Whitelist chặn từ khóa DDL/DML; (2) Read-only Enforcement chỉ cho phép SELECT; (3) Sandbox giới hạn LIMIT 100 và timeout 2s.

## 4.3. Thiết kế Prompt và Tối ưu qua 3 vòng lặp
- **Vòng 1 (Zero-shot thô):** Phát sinh ảo giác kỹ năng, format tự do không parse được.
- **Vòng 2 (Few-shot + Context Grounding):** Giảm ảo giác nhưng đôi khi lẫn markdown code fences.
- **Vòng 3 (Strict Schema + Guardrails):** Đạt độ chính xác > 94%, JSON chuẩn 100%, bóc tách đúng missing_skills và tính điểm tin cậy.

## 4.4. Kiểm thử hệ thống thực tế (35/35 Test Cases Pass 100%)
Bộ test suite tự động với Jest và Supertest bao phủ 100% các phân hệ: Auth, RBAC, Job Management, Candidate Application, Interview, Report và AI Services. Đạt tỷ lệ 35/35 Pass không có lỗi phát sinh.

---

# CHƯƠNG 5: THIẾT KẾ CƠ SỞ DỮ LIỆU VÀ TRIỂN KHAI HỆ THỐNG

## 5.1. Thiết kế Cơ sở dữ liệu quan hệ (ERD 17 bảng chuẩn 3NF)
![Sơ đồ ERD Logic 17 thực thể](file:///d:/d%E1%BB%B1%20%C3%A1n%202/docs_images/hinh_3_1_erd_logic.png)  
*Hình 5.1. Sơ đồ Quan hệ Thực thể (ERD Logic 17 bảng chuẩn 3NF).*

## 5.2. Biểu đồ Lớp phân tích hướng đối tượng (15 lớp)
![Biểu đồ lớp đầy đủ](file:///d:/d%E1%BB%B1%20%C3%A1n%202/docs_images/hinh_1_3_bieu_do_lop_day_du.png)  
*Hình 5.2. Biểu đồ Lớp Đầy đủ 15 Lớp Hướng Đối Tượng (Complete Class Diagram).*

### Các biểu đồ lớp thành phần:
![Lớp tài khoản, ứng viên, hồ sơ](file:///d:/d%E1%BB%B1%20%C3%A1n%202/docs_images/hinh_1_4_lop_tai_khoan_ung_vien_ho_so.png)  
*Hình 5.3. Biểu đồ Lớp Phân hệ Người dùng, Ứng viên và Hồ sơ ứng tuyển.*

![Lớp vị trí, tin đăng, phỏng vấn](file:///d:/d%E1%BB%B1%20%C3%A1n%202/docs_images/hinh_1_5_lop_vi_tri_tin_dang_phong_van.png)  
*Hình 5.4. Biểu đồ Lớp Phân hệ Vị trí việc làm, Tin đăng và Lịch phỏng vấn.*

![Lớp dịch vụ AI, báo cáo, thông báo](file:///d:/d%E1%BB%B1%20%C3%A1n%202/docs_images/hinh_1_6_lop_dich_vu_ai_bao_cao_thong_bao.png)  
*Hình 5.5. Biểu đồ Lớp Phân hệ Dịch vụ AI, Báo cáo và Thông báo.*

## 5.3. Từ điển Dữ liệu Chi tiết (Data Dictionary 17 bảng)
Đặc tả chi tiết các bảng: NGUOI_DUNG, VAI_TRO, QUYEN, VAI_TRO_QUYEN, UNG_VIEN, HO_SO, KY_NANG, HO_SO_KY_NANG, VI_TRI_TUYEN_DUNG, TIN_DANG, TIEU_CHI_DANH_GIA, LICH_PHONG_VAN, DANH_GIA_PHONG_VAN, LICH_SU_TRANG_THAI, THONG_BAO, LICH_SU_CHATBOT, KET_QUA_PHAN_TICH_AI.

## 5.4. Đặc tả API Endpoints chuẩn RESTful JSON
Cung cấp các API: Đăng nhập (POST /api/auth/login), Quản lý tin (GET/POST /api/jobs), Nộp hồ sơ (POST /api/applications/apply), AI Phân tích CV (POST /api/ai/extract-cv), AI Matching (POST /api/ai/match-cv), Lịch phỏng vấn (POST /api/interviews/create).

## 5.5. Hướng dẫn sử dụng & Phụ lục minh chứng AI
Tài liệu hướng dẫn chi tiết cho 3 đối tượng (Admin, Recruiter, Candidate) và bảng minh chứng đối sánh kỹ sư - AI trong quá trình thiết kế hệ thống.

---

# KẾT LUẬN VÀ TÀI LIỆU THAM KHẢO
Dự án đã xây dựng thành công Hệ thống Quản lý Tuyển dụng có tích hợp AI, giải quyết bài toán sàng lọc hồ sơ quy mô lớn với độ tin cậy và an toàn cao, đóng góp một giải pháp HR Tech hiện đại, thiết thực.
