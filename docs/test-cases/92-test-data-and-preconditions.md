# TỪ ĐIỂN DỮ LIỆU KIỂM THỬ VÀ ĐIỀU KIỆN TIÊN QUYẾT (TEST DATA & PRECONDITIONS)

---

### 1. MỤC TIÊU TÀI LIỆU
Tài liệu **Từ điển Dữ liệu Kiểm thử & Điều kiện Tiên quyết** chuẩn hóa toàn bộ các tập dữ liệu giả lập (Mock/Seed Data), tài khoản kiểm thử, token xác thực, tệp tin mẫu (Fixtures) và trạng thái môi trường cần thiết để thực thi 214 kịch bản kiểm thử một cách nhất quán, độc lập và có thể lặp lại (Reproducible).

---

### 2. DANH MỤC TÀI KHOẢN VÀ PHÂN QUYỀN MẪU (SEED ACCOUNTS)

Mọi mật khẩu kiểm thử được mã hóa thông qua Bcrypt với Salt Rounds = 10 (`$2a$10$...`).

| Tên Đăng Nhập (`ten_dang_nhap`) | Mật Khẩu Thô | Vai Trò (`vai_tro`) | Trạng Thái (`trang_thai`) | Email Giả Lập | Định Danh Người Dùng (`id` / `ung_vien_id`) | Mục Đích Sử Dụng Trong Test Case |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `admin` | `admin123` | `ADMIN` | `HOAT_DONG` | `admin@tuyendung.vn` | `uuid-admin-root-0001` | Kiểm thử toàn quyền Superuser, Quản lý tài khoản, Khoản chi, Safe Text-to-SQL. |
| `recruiter_linh` | `recruiter123` | `RECRUITER` | `HOAT_DONG` | `linh.hr@tuyendung.vn` | `uuid-recruiter-linh-0002` | Kiểm thử nghiệp vụ Tuyển dụng theo Scope, Lập lịch phỏng vấn, Đánh giá, AI Copilot. |
| `candidate_an` | `candidate123` | `CANDIDATE` | `HOAT_DONG` | `an.candidate@gmail.com`| `uuid-user-an-0003`<br>(`ung_vien_id`: `uv-an-0003`) | Kiểm thử Nộp đơn, Tra cứu hồ sơ/lịch cá nhân, Trợ lý AI ứng viên. |
| `candidate_binh` | `candidate123` | `CANDIDATE` | `HOAT_DONG` | `binh.dev@gmail.com` | `uuid-user-binh-0004`<br>(`ung_vien_id`: `uv-binh-0004`)| Kiểm thử kiểm tra bảo vệ dữ liệu cá nhân NĐ 13/2023 (Chặn An xem dữ liệu của Bình). |
| `locked_user` | `locked123` | `CANDIDATE` | `KHOA` | `locked@tuyendung.vn` | `uuid-user-locked-0005` | Kiểm thử chặn đăng nhập tài khoản bị khóa (HTTP 403 Forbidden). |

---

### 3. THÔNG SỐ CẤU HÌNH VÀ TOKEN XÁC THỰC

* **Khóa bí mật JWT (`JWT_SECRET`):** `bi_mat_jwt_tuyen_dung_ai_2026`
* **Thuật toán ký số:** `HS256`
* **Thời hạn hiệu lực:** `24h`
* **Cấu trúc Payload chuẩn:**
  ```json
  {
    "id": "uuid-user-an-0003",
    "ten_dang_nhap": "candidate_an",
    "email": "an.candidate@gmail.com",
    "vai_tro": "CANDIDATE",
    "ho_ten": "Nguyễn Văn An",
    "ung_vien_id": "uv-an-0003",
    "iat": 1727913600,
    "exp": 1728000000
  }
  ```
* **Header HTTP bắt buộc:** `Authorization: Bearer <jwt_token>`

---

### 4. DỮ LIỆU NỀN CƠ CẤU VÀ VỊ TRÍ TUYỂN DỤNG

#### A. Phòng Ban (`PhongBan`)
1. **Phòng Công Nghệ Thông Tin (IT):** `ma_phong_ban = 'PB_IT'`, `ten_phong_ban = 'Phòng Công Nghệ Thông Tin'`
2. **Phòng Nhân Sự (HR):** `ma_phong_ban = 'PB_HR'`, `ten_phong_ban = 'Phòng Nhân Sự'`
3. **Phòng Marketing (MKT):** `ma_phong_ban = 'PB_MKT'`, `ten_phong_ban = 'Phòng Marketing'`

#### B. Vị Trí Tuyển Dụng (`ViTriTuyenDung`)
1. **Senior Backend Engineer:**
   - `ma_vi_tri = 'VT_BACKEND_SR'`, `phong_ban_id = 'PB_IT'`
   - Yêu cầu: "Node.js, Express, Python, MySQL, Redis, RESTful API, Docker, Microservices, tối thiểu 3 năm kinh nghiệm."
   - Mức lương: 30.000.000 - 45.000.000 VNĐ.
2. **Kỹ Sư AI & RAG Specialist:**
   - `ma_vi_tri = 'VT_AI_RAG'`, `phong_ban_id = 'PB_IT'`
   - Yêu cầu: "Python, PyTorch, LangChain, Vector Database, RAG, Text-to-SQL, Prompt Engineering, kinh nghiệm triển khai LLM."
   - Mức lương: Lên tới 55.000.000 VNĐ.

#### C. Tin Tuyển Dụng (`TinTuyenDung`)
* `TIN_BACKEND_OPEN`: Trạng thái `DANG_TUYEN`, hạn nộp đến `2026-12-31` (Đang mở nhận hồ sơ).
* `TIN_CLOSED_PAST`: Trạng thái `DONG`, hạn nộp đã kết thúc `2026-08-01` (Dùng để kiểm thử chặn nộp hồ sơ vào tin đã đóng).

---

### 5. TẬP TIN MẪU PHỤC VỤ KIỂM THỬ UPLOAD & OCR (TEST FIXTURES)

Các file mẫu phục vụ kiểm thử module Hồ sơ CV (`05-candidate-profile-and-cv.md`):

| Tên Tệp Tin | Định Dạng | Dung Lượng | Nội Dung / Đặc Điểm Kỹ Thuật | Mục Đích Kiểm Thử |
| :--- | :---: | :---: | :--- | :--- |
| `cv_valid_backend.pdf` | `.pdf` | 150 KB | Chứa thông tin ứng viên, kỹ năng Node.js, Express, MySQL, 3 năm kinh nghiệm làm việc tại Viettel. | Luồng upload thành công, OCR trích xuất kỹ năng chuẩn, AI đối sánh điểm cao ($\ge 85$). |
| `cv_valid_ai.docx` | `.docx` | 220 KB | Chứa kỹ năng Python, LangChain, Vector DB, RAG, tốt nghiệp ĐH Bách Khoa. | Kiểm thử tính tương thích file Word (.docx), trích xuất văn bản tiếng Việt Unicode. |
| `cv_oversized_15mb.pdf` | `.pdf` | 15.2 MB | Tệp tin PDF nhúng hình ảnh dung lượng lớn vượt 10MB. | Kiểm thử bắt lỗi giới hạn dung lượng upload (HTTP 400 Payload Too Large). |
| `shell_malicious.php.pdf`| `.pdf` | 2 KB | Chứa mã thực thi PHP và kỹ thuật double extension nhằm bypass MIME check. | Kiểm thử rào chắn an ninh Magic Byte và phần mở rộng an toàn. |
| `corrupted_zero_byte.pdf`| `.pdf` | 0 Byte | Tệp tin rỗng không có header PDF hợp lệ. | Bắt lỗi file hỏng (Corrupted File Handling). |
| `cv_long_text_120k.pdf` | `.pdf` | 1.8 MB | Văn bản trích xuất dài 120.000 ký tự vượt ngưỡng 100k ký tự. | Kiểm thử hàm cắt tỉa `substring(0, 100000)` để ngăn ngừa cạn kiệt tài nguyên CSDL. |

---

### 6. QUY TẮC RESET VÀ LÀM SẠCH MÔI TRƯỜNG KIỂM THỬ (TEARDOWN)

Để đảm bảo các bài kiểm thử không bị ảnh hưởng chéo (Side-effect free):
1. **Trước mỗi Suite kiểm thử (BeforeEach / Setup):**
   - Gọi hàm `initDatabase()` trong `src/config/database.js` để nạp lại tập seed data chuẩn vào In-Memory Store.
   - Xóa sạch cache phiên hội thoại AI (`global.__candidateSessionCache.clear()`).
2. **Sau khi thực thi (AfterAll / Teardown):**
   - Dọn dẹp các tệp tin tạm trong thư mục `public/uploads/cv/test_*`.
   - Đóng các kết nối hoặc socket mở nếu có.
