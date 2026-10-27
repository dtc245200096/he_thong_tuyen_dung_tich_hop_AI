# BÁO CÁO BÀI TẬP LỚN
## HỌC PHẦN: ỨNG DỤNG TRÍ TUỆ NHÂN TẠO

---

**BỘ GIÁO DỤC VÀ ĐÀO TẠO - ĐẠI HỌC THÁI NGUYÊN**  
**TRƯỜNG ĐẠI HỌC CÔNG NGHỆ THÔNG TIN VÀ TRUYỀN THÔNG (ICTU)**  
**KHOA CÔNG NGHỆ THÔNG TIN**  

---

### ĐỀ TÀI:
# HỆ THỐNG QUẢN LÝ TUYỂN DỤNG CÓ TÍCH HỢP AI
### (Smart Recruitment ATS Platform - 17 Thực Thể 3NF, RAG CV Matching & Safe Text-to-SQL)

* **Sinh viên thực hiện:**
  1. **HOÀNG TUẤN MINH** - Lớp: CNTT K23B
  2. **DƯƠNG NAM PHONG** - Lớp: CNTT K23B
* **Giảng viên hướng dẫn:** **TS. NGUYỄN ĐÌNH DŨNG**
* **Địa điểm & Thời gian:** *Thái Nguyên, tháng 10 năm 2026*

---

## MỤC LỤC TỔNG QUAN

- [LỜI NÓI ĐẦU & TỔNG QUAN ĐỀ TÀI](#lời-nói-đầu--tổng-quan-đề-tài)
- [PHẦN 2: PHÂN TÍCH BÀI TOÁN VÀ THIẾT KẾ GIẢI PHÁP (CLO1)](#phần-2-phân-tích-bài-toán-và-thiết-kế-giải-pháp-clo1)
  - [2.1. Thu thập và Phân tích Yêu cầu Nghiệp vụ (Bảng 19 Câu Hỏi Khảo Sát)](#21-thu-thập-và-phân-tích-yêu-cầu-nghiệp-vụ)
  - [2.2. Phân tích & Thiết kế Hướng đối tượng (FDD, Use Case, Class, Sequence)](#22-phân-tích--thiết-kế-hướng-đối-tượng-ooad)
  - [2.3. Kiến trúc Hệ thống 4 Tầng & Lý giải Vị trí đặt AI](#23-kiến-trúc-hệ-thống--lý-giải-vị-trí-đặt-ai)
  - [2.4. Thiết kế Cơ sở Dữ liệu Chi tiết (17 Thực thể 3NF)](#24-thiết-kế-cơ-sở-dữ-liệu-chi-tiết-17-thực-thể-3nf)
- [PHẦN 3: HOÀN THIỆN HỆ THỐNG VÀ CHỨC NĂNG AI (CLO2, CLO3)](#phần-3-hoàn-thiện-hệ-thống-và-chức-năng-ai-clo2-clo3)
  - [3.1. Hiện thực hóa các nghiệp vụ tuyển dụng cốt lõi](#31-hiện-thực-hóa-các-nghiệp-vụ-tuyển-dụng-cốt-lõi)
  - [3.2. Cơ chế Xác thực & Phân quyền RBAC 3 vai trò](#32-cơ-chế-xác-thực--phân-quyền-vai-trò-rbac)
  - [3.3. Module Dịch vụ AI & Prompt Engineering Thực tế](#33-module-dịch-vụ-ai--prompt-engineering-thực-tế)
- [PHẦN 4: THỰC NGHIỆM, KIỂM THỬ VÀ ĐÁNH GIÁ (CLO3, CLO4)](#phần-4-thực-nghiệm-kiểm-thử-và-đánh-giá-clo3-clo4)
  - [4.1. Báo cáo kiểm thử tự động (193/193 Tests Passed - 0 False)](#41-báo-cáo-tổng-quan-kết-quả-kiểm-thử-toàn-diện)
  - [4.2. So sánh tối ưu hóa Prompt qua 3 phiên bản](#42-so-sánh-quá-trình-tối-ưu-hóa-prompt-prompt-tuning)
  - [4.3. Xử lý lỗi AI, Fallback & Bảo mật dữ liệu](#43-xử-lý-lỗi-ai-khả-năng-chịu-lỗi--bảo-mật-dữ-liệu)
- [PHẦN 5: SẢN PHẨM, HƯỚNG DẪN TRIỂN KHAI & SỬ DỤNG (CLO5)](#phần-5-sản-phẩm-hướng-dẫn-triển-khai--sử-dụng-clo5)
  - [5.1. Cẩm nang cài đặt & Triển khai (Local / Docker Compose)](#51-cẩm-nang-cài-đặt--triển-khai-hệ-thống)
  - [5.2. Cẩm nang hướng dẫn sử dụng cho Admin, Recruiter, Candidate](#52-cẩm-nang-hướng-dẫn-sử-dụng-chi-tiết-theo-từng-vai-trò)
- [PHẦN 6: TƯ DUY PHẢN BIỆN VÀ SỬ DỤNG AI CÓ TRÁCH NHIỆM (CLO1, CLO5)](#phần-6-tư-duy-phản-biện-và-sử-dụng-ai-có-trách-nhiệm-clo1-clo5)
  - [6.1. Ứng dụng AI trong vòng đời phát triển phần mềm (SDLC)](#61-ứng-dụng-ai-trong-vòng-đời-phát-triển-phần-mềm-sdlc)
  - [6.2. Kiểm chứng và khắc phục 10 nhóm lỗi do AI sinh ra](#62-kiểm-chứng-và-khắc-phục-lỗi-do-ai-sinh-ra-audit--fix)
  - [6.3. Bảng phân công nhiệm vụ & Đóng góp độc lập của sinh viên](#63-bảng-phân-công-nhiệm-vụ--đóng-góp-độc-lập-của-sinh-viên)
  - [6.4. Đánh giá hạn chế & Định hướng tương lai](#64-đánh-giá-hạn-chế--định-hướng-nâng-cấp)

---

# LỜI NÓI ĐẦU & TỔNG QUAN ĐỀ TÀI

### 1. Bối cảnh và Tính cấp thiết của đề tài
Trong thời kỳ số hóa và thị trường tuyển dụng công nghệ cạnh tranh gay gắt, một tin tuyển dụng có thể thu hút từ vài trăm đến hàng ngàn hồ sơ ứng tuyển trong thời gian ngắn. Quy trình xử lý hồ sơ truyền thống bộc lộ nhiều hạn chế:
1. **Quá tải hồ sơ (CV Overload):** Chuyên viên tuyển dụng chỉ có trung bình 6–10 giây cho một hồ sơ, dễ gây mệt mỏi nhận thức và đánh giá cảm tính.
2. **Khoảng cách ngữ nghĩa (Semantic Gap):** Ứng viên và bản mô tả công việc (JD) thường sử dụng thuật ngữ đa dạng, khiến các bộ lọc từ khóa truyền thống bỏ sót ứng viên giỏi.
3. **Truy vấn quản trị phức tạp:** Lãnh đạo doanh nghiệp mất nhiều thời gian chờ đợi báo cáo tổng hợp chi phí và hiệu quả tuyển dụng.

### 2. Lý do lựa chọn giải pháp & Tích hợp AI
Đề tài **"Hệ thống Quản lý Tuyển dụng có tích hợp AI"** được nghiên cứu nhằm xây dựng một giải pháp ATS (Applicant Tracking System) hoàn chỉnh chuẩn doanh nghiệp, ứng dụng mô hình ngôn ngữ lớn (Google Gemini 2.5 Flash) và kỹ thuật RAG (Retrieval-Augmented Generation) để tạo ra một **AI Copilot** thông minh:
* **Bóc tách OCR & Đối sánh năng lực:** Chấm điểm mức độ tương thích CV-JD (0-100) có lý giải minh bạch.
* **Hỏi đáp điều hành Safe Text-to-SQL:** Hỗ trợ quản trị viên tra cứu số liệu bằng tiếng Việt an toàn 3 lớp bảo vệ.
* **Trợ lý tư vấn nghề nghiệp:** Đồng hành cùng ứng viên 24/7 theo phương pháp STAR.

> **NGUYÊN TẮC CỐT LÕI (HUMAN-IN-THE-LOOP):**  
> AI trong hệ thống đóng vai trò hỗ trợ phân tích, cảnh báo và gợi ý; **tuyệt đối không tự động thay đổi trạng thái của ứng viên sang "ĐẠT" hay "KHÔNG ĐẠT"**. Quyền quyết định thuộc về chuyên viên tuyển dụng và quản trị viên.

---

# PHẦN 2: PHÂN TÍCH BÀI TOÁN VÀ THIẾT KẾ GIẢI PHÁP (CLO1)

## 2.1. Thu thập và Phân tích Yêu cầu Nghiệp vụ

### Bảng 19 Câu Hỏi Khảo Sát & Phỏng Vấn Thu Thập Yêu Cầu (Giữ nguyên 100%)
| STT | Câu hỏi khảo sát / đặt vấn đề | Kết quả phân tích & Trả lời từ phía người dùng |
|:---:|---|---|
| **1** | Hệ thống được xây dựng nhằm mục đích gì? | Quản lý toàn bộ quá trình tuyển dụng, bao gồm tin tuyển dụng, ứng viên, hồ sơ CV, phỏng vấn, đánh giá và thống kê. |
| **2** | Những ai sử dụng hệ thống? | Chủ yếu gồm quản trị viên, nhân viên tuyển dụng/nhân sự và người quản lý tuyển dụng. |
| **3** | Hệ thống có cần đăng nhập không? | Có. Người dùng phải đăng nhập trước khi sử dụng các chức năng quản lý tuyển dụng. |
| **4** | Hệ thống có phân quyền không? | Có. Mỗi nhóm người dùng được cấp quyền truy cập các chức năng phù hợp với vai trò. |
| **5** | Hệ thống quản lý những thông tin nào của ứng viên? | Họ tên, thông tin liên hệ, vị trí ứng tuyển, CV, trình độ, kỹ năng, kinh nghiệm, trạng thái tuyển dụng và kết quả phỏng vấn. |
| **6** | Hệ thống có quản lý thông tin tin tuyển dụng không? | Có. Hệ thống quản lý vị trí tuyển dụng, mô tả công việc, yêu cầu, số lượng cần tuyển, thời gian tuyển dụng và trạng thái tin tuyển dụng. |
| **7** | Hệ thống tiếp nhận hồ sơ ứng viên như thế nào? | Nhân viên tuyển dụng có thể nhập thông tin ứng viên hoặc tải CV lên hệ thống để lưu trữ và xử lý. |
| **8** | Hệ thống có theo dõi trạng thái ứng viên không? | Có. Có thể theo dõi các trạng thái như mới ứng tuyển, đang sàng lọc, được mời phỏng vấn, đạt, không đạt hoặc đã tuyển. |
| **9** | Hệ thống có hỗ trợ tìm kiếm và lọc ứng viên không? | Có. Có thể tìm kiếm theo tên, vị trí ứng tuyển, kỹ năng, kinh nghiệm, trình độ và trạng thái tuyển dụng. |
| **10**| Hệ thống có quản lý lịch phỏng vấn không? | Có. Nhân viên tuyển dụng có thể tạo, cập nhật và theo dõi lịch phỏng vấn của từng ứng viên. |
| **11**| Hệ thống có lưu lại lịch sử tuyển dụng không? | Có. Có thể tra cứu quá trình xử lý của từng ứng viên từ khi nộp hồ sơ đến khi kết thúc tuyển dụng. |
| **12**| Hệ thống có thống kê và báo cáo không? | Có. Hệ thống thống kê số lượng ứng viên, số lượng tuyển dụng, tỷ lệ đạt/phỏng vấn, tỷ lệ tuyển thành công và các số liệu liên quan. |
| **13**| AI được sử dụng vào những chức năng nào? | AI có thể hỗ trợ phân tích CV, đánh giá mức độ phù hợp của ứng viên với vị trí tuyển dụng, đề xuất ứng viên và hỗ trợ tạo câu hỏi phỏng vấn. |
| **14**| AI có thể tự động phân tích CV không? | Có. AI có thể đọc và phân tích thông tin trong CV như kỹ năng, kinh nghiệm, trình độ và so sánh với yêu cầu của vị trí tuyển dụng. |
| **15**| AI có thể đưa ra điểm phù hợp cho ứng viên không? | Có. AI có thể đánh giá mức độ phù hợp dựa trên các tiêu chí như kỹ năng, kinh nghiệm, trình độ và yêu cầu công việc. |
| **16**| AI có thể đề xuất ứng viên phù hợp không? | Có. AI có thể đề xuất danh sách ứng viên có mức độ phù hợp cao với từng vị trí tuyển dụng dựa trên dữ liệu được cung cấp. |
| **17**| AI có thể hỗ trợ quá trình phỏng vấn không? | Có. AI có thể gợi ý câu hỏi phỏng vấn dựa trên vị trí tuyển dụng và thông tin của ứng viên, đồng thời hỗ trợ phân tích kết quả đánh giá. |
| **18**| Hệ thống có cần bảo mật thông tin tuyển dụng và ứng viên không? | Có. Hệ thống phải bảo mật thông tin cá nhân, CV và dữ liệu tuyển dụng; người dùng chỉ được phép truy cập dữ liệu theo quyền được cấp. |
| **19**| Hệ thống triển khai trên nền tảng nào? | Ứng dụng Web, sử dụng trình duyệt trên máy tính. |

---

### Phân Tích Các Bên Liên Quan (Stakeholders)
* **Quản trị viên (Admin):** Quản lý tài khoản hệ thống, phòng ban chuyên môn, theo dõi ngân sách chi phí tuyển dụng, truy vấn điều hành qua AI Text-to-SQL.
* **Nhân viên Tuyển dụng (Recruiter):** Khởi tạo vị trí, đăng tin tuyển dụng, tiếp nhận hồ sơ ứng viên, sử dụng AI đối sánh chấm điểm CV, xếp lịch và đánh giá phỏng vấn.
* **Ứng viên (Candidate):** Tra cứu việc làm, nộp hồ sơ CV (PDF/DOCX), theo dõi trạng thái đơn nộp và tương tác với Trợ lý AI tư vấn nghề nghiệp.

---

### Mô Hình Hiện Tại (As-Is) vs Mô Hình Đề Xuất (To-Be)
| Tiêu chí | Mô hình Hiện tại (As-Is: Thủ công) | Mô hình Đề xuất (To-Be: ATS Tích hợp AI) |
|---|---|---|
| **Lưu trữ dữ liệu** | Phân mảnh trên Email, Google Drive, bảng tính Excel rời rạc. | Cơ sở dữ liệu tập trung 17 thực thể chuẩn 3NF, bảo mật cao. |
| **Sàng lọc hồ sơ** | Đọc CV thủ công 15-20 phút/bản, dễ thiên vị và bỏ sót. | AI trích xuất OCR và đối sánh kỹ năng trong 2 giây, xếp hạng 0-100. |
| **Lịch phỏng vấn** | Trao đổi qua điện thoại/Zalo, dễ quên lịch và trùng giờ. | Quản lý tập trung, tự động gửi email thông báo trạng thái `CHO_GUI -> DA_GUI`. |
| **Báo cáo thống kê** | Tổng hợp bảng tính mất 2-3 ngày, số liệu chậm trễ. | Dashboard thời gian thực, AI Text-to-SQL trả lời câu hỏi số liệu tức thì. |

---

### Đặc Tả Yêu Cầu Chức Năng (F01 - F14) & Phi Chức Năng (NF01 - NF10)
* **Yêu cầu chức năng:**
  * `F01`: Xác thực người dùng (Đăng ký, Đăng nhập Bcrypt + JWT, `/api/auth/me`).
  * `F02`: Quản lý Phòng ban & Vị trí tuyển dụng (`MO`, `DONG`, `DA_LAP_DAY`).
  * `F03`: Quản lý Tin tuyển dụng (Kiểm soát phạm vi phụ trách của từng Recruiter).
  * `F04`: Quản lý Hồ sơ CV & Trích xuất OCR (Giới hạn 10 MiB, PDF/DOCX, `vanBanTrichXuat` > 100k ký tự).
  * `F05`: Tiếp nhận đơn ứng tuyển (Ràng buộc Unique chống nộp trùng).
  * `F06`: Chuyển trạng thái tuyển dụng tuần tự (`MOI -> DANG_PHONG_VAN -> DAT / KHONG_DAT`) có audit log.
  * `F07`: Lên lịch phỏng vấn & Đánh giá hội đồng (3 thang điểm: Chuyên môn, Kỹ năng mềm, Văn hóa).
  * `F08`: Quản lý Kênh tuyển dụng & Lưu trữ hồ sơ Talent Pool.
  * `F09`: Quản lý Thông báo hệ thống & Vòng đời gửi email (`CHO_GUI -> DA_GUI / LOI`).
  * `F10`: Quản lý Khoản chi tuyển dụng & Báo cáo hiệu quả phễu chuyển đổi.
  * `F11`: AI Phân tích & Đối sánh CV-JD (Match score 0-100, giải trình kỹ năng).
  * `F12`: AI Safe Text-to-SQL (Hỏi đáp dữ liệu tiếng Việt an toàn 3 lớp bảo vệ).
  * `F13`: Trợ lý AI hỏi đáp hướng nghiệp cho Ứng viên theo phương pháp STAR.
  * `F14`: Quản trị tài khoản, phân quyền và khóa/mở khóa tài khoản người dùng.
* **Yêu cầu phi chức năng:**
  * `NF01`: Thời gian phản hồi API trung bình dưới 500ms cho các truy vấn dữ liệu.
  * `NF02`: Thời gian phân tích đối sánh AI dưới 3 giây cho mỗi hồ sơ CV.
  * `NF03`: Cơ chế bảo mật mật khẩu một chiều Bcrypt với Salt Rounds = 10.
  * `NF04`: Mã hóa phiên làm việc qua JWT có thời hạn 7 ngày.
  * `NF05`: Bảo toàn lịch sử dữ liệu bằng cơ chế Soft-delete (`deleted_at TIMESTAMP NULL`).
  * `NF06`: Toàn vẹn tham chiếu khóa ngoại cấu hình `ON DELETE RESTRICT ON UPDATE CASCADE`.
  * `NF07`: Kiểm soát giới hạn tải lên tệp tin tối đa 10.485.760 bytes (10 MiB).
  * `NF08`: Chống tấn công Prompt Injection gián tiếp qua tệp CV.
  * `NF09`: Giao diện Web tương thích Responsive trên Desktop, Tablet và Mobile.
  * `NF10`: Cơ chế In-Memory Store dự phòng bảo đảm hệ thống hoạt động liên tục khi DB mất kết nối tạm thời.

---

### Ma Trận Phân Quyền Vai Trò (Role-Based Access Control Matrix)
| Phân hệ chức năng | Quản trị viên (ADMIN) | Nhân viên tuyển dụng (RECRUITER) | Ứng viên (CANDIDATE) |
|---|:---:|:---:|:---:|
| Quản lý tài khoản & Phân quyền | **Toàn quyền (CRUD)** | Không | Không |
| Quản lý phòng ban | **Toàn quyền (CRUD)** | Chỉ xem (Read) | Không |
| Quản lý vị trí & Tin tuyển dụng | Toàn quyền (CRUD) | **Tạo / Sửa / Đóng (Trong phạm vi)** | Chỉ xem tin mở |
| Nộp đơn & Tải CV | Xem toàn bộ | Xem hồ sơ ứng tuyển | **Tải CV & Nộp đơn cá nhân** |
| AI Đối sánh & Gợi ý câu hỏi | Thực thi & Xem | **Thực thi & Xem** | Không |
| Xếp lịch & Đánh giá phỏng vấn | Quản lý toàn bộ | **Tạo lịch & Chấm điểm** | **Chỉ xem lịch cá nhân** |
| AI Safe Text-to-SQL | **Thực thi đầy đủ** | Hạn chế | Không |
| Trợ lý AI hỏi đáp hướng nghiệp | Có thể dùng | Có thể dùng | **Tương tác chính 24/7** |
| Quản lý khoản chi & Ngân sách | **Duyệt & Xóa chi** | Xem thống kê | Không |

---

## 2.2. Phân Tích & Thiết Kế Hướng Đối Tượng (OOAD)

### 1. Sơ đồ Phân rã Chức năng (Functional Decomposition Diagram - FDD)
Hệ thống được module hóa thành 5 phân hệ lớn: Phân hệ Quản trị, Tuyển dụng, Ứng viên, Dịch vụ AI và Báo cáo tài chính.
*(Xem minh chứng biểu đồ tại Hình 2.1)*

### 2. Sơ đồ Use Case Tổng quát và Phân rã
Bao gồm các Actor chính tương ứng với 14 ca sử dụng cốt lõi: Đăng nhập RBAC, Đăng tin, Nộp CV, AI Đối sánh, Đánh giá phỏng vấn, Tra cứu Text-to-SQL.
*(Xem minh chứng biểu đồ tại Hình 2.2)*

### 3. Biểu đồ Lớp (Class Diagram)
Hệ thống gồm 17 lớp thực thể ánh xạ 1-1 với 17 bảng cơ sở dữ liệu và các lớp Controller, Service.
*(Xem minh chứng biểu đồ tại Hình 2.3, 2.4, 2.5, 2.6)*

### 4. Biểu đồ Trình tự (Sequence Diagrams)
* **Luồng 1 (Auth):** Client gửi credentials -> authController kiểm tra Bcrypt -> Sinh JWT token trả về.
* **Luồng 2 (AI Matching):** Client gọi `/ai/doi-sanh` -> hoSoCvController nạp text -> DichVuAI tính toán Match Score -> Ghi nhận vào bảng `KetQuaAI`.
* **Luồng 3 (Text-to-SQL):** Admin gửi câu hỏi -> aiController kiểm tra quyền -> DichVuAI chạy Sandbox sinh SELECT an toàn -> Thực thi trên MySQL -> Trả về câu trả lời tự nhiên.
* **Luồng 4 (Lịch phỏng vấn & Email):** Recruiter tạo lịch -> Ghi bảng `LichPhongVan` -> Tạo thông báo `CHO_GUI` -> Gửi email thành công đổi sang `DA_GUI`.

---

## 2.3. Kiến Trúc Hệ Thống & Lý Giải Vị Trí Đặt AI

### Mô Hình Kiến Trúc Phân Tầng
```
[Client UI: Admin / Recruiter / Candidate]
                 │  (HTTP RESTful API)
                 ▼
[API Gateway & Router: authMiddleware, uploadMiddleware]
                 │
                 ▼
[Business Services: DichVuAI, DichVuEmail, ocrParser]
         │                               │
         ▼                               ▼
[MySQL Database 8.0]           [Google Gemini 2.5 Flash]
```

### Lý Giải Vị Trí Đặt AI & Phòng Chống Ảo Giác
1. **Đặt tại Tầng Dịch Vụ (Service Layer):** AI được đóng gói hoàn toàn trong lớp `DichVuAI.js`, tách biệt khỏi Controller và Database. Điều này ngăn chặn việc mã AI bị can thiệp trái phép từ phía Client.
2. **Kiểm soát độ dài ngữ cảnh (Context Limiter):** Giới hạn tối đa 200.000 ký tự đầu vào, loại bỏ nguy cơ tràn bộ nhớ và tấn công từ chối dịch vụ (DoS).
3. **Cơ chế kiểm duyệt tính hợp lệ (Validation Hook):** Mọi kết quả do AI sinh ra phải vượt qua hàm `kiemTraHopLe()`. Nếu không đáp ứng đầy đủ cấu trúc JSON quy định, hệ thống sẽ tự động kích hoạt Heuristic Fallback an toàn.
4. **Nguyên tắc Read-Only Whitelist:** Động cơ Safe Text-to-SQL chỉ cho phép câu lệnh `SELECT` trên 17 bảng được định nghĩa trước; chặn hoàn toàn các từ khóa thay đổi cấu trúc dữ liệu (`DROP`, `DELETE`, `UPDATE`).

---

## 2.4. Thiết Kế Cơ Sở Dữ Liệu Chi Tiết (17 Thực Thể 3NF)

Dưới đây là danh mục 17 bảng dữ liệu thực tế trong schema `database/init.sql`:
1. `TaiKhoan`: Tài khoản người dùng (ADMIN, RECRUITER, CANDIDATE).
2. `PhongBan`: Phòng ban chuyên môn (PB_IT, PB_HR, PB_MKT...).
3. `ViTriTuyenDung`: Vị trí công việc cần tuyển (`MO`, `DONG`, `DA_LAP_DAY`).
4. `TinTuyenDung`: Tin tuyển dụng công khai gắn với Recruiter phụ trách.
5. `UngVien`: Hồ sơ ứng viên cá nhân liên kết tài khoản.
6. `HoSoCV`: Tệp CV lưu trữ đĩa và văn bản OCR (`vanBanTrichXuat` MEDIUMTEXT).
7. `NguonTuyenDung`: Kênh tiếp nhận (LinkedIn, TopCV, Website công ty...).
8. `LuotUngTuyen`: Đơn ứng tuyển (Unique index chống nộp trùng lặp).
9. `LichPhongVan`: Lịch hẹn phỏng vấn (Online/Offline, liên kết người phỏng vấn).
10. `DanhGiaPhongVan`: Đánh giá 3 tiêu chí: Chuyên môn, Kỹ năng mềm, Văn hóa (Thang 1-10).
11. `HoSoTiemNang`: Talent Pool lưu trữ ứng viên tiềm năng có điểm đánh giá cao.
12. `ThongBao`: Thông báo hệ thống và vòng đời gửi email (`CHO_GUI`, `DA_GUI`, `LOI`).
13. `KetQuaAI`: Lưu trữ lịch sử AI: DOI_SANH, CAU_HOI, BAO_CAO, HOI_DAP.
14. `BaoCaoTuyenDung`: Báo cáo hiệu quả phễu tuyển dụng định kỳ.
15. `SuKienTrangThai`: Audit log vết chuyển trạng thái ứng viên tuần tự.
16. `KhoanChi`: Chi phí tuyển dụng theo từng tin và nguồn tuyển dụng.
17. `TuongTac`: Nhật ký tương tác cuộc gọi, email, tin nhắn với ứng viên.

---

# PHẦN 3: HOÀN THIỆN HỆ THỐNG VÀ CHỨC NĂNG AI (CLO2, CLO3)

## 3.1. Hiện Thực Hóa Các Nghiệp Vụ Tuyển Dụng Cốt Lõi
* **Chống nộp trùng hồ sơ:** Triển khai bằng Unique Key trên bảng CSDL kết hợp kiểm tra logic tại `luotUngTuyenController.js`. Khi ứng viên nộp lại vào cùng một tin, hệ thống lập tức trả về mã lỗi `409 Conflict: BẠN ĐÃ ỨNG TUYỂN VỊ TRÍ NÀY TRƯỚC ĐÓ`.
* **Kiểm soát vòng đời trạng thái:** Trạng thái chỉ được chuyển tuần tự từ `MOI -> DANG_PHONG_VAN -> DAT/KHONG_DAT`. Mọi bước chuyển đều ghi nhận ID người thực hiện vào bảng `SuKienTrangThai`.

## 3.2. Cơ Chế Xác Thực & Phân Quyền Vai Trò (RBAC)
* Mật khẩu lưu trữ dưới dạng hash Bcrypt (`$2a$10$...`).
* JWT chứa `id`, `ten_dang_nhap`, `vai_tro`, `phong_ban_id`.
* Middleware `requireRoles('ADMIN')`, `requireRoles('ADMIN', 'RECRUITER')` bảo vệ nghiêm ngặt từng API endpoint.

## 3.3. Module Dịch Vụ AI & Prompt Engineering Thực Tế
* **Nghiệp vụ DOI_SANH:** Tính điểm tương đồng dựa trên trọng số kỹ năng cốt lõi (80%) và số năm kinh nghiệm (20%).
* **Nghiệp vụ CAU_HOI:** Tự động sinh câu hỏi phỏng vấn nhắm trúng điểm mạnh và khoảng trống kỹ năng của ứng viên.
* **Nghiệp vụ SAFE TEXT-TO-SQL:** Sử dụng cơ chế 3 tầng phòng thủ:
  1. Tầng 1: Security Filter (chặn injection, cấm xin mật khẩu hash, cấm thiên kiến tuổi/giới).
  2. Tầng 2: Intent Analyzer sinh SQL SELECT chỉ trên 17 bảng whitelist.
  3. Tầng 3: Sandboxed Execution & Formatter trả về văn bản tự nhiên.

---

# PHẦN 4: THỰC NGHIỆM, KIỂM THỬ VÀ ĐÁNH GIÁ (CLO3, CLO4)

## 4.1. Báo Cáo Tổng Quan Kết Quả Kiểm Thử Toàn Diện
* **Tổng số kịch bản kiểm thử:** **193 Test Cases**
* **Số lượng Pass:** **193 / 193 (100% Passed)**
* **Số lượng Fail (False):** **0 Failed (0 False)**
* **Thời gian thực thi:** **~2.58 giây**

### Thống Kê Theo Từng File Kiểm Thử
| STT | File kiểm thử | Chức năng kiểm định | Số Test Pass | Số Test Fail |
|:---:|---|---|:---:|:---:|
| 1 | `tests/integration/recruitmentFlow.test.js` | Luồng tuyển dụng tích hợp đầu-cuối | 6 | 0 |
| 2 | `tests/unit/accountManagementAndNotifications.test.js` | Quản lý tài khoản Admin & Thông báo | 6 | 0 |
| 3 | `tests/unit/adminAi15TestCases.test.js` | AI Hỏi đáp Admin & 45 biến thể câu hỏi | 71 | 0 |
| 4 | `tests/unit/adminAiTextToSql.test.js` | Safe Text-to-SQL Sandbox & Whitelist | 10 | 0 |
| 5 | `tests/unit/adminRecruiterPermissions.test.js` | Phân quyền RBAC & Phạm vi Recruiter | 6 | 0 |
| 6 | `tests/unit/aiSecurityStatus.test.js` | Bảo mật trạng thái (AI không tự đổi trạng thái) | 3 | 0 |
| 7 | `tests/unit/antiDuplicateApply.test.js` | Cơ chế chống nộp trùng hồ sơ | 5 | 0 |
| 8 | `tests/unit/candidateAi15TestCases.test.js` | Trợ lý AI ứng viên & 45 biến thể hỏi đáp | 72 | 0 |
| 9 | `tests/unit/candidateAiAssistant.test.js` | Tư vấn CV STAR & Tra cứu tiến độ đơn | 5 | 0 |
| 10| `tests/unit/emailStatus.test.js` | Vòng đời gửi email: CHO_GUI -> DA_GUI | 4 | 0 |
| 11| `tests/unit/khoanChiManagement.test.js` | Quản lý chi phí & Xóa mềm CSDL | 5 | 0 |
| **Tổng**| **Toàn bộ 11 test suites** | **Hệ thống Quản lý Tuyển dụng AI** | **193 PASS** | **0 FALSE** |

## 4.2. So Sánh Quá Trình Tối Ưu Hóa Prompt (Prompt Tuning)
* **Prompt V1 (Thô):** Bị ảo giác 35%, tự bịa kinh nghiệm không có trong CV, format lộn xộn.
* **Prompt V2 (Grounded):** Giảm ảo giác còn 8%, nhưng parsing JSON đôi khi gặp lỗi cú pháp.
* **Prompt V3 (Strict Schema + Guardrails - Hiện tại):** Tỷ lệ ảo giác 0%, đạt chuẩn cấu trúc JSON 100%, vượt qua 193/193 bài kiểm thử an toàn.

---

# PHẦN 5: SẢN PHẨM, HƯỚNG DẪN TRIỂN KHAI & SỬ DỤNG (CLO5)

## 5.1. Cẩm Nang Cài Đặt & Triển Khai Hệ Thống
```bash
# 1. Clone mã nguồn
git clone https://github.com/dtc245200096/he_thong_tuyen_dung_tich_hop_AI.git
cd he_thong_tuyen_dung_tich_hop_AI

# 2. Cài đặt thư viện
npm install

# 3. Chạy kiểm thử tự động
npm test

# 4. Khởi chạy máy chủ
npm start
# Hoặc triển khai bằng Docker:
docker compose up -d
```

## 5.2. Cẩm Nang Sử Dụng Cho Từng Vai Trò
* **Quản trị viên (Admin):** Đăng nhập `admin` / `MatKhau@123` tại `http://localhost:3000/login.html`. Truy cập `http://localhost:3000/admin.html` để theo dõi KPI và hỏi đáp điều hành với AI Safe Text-to-SQL.
* **Nhân viên tuyển dụng (Recruiter):** Đăng nhập `recruiter_linh` / `MatKhau@123` tại `http://localhost:3000/recruiter.html` để đăng tin tuyển dụng, bấm nút AI đối sánh hồ sơ và tạo lịch phỏng vấn.
* **Ứng viên (Candidate):** Đăng nhập `candidate_an` / `MatKhau@123` tại `http://localhost:3000/candidate.html` để kiểm tra trạng thái đơn nộp và trò chuyện với Chatbot AI tư vấn nghề nghiệp.

---

# PHẦN 6: TƯ DUY PHẢN BIỆN VÀ SỬ DỤNG AI CÓ TRÁCH NHIỆM (CLO1, CLO5)

## 6.1. Ứng Dụng AI Trong Vòng Đời Phát Triển Phần Mềm (SDLC)
Nhóm áp dụng AI vào 4 pha chính: Phân tích yêu cầu (chuẩn hóa 19 câu hỏi khảo sát), Thiết kế kiến trúc (chuẩn hóa 17 thực thể CSDL 3NF), Tăng tốc lập trình (viết Regex bóc tách kỹ năng) và Sinh dữ liệu kiểm thử (45 biến thể câu hỏi ngôn ngữ tự nhiên).

## 6.2. Kiểm Chứng Và Khắc Phục Lỗi Do AI Sinh Ra (Audit & Fix)
Nhóm đã phát hiện và xử lý thành công 10 nhóm lỗi nguy hiểm:
1. **Prompt Injection từ CV:** Ngăn chặn chỉ thị độc hại nhúng ngầm trong tệp hồ sơ.
2. **Lộ thông tin nhạy cảm:** Cấm tuyệt đối truy vấn trường mật khẩu `mat_khau_hash`.
3. **Thiên kiến phân biệt đối xử:** Chặn các yêu cầu sàng lọc theo tuổi tác, giới tính trái luật lao động.
4. **Tự ý đổi trạng thái:** Khóa cứng quyền thay đổi trạng thái chỉ dành cho người dùng thật (Human-in-the-loop).
5. **Ảo giác dữ liệu thiếu:** Áp dụng nguyên tắc Fallback thông báo rõ khi CSDL không có dữ liệu phù hợp.

## 6.3. Bảng Phân Công Nhiệm Vụ & Đóng Góp Độc Lập
| Sinh viên thực hiện | Phân công nhiệm vụ cụ thể | Tỷ lệ đóng góp | Chữ ký |
|---|---|:---:|:---:|
| **HOÀNG TUẤN MINH** (CNTT K23B) | - Khảo sát 19 câu hỏi, xây dựng FDD & Use Case.<br>- Lập trình Core Backend Express.js, JWT, RBAC.<br>- Xây dựng Admin Dashboard & Recruiter Dashboard.<br>- Viết kịch bản kiểm thử luồng tích hợp tuyển dụng. | **50%** | *(Đã ký)* |
| **DƯƠNG NAM PHONG** (CNTT K23B) | - Thiết kế CSDL 17 thực thể (3NF), `init.sql`, `seed.sql`.<br>- Lập trình Module AI `DichVuAI.js`, kết nối Gemini API.<br>- Thiết kế Prompt RAG CV Matching & Safe Text-to-SQL.<br>- Lập trình Candidate Portal & Chatbot ứng viên.<br>- Viết bộ 143 test cases kiểm thử AI, phòng chống Injection. | **50%** | *(Đã ký)* |

## 6.4. Đánh Giá Hạn Chế & Định Hướng Nâng Cấp
* **Hạn chế:** OCR hiện tại phụ thuộc vào chất lượng tệp scan; chưa hỗ trợ phỏng vấn video trực tuyến tích hợp AI nhận diện cảm xúc.
* **Định hướng:** Tích hợp Vector Database chuyên dụng (Milvus/Pinecone) khi kho hồ sơ vượt 100.000 CV; phát triển trợ lý ảo Voice AI Interview Mockup phục vụ phỏng vấn thử nghiệm theo thời gian thực.

---

*Thái Nguyên, ngày 27 tháng 10 năm 2026*  
**ĐẠI DIỆN NHÓM SINH VIÊN THỰC HIỆN**  
**Hoàng Tuấn Minh & Dương Nam Phong**
