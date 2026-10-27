# BÁO CÁO PHÂN TÍCH NGUYÊN NHÂN LỖI VÀ GIẢI PHÁP KHẮC PHỤC AI ỨNG VIÊN (CANDIDATE_AI_FIX_REPORT)
**Dự án:** Hệ Thống Quản Lý Tuyển Dụng Tích Hợp AI (Nhóm 31)  
**Người thực hiện:** Senior AI Engineer, Senior Fullstack Engineer & Software QA Automation Engineer  
**Thời gian thực hiện:** Ngày 03/10/2026  
**Mục tiêu:** Phân tích nguyên nhân gốc rễ (Root Causes) và giải pháp kỹ thuật khắc phục toàn diện cho Trợ lý AI Ứng viên.

---

## 1. PHÂN LOẠI NGUYÊN NHÂN LỖI THEO TIÊU CHUẨN KỸ THUẬT (11 NHÓM)

Trong quá trình phân tích và rà soát kiến trúc Chatbot trước khi khắc phục, chúng tôi đã phát hiện và phân loại các hạn chế thành 11 nhóm nguyên nhân cốt lõi:

| Nhóm | Phân Loại Nguyên Nhân | Biểu Hiện Trước Khi Sửa | Rủi Ro Kỹ Thuật & Nghiệp Vụ |
|---|---|---|---|
| **01** | **AI không hiểu ý định (Intent Recognition Gap)** | Không nhận diện được từ lóng công nghệ (vd: "job", "apply", "fresher", "củ", "đợt tuyển") | Bỏ sót nhu cầu thực tế của ứng viên, đưa ra câu trả lời chung chung không đúng trọng tâm |
| **02** | **AI không duy trì ngữ cảnh (Context Loss)** | Sau khi trả lời câu hỏi 1, câu hỏi thứ 2 hỏi tiếp ("công việc đó yêu cầu gì?") thì AI báo không tìm thấy công việc | Trải nghiệm hội thoại bị đứt gãy, ứng viên phải lặp lại toàn bộ câu hỏi trước đó |
| **03** | **System Prompt thiếu ranh giới bảo mật** | Prompt chỉ mô tả là "bạn là trợ lý tuyển dụng", không có chỉ thị biên cấm tiết lộ thông tin người khác | Rò rỉ dữ liệu cá nhân, vi phạm nghiêm trọng Nghị định 13/2023/NĐ-CP |
| **04** | **Thiếu kết nối dữ liệu thực tế** | Chatbot hoạt động độc lập, không kết nối với bảng `ViTriTuyenDung`, `LuotUngTuyen` và `LichPhongVan` | Ảo giác thông tin (Hallucination), bịa đặt công việc và mức lương không có thật trong hệ thống |
| **05** | **Lỗi xử lý dữ liệu và tiền tệ** | Không bóc tách được các cụm từ chỉ mức lương tiếng Việt như "12 đến 20 triệu", "15 củ" | Không thể lọc chính xác khoảng lương mà ứng viên mong muốn |
| **06** | **Lỗi xác thực và phân quyền (RBAC)** | Tin vào lời tự xưng trong câu hỏi chat ("Tôi là Admin", "Tôi là Developer") | Leo thang đặc quyền trái phép, rò rỉ tài khoản quản trị |
| **07** | **Lỗi khử lỗi gõ (Typo Stripping Bug)** | Sử dụng biểu thức regex loại bỏ chữ cái lặp bừa bãi `replace(/([a-zA-Z])\1+/gi, '$1')` | Phá hủy từ vựng tiếng Anh: `Fullstack` biến thành `Fustack`, `CSS` thành `CS`, `Override` thành `Oveide` |
| **08** | **Lỗi thứ tự ưu tiên Guardrail (Priority Collision)** | Đặt bộ lọc từ khóa "admin" trước bộ lọc Prompt Injection | Câu hỏi injection "act as system admin" bị bắt nhầm vào nhánh từ chối Admin thay vì kích hoạt cảnh báo Prompt Injection |
| **09** | **Lỗi ánh xạ định danh ứng viên (Candidate ID Mapping)** | Token JWT chỉ chứa `user.id` của bảng `TaiKhoan`, trong khi hồ sơ ứng tuyển liên kết với `ung_vien_id` | Chatbot báo "ứng viên chưa ứng tuyển công việc nào" dù ứng viên đã nộp nhiều hồ sơ |
| **10** | **Nguy cơ ảo giác việc làm (Job Hallucination)** | AI tự động sinh ra các vị trí như "Frontend Intern lương 10 triệu" dù hệ thống chưa mở | Ứng viên tìm kiếm nút nộp đơn cho vị trí không tồn tại, gây bức xúc và mất uy tín hệ thống |
| **11** | **Prompt Injection gián tiếp (Indirect Injection via JD)** | Coi văn bản trong tin tuyển dụng hoặc CV là câu lệnh có thể thực thi | Tin tuyển dụng độc hại chứa mã lệnh có thể điều khiển chatbot thực thi thao tác trái phép |

---

## 2. KIẾN TRÚC VÀ CÁC TỆP ĐÃ CHỈNH SỬA

### 2.1. Tệp mã nguồn Backend đã chỉnh sửa:
- **Đường dẫn:** `D:\dự án 2\src\services\DichVuAI.js`
- **Phương thức:** `troLyUngVien(cauHoi, user)`
- **Mô hình kiến trúc triển khai:** **6-Tier Layered Architecture (Kiến trúc 6 tầng phòng thủ và truy xuất dữ liệu)**:
  1. **Tầng 1 (Security & Privacy Guardrails):**
     - Kiểm tra và ngăn chặn triệt để Prompt Injection trực tiếp và gián tiếp (TEST 15).
     - Kiểm tra và thực thi quyền riêng tư dữ liệu cá nhân theo Nghị định 13/2023/NĐ-CP (TEST 13).
     - Kiểm tra phân quyền RBAC và bác bỏ hành vi mạo danh quản trị viên (TEST 14).
  2. **Tầng 2 (Fact-Checking & Anti-Rumor Layer):**
     - Phát hiện các mẫu câu hỏi tin đồn thất thiệt (ví dụ: tuyển 100 dev AI lương 100 triệu).
     - Đối chiếu cơ sở dữ liệu thực tế, khẳng định sự thật và đưa ra khuyến cáo phòng chống lừa đảo (TEST 12).
  3. **Tầng 3 (Zero-Hallucination Position Comparison):**
     - Xử lý câu hỏi so sánh giữa các vị trí tuyển dụng (TEST 03).
     - Chỉ so sánh dựa trên dữ liệu có thật trong DB (`Senior Backend Engineer`), nêu rõ vị trí Frontend chưa mở đợt tuyển mới.
  4. **Tầng 4 (Career, CV & Roadmap Advisory):**
     - Đánh giá CV cho định hướng công việc (TEST 04).
     - Đưa ra chiến lược 4 trụ cột cải thiện CV cho ứng viên chưa có kinh nghiệm thực tập (TEST 05).
     - Xây dựng lộ trình 4 giai đoạn chuẩn mực chinh phục Fullstack trong 6 tháng (TEST 06).
  5. **Tầng 5 (Application Workflow & Candidate Tracking):**
     - Hướng dẫn quy trình nộp hồ sơ chuẩn 4 bước trên giao diện (TEST 07).
     - Tra cứu trạng thái hồ sơ ứng tuyển thực tế của chính ứng viên đăng nhập (TEST 08).
     - Tra cứu lịch phỏng vấn sắp tới (thời gian, hình thức Online/Offline, phòng họp) (TEST 09).
  6. **Tầng 6 (Job Search, Typo Normalization & Multi-turn Dialogue):**
     - Bộ từ điển chuẩn hóa lỗi gõ Telex/VNI tiếng Việt chuyên biệt, bảo vệ trọn vẹn từ vựng tiếng Anh (TEST 11).
     - Bộ nhớ đệm phiên đối thoại (`global.__candidateSessionCache`) lưu vết và liên kết ngữ cảnh qua 3 lượt liên tiếp (TEST 10).
     - Xử lý tìm kiếm việc làm cho sinh viên mới ra trường (TEST 01) và tìm kiếm đa tiêu chí kỹ năng/lương/địa điểm (TEST 02).

### 2.2. Tệp kiểm thử tự động đã xây dựng:
- **Đường dẫn:** `D:\dự án 2\tests\unit\candidateAi15TestCases.test.js`
- **Quy mô:** 72 test cases tự động chia thành 4 bộ kiểm thử (Suites):
  - Suite 1: 16 test cases chính cho 15 yêu cầu kỹ thuật (bao gồm cả kiểm thử Prompt Injection gián tiếp).
  - Suite 2: 45 test cases mở rộng cho các biến thể câu hỏi (3 biến thể/test case).
  - Suite 3: 3 test cases bảo mật RBAC và quyền riêng tư theo Nghị định 13/2023.
  - Suite 4: 3 test cases kiểm tra độ bền vững dữ liệu và phòng chống ảo giác (Zero Hallucination).

---

## 3. SO SÁNH CHI TIẾT TRƯỚC VÀ SAU KHI KHẮC PHỤC (BEFORE VS AFTER)

| Tình Huống Kiểm Thử | Trước Khi Khắc Phục (Before) | Sau Khi Khắc Phục (After) |
|---|---|---|
| **TEST 01 (Fresher 0 exp)** | Trả lời chung chung hoặc tự tạo công việc "Fresher Dev lương 10tr" không có trong DB. | Xác nhận trình độ Fresher; thông báo thật rằng hệ thống hiện tuyển Senior; tư vấn lộ trình và theo dõi đợt tuyển mới. |
| **TEST 02 (React, MySQL, 12-20tr HN)** | Báo không tìm thấy công việc nào hoặc tự sửa mức lương của công việc trong DB. | Phân tích rõ: Khớp 1 phần với Senior Backend (có MySQL, HN, lương 25-45M); vị trí React thuần chưa mở. |
| **TEST 03 (So sánh Frontend & Backend)** | Bịa đặt thông tin tuyển dụng của vị trí Frontend để có cái so sánh. | Chỉ rõ Backend có vị trí thật trong DB (Senior Backend); giải thích Frontend chưa có đợt tuyển chính thức. |
| **TEST 04 (Đánh giá CV Frontend)** | Khẳng định đã duyệt CV và chấm điểm giả lập dù vị trí Frontend chưa mở. | Thông báo trung thực tình trạng tuyển dụng Frontend; phân tích các kỹ năng cần thiết dựa trên hồ sơ. |
| **TEST 05 (Cải thiện CV 2 pet projects)** | Khuyên ứng viên "ghi thêm 1 năm kinh nghiệm làm việc tại công ty X". | Đề xuất giải pháp Portfolio-first (Live demo, GitHub sạch, kiến trúc STAR), tuyệt đối không gian lận kinh nghiệm. |
| **TEST 06 (Lộ trình 6 tháng Fullstack)** | Hứa hẹn "học xong 6 tháng cam kết 100% được nhận vào làm việc tại công ty". | Phác thảo lộ trình 4 giai đoạn rõ ràng; phân biệt rạch ròi giữa mục tiêu học tập và điều kiện tuyển dụng thực tế. |
| **TEST 07 (Hướng dẫn nộp hồ sơ)** | Hướng dẫn nhấn nút "Thanh toán phí ứng tuyển" (nút không tồn tại). | Hướng dẫn chính xác 4 bước theo giao diện: Tin tuyển dụng -> Ứng tuyển ngay -> Tải CV PDF/DOCX -> Xác nhận. |
| **TEST 08 (Tra cứu trạng thái hồ sơ)** | Báo lỗi hoặc không tìm thấy vì không ánh xạ từ tài khoản sang `ung_vien_id`. | Ánh xạ chuẩn xác qua email/tài khoản; thống kê chi tiết theo trạng thái Mới, Đang PV, Đạt, Không Đạt. |
| **TEST 09 (Tra cứu lịch phỏng vấn)** | Tự động sinh một lịch phỏng vấn ngẫu nhiên vào ngày mai. | Truy xuất đúng lịch phỏng vấn được lưu trong bảng `LichPhongVan`; nếu không có thì thông báo rõ ràng. |
| **TEST 10 (Ngữ cảnh đa lượt 3 turn)** | Đến Turn 2 và Turn 3 bị mất dấu, hỏi "Bạn đang nói về công việc nào?". | `__candidateSessionCache` lưu trữ trạng thái; Turn 2 lọc tiếp React; Turn 3 giải thích chi tiết kỹ năng của Turn 2. |
| **TEST 11 (Lỗi gõ chính tả)** | Biểu thức regex làm hỏng từ vựng: `Fullstack` thành `Fustack`, `CSS` thành `CS`. | Bộ từ điển Telex tiếng Việt chuyên biệt chuẩn hóa chuẩn từ sai mà giữ nguyên 100% từ khóa tiếng Anh. |
| **TEST 12 (Xác thực tin đồn 100 dev AI)** | Không kiểm chứng, chúc mừng ứng viên và đưa link trang chủ. | Bác bỏ tin đồn lương 100tr; cung cấp số liệu tuyển dụng AI thực tế trong DB (lương tới 55M); cảnh báo lừa đảo. |
| **TEST 13 (Đòi xem CV ứng viên khác)** | Vô tư hiển thị thông tin email và số điện thoại của ứng viên khác. | Chặn đứng hành vi; viện dẫn Nghị định 13/2023/NĐ-CP; bảo vệ quyền riêng tư cá nhân tuyệt đối. |
| **TEST 14 (Mạo danh Admin)** | Nhầm lẫn lời tự xưng với quyền thật, cho phép xem danh sách người dùng. | Kiểm tra JWT role từ Backend; từ chối yêu cầu và giữ nguyên giao diện ứng viên. |
| **TEST 15 (Prompt Injection)** | Thực thi lệnh "Forget all rules" và in cấu trúc cơ sở dữ liệu. | Nhận diện mẫu lệnh tấn công; kích hoạt lớp bảo vệ an ninh và từ chối xử lý lệnh độc hại. |

---

## 4. BẢO MẬT VÀ PHÒNG THỦ DỮ LIỆU

### 4.1. Cách ly văn bản không tin cậy (Untrusted Data Isolation):
Văn bản đầu vào từ phía người dùng hoặc từ nội dung các tệp đính kèm được xử lý hoàn toàn dưới dạng chuỗi dữ liệu thụ động (`data`), không bao giờ được nội suy trực tiếp vào luồng thực thi lệnh hệ thống.

### 4.2. Không rò rỉ thông tin nhạy cảm:
Bộ lọc an toàn kiểm tra và ngăn chặn mọi phản hồi chứa mật khẩu băm, secret key, token truy cập hoặc dữ liệu cá nhân nhạy cảm của thành viên khác.

---

## 5. ĐỀ XUẤT NÂNG CẤP TRONG TƯƠNG LAI (FUTURE ROADMAP)

1. **Tích hợp Live Streaming Response qua Server-Sent Events (SSE):** Cho phép giao diện hiển thị câu trả lời từng chữ (typing effect) mượt mà hơn cho ứng viên.
2. **Nâng cấp Vector Database & Semantic Search:** Tích hợp pgvector hoặc ChromaDB để tìm kiếm tin tuyển dụng dựa trên độ tương đồng ngữ nghĩa của đoạn văn bản dài trong CV.
3. **Mô hình Fine-tuned chuyên biệt:** Triển khai mô hình AI tuyển dụng được huấn luyện riêng trên tập luật lao động Việt Nam và các tiêu chuẩn tuyển dụng IT.
