# CÁC KHOẢNG TRỐNG KỸ THUẬT VÀ GIẢ ĐỊNH NGHIỆP VỤ (KNOWN GAPS & ASSUMPTIONS)

---

### 1. MỤC TIÊU TÀI LIỆU
Tài liệu **Khoảng trống Kỹ thuật & Giả định Nghiệp vụ** ghi nhận một cách trung thực, minh bạch các điểm khác biệt giữa yêu cầu lý thuyết và triển khai mã nguồn thực tế trong repository, các chức năng chưa được hiện thực hóa (Gaps), cũng như các giả định kỹ thuật được áp dụng trong quá trình xây dựng bộ Test Case.

---

### 2. DANH MỤC CÁC KHOẢNG TRỐNG CHỨC NĂNG (SYSTEM GAPS)

| STT | Khoảng Trống / Chức Năng | Hiện Trạng Triển Khai Trong Mã Nguồn | Tác Động Kiểm Thử & Đề Xuất Xử Lý |
| :---: | :--- | :--- | :--- |
| **GAP-01** | Quy trình Quên mật khẩu công khai (Forgot/Reset Password) | Chưa có router `POST /api/auth/quen-mat-khau` và luồng gửi OTP qua email cho người dùng tự phục hồi. | Được phân loại là **Not Implemented**. Kiểm thử tập trung vào việc Quản trị viên hỗ trợ cập nhật mật khẩu trực tiếp qua `PUT /api/tai-khoan/:id`. Đề xuất phát triển luồng Email OTP trong Sprint kế tiếp. |
| **GAP-02** | Khôi phục bản ghi đã xóa mềm (Restore Soft-deleted Records) | Các thực thể áp dụng soft-delete (`deleted_at = IS NOT NULL`) khi gọi DELETE, nhưng chưa có API endpoint `POST /.../:id/khoi-phuc` để đảo ngược. | Được ghi nhận là chủ đích thiết kế. Dữ liệu xóa mềm được giữ lại vĩnh viễn trong CSDL phục vụ thanh tra/kiểm toán (Audit Trail) và không thể truy cập lại qua các API GET thông thường. |
| **GAP-03** | Tự động đóng tin tuyển dụng hết hạn (Automated Expired Job Cronjob) | Hệ thống kiểm tra điều kiện `han_nop < NOW()` tại thời điểm ứng viên nộp hồ sơ, nhưng chưa có tiến trình nền (Scheduled Cronjob) tự động quét và chuyển `trang_thai = 'DONG'` đúng 00:00:00 hàng ngày. | Khi kiểm thử, cần kiểm tra logic chặn nộp hồ sơ dựa trên hàm so sánh thời gian thực. Đề xuất bổ sung cron job tự động cập nhật trạng thái tin tuyển dụng. |
| **GAP-04** | Lưu trữ lịch sử hội thoại AI dài hạn vào CSDL | Phiên hội thoại của Trợ lý AI Ứng viên hiện được lưu đệm trong bộ nhớ tạm thời (`global.__candidateSessionCache`). Khi server khởi động lại hoặc ứng viên đổi thiết bị, lịch sử chat trước đó sẽ được làm mới. | Test case xác minh tính toàn vẹn đa lượt (Multi-turn) trong phạm vi cùng một phiên làm việc. Đề xuất bổ sung bảng `HoiThoaiAI` nếu Product Owner yêu cầu xem lại lịch sử chat trên nhiều thiết bị. |
| **GAP-05** | Phân trang phía Server (Server-side Pagination) | Một số API danh sách (như `/api/ung-tuyen`, `/api/tai-khoan`) hiện trả về toàn bộ danh sách bản ghi hoạt động và thực hiện phân trang, tìm kiếm tại tầng JavaScript Frontend. | Đạt hiệu năng cực cao khi dữ liệu dưới 5.000 bản ghi. Đề xuất bổ sung tham số `?page=1&limit=20` kèm câu lệnh `LIMIT / OFFSET` khi quy mô dữ liệu vượt 10.000 bản ghi. |

---

### 3. CÁC GIẢ ĐỊNH KỸ THUẬT CỐT LÕI (TECHNICAL ASSUMPTIONS)

1. **Kiến Trúc Lưu Trữ Kép (Hybrid Dual-Database Compatibility):**
   - Repository được xây dựng với cấu trúc hỗ trợ cả CSDL MySQL vật lý (thông qua `mysql2/promise`) và In-Memory Store dự phòng (`global.__inMemoryStore`).
   - Mọi quy tắc nghiệp vụ, khóa chính UUID v4, kiểm tra khóa ngoại và trường xóa mềm `deleted_at` đều được đồng bộ nhất quán 100% giữa hai môi trường.
2. **Cơ Chế Phân Quyền Vai Trò (Hierarchical Role Assumption):**
   - Vai trò `ADMIN` sở hữu quyền Superuser và tự động kế thừa toàn bộ quyền hạn nghiệp vụ của `RECRUITER` và `CANDIDATE`.
   - Vai trò `RECRUITER` bắt buộc phải tuân thủ phân công phạm vi (Recruiter Scope) đối với các tin tuyển dụng và hồ sơ thuộc quyền quản lý.
3. **Tính Độc Lập Giữa Điểm AI và Trạng Thái Tuyển Dụng:**
   - Điểm số và lập luận của AI chỉ mang tính chất tham mưu hỗ trợ quyết định (Decision-support).
   - AI tuyệt đối không bao giờ được phép tự động chuyển đổi trạng thái hồ sơ tuyển dụng. Mọi sự thay đổi trạng thái tuyển dụng phải do con người phê duyệt và lưu vết `SuKienTrangThai`.
4. **Múi Giờ và Định Dạng Thời Gian:**
   - Giả định hệ thống hoạt động thống nhất theo múi giờ Việt Nam (`Asia/Ho_Chi_Minh` - GMT+7). Mọi mốc thời gian lưu trữ theo định dạng chuẩn ISO 8601 (`YYYY-MM-DDTHH:mm:ss.sssZ`).

---

### 4. NHỮNG ĐIỂM CẦN PRODUCT OWNER VÀ NHÓM PHÁT TRIỂN XÁC NHẬN

1. **Xác nhận về tính năng Quên mật khẩu:**
   - Đội ngũ phát triển cần xác nhận xem chức năng Quên mật khẩu qua Email OTP có nằm trong phạm vi phát hành (Release Scope) của phiên bản hiện tại hay được dời sang phiên bản sau.
2. **Xác nhận về việc tích hợp mô hình ngôn ngữ lớn (LLM External Provider):**
   - Hiện tại hệ thống đang sử dụng động cơ AI RAG & Safe Text-to-SQL nội bộ kết hợp chuẩn hóa kỹ năng tốc độ cao. Cần xác nhận xem có cần tích hợp thêm khóa API Google Gemini hoặc OpenAI để mở rộng khả năng sinh văn bản tự do hay không.
3. **Xác nhận về quy tắc chuyển trạng thái hồ sơ:**
   - Xác nhận quy tắc chuyển trạng thái hiện tại (`MOI` $\to$ `DANG_PHONG_VAN` $\to$ `DAT`/`KHONG_DAT`) đã đáp ứng đầy đủ quy trình của doanh nghiệp hay cần bổ sung thêm các trạng thái phụ như `CHO_PHONG_VAN_VONG_2` hoặc `TAM_HOAN`.
