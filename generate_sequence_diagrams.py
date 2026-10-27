# -*- coding: utf-8 -*-
"""
Script vẽ 4 biểu đồ trình tự (Sequence Diagrams) nét cao chuẩn UML bằng Pillow.
Lưu vào thư mục docs_images/ để nhúng trực tiếp vào tệp Word và HTML.
"""

from PIL import Image, ImageDraw, ImageFont
import os

os.makedirs('docs_images', exist_ok=True)

# Khởi tạo font chữ hệ thống
try:
    font_title = ImageFont.truetype("arialbd.ttf", 20)
    font_box = ImageFont.truetype("arialbd.ttf", 14)
    font_msg = ImageFont.truetype("arial.ttf", 12)
    font_note = ImageFont.truetype("ariali.ttf", 11)
except:
    font_title = font_box = font_msg = font_note = ImageFont.load_default()

def draw_sequence_diagram(filename, title, actors, messages):
    """
    actors: [("Actor Name", x_pos), ...]
    messages: [(from_actor_idx, to_actor_idx, "Message text", is_return, y_pos), ...]
    """
    width = 900
    height = 560
    img = Image.new("RGB", (width, height), "#FFFFFF")
    draw = ImageDraw.Draw(img)

    # 1. Vẽ tiêu đề biểu đồ
    draw.rectangle([(0, 0), (width, 50)], fill="#1E3A8A")
    draw.text((width // 2, 25), title, fill="#FFFFFF", font=font_title, anchor="mm")

    # 2. Vẽ các Actor / Lifeline Boxes ở trên và dưới
    box_w = 140
    box_h = 36
    lifelines_x = []

    num_actors = len(actors)
    spacing = (width - 100) / (num_actors - 1) if num_actors > 1 else 0

    for i, actor in enumerate(actors):
        x = 50 + i * spacing
        lifelines_x.append(x)

        # Hộp trên
        draw.rectangle([(x - box_w//2, 70), (x + box_w//2, 70 + box_h)], fill="#F1F5F9", outline="#1E3A8A", width=2)
        draw.text((x, 70 + box_h//2), actor, fill="#1E3A8A", font=font_box, anchor="mm")

        # Đường lifeline đứt nét
        for y in range(70 + box_h + 10, height - 55, 10):
            draw.line([(x, y), (x, y + 5)], fill="#94A3B8", width=2)

        # Hộp dưới
        draw.rectangle([(x - box_w//2, height - 50), (x + box_w//2, height - 50 + box_h)], fill="#F1F5F9", outline="#1E3A8A", width=2)
        draw.text((x, height - 50 + box_h//2), actor, fill="#1E3A8A", font=font_box, anchor="mm")

    # 3. Vẽ các mũi tên thông điệp (Messages)
    for (src_idx, dst_idx, msg, is_return, y) in messages:
        x_src = lifelines_x[src_idx]
        x_dst = lifelines_x[dst_idx]

        # Khối kích hoạt (Activation box)
        draw.rectangle([(x_src - 4, y - 10), (x_src + 4, y + 10)], fill="#CBD5E1", outline="#64748B")
        draw.rectangle([(x_dst - 4, y - 10), (x_dst + 4, y + 10)], fill="#CBD5E1", outline="#64748B")

        arrow_color = "#0F766E" if not is_return else "#B91C1C"

        if is_return:
            # Mũi tên nét đứt phản hồi
            step = 6
            start_x, end_x = (x_src, x_dst) if x_src < x_dst else (x_dst, x_src)
            for curr_x in range(int(start_x), int(end_x), step * 2):
                draw.line([(curr_x, y), (min(curr_x + step, end_x), y)], fill=arrow_color, width=2)
        else:
            # Mũi tên nét liền gửi yêu cầu
            draw.line([(x_src, y), (x_dst, y)], fill=arrow_color, width=2)

        # Vẽ đầu mũi tên
        head_size = 6
        if x_dst > x_src:
            draw.polygon([(x_dst, y), (x_dst - head_size, y - 4), (x_dst - head_size, y + 4)], fill=arrow_color)
        else:
            draw.polygon([(x_dst, y), (x_dst + head_size, y - 4), (x_dst + head_size, y + 4)], fill=arrow_color)

        # Ghi nhãn thông điệp
        text_x = (x_src + x_dst) // 2
        draw.text((text_x, y - 12), msg, fill="#0F172A", font=font_msg, anchor="mm")

    # Viền ngoài
    draw.rectangle([(0, 0), (width - 1, height - 1)], outline="#CBD5E1", width=1)

    img.save(filename, "PNG")
    print(f"Generated: {filename}")

# =============================================================================
# BIỂU ĐỒ 1: ĐĂNG NHẬP & XÁC THỰC PHÂN QUYỀN RBAC (JWT)
# =============================================================================
actors_1 = ["Client UI", "authController", "bcrypt / Store", "TaiKhoan (DB)"]
msgs_1 = [
    (0, 1, "1. POST /api/auth/login {ten_dang_nhap, mat_khau}", False, 130),
    (1, 3, "2. SELECT * FROM TaiKhoan WHERE username = ?", False, 170),
    (3, 1, "3. Trả về thông tin user + mat_khau_hash", True, 210),
    (1, 2, "4. bcrypt.compare(mat_khau, hash)", False, 260),
    (2, 1, "5. Kết quả khớp mật khẩu (true / false)", True, 300),
    (1, 1, "6. Tạo Token JWT chứa role (ADMIN/RECRUITER/CANDIDATE)", False, 350),
    (1, 0, "7. HTTP 200 OK + {token, user, vai_tro}", True, 400),
    (0, 1, "8. GET /api/auth/me (Authorization: Bearer <Token>)", False, 440),
    (1, 0, "9. HTTP 200 OK: Trả về profile không chứa mật khẩu", True, 480)
]
draw_sequence_diagram("docs_images/seq_01_auth_jwt.png", "HÌNH 2.7: SƠ ĐỒ TRÌNH TỰ ĐĂNG NHẬP & XÁC THỰC PHÂN QUYỀN (JWT & RBAC)", actors_1, msgs_1)

# =============================================================================
# BIỂU ĐỒ 2: TIẾP NHẬN CV & GỌI AI ĐỐI SÁNH NĂNG LỰC (RAG CV MATCHING)
# =============================================================================
actors_2 = ["Ứng viên / HR", "hoSoCvController", "ocrParser", "DichVuAI", "KetQuaAI (DB)"]
msgs_2 = [
    (0, 1, "1. POST /api/ho-so-cv/upload (File PDF/DOCX <= 10MB)", False, 130),
    (1, 2, "2. Trích xuất text từ CV (Buffer)", False, 170),
    (2, 1, "3. Trả về vanBanTrichXuat (> 100k ký tự)", True, 210),
    (1, 0, "4. HTTP 201 Created: Lưu CV vào uploads/cvs/", True, 250),
    (0, 3, "5. POST /api/ai/doi-sanh {cv_id, tin_id}", False, 300),
    (3, 3, "6. phanTichVaDoiSanh(cvText, jdText, yeuCau)", False, 340),
    (3, 3, "7. kiemTraHopLe() kiểm tra schema & chống ảo giác", False, 380),
    (3, 4, "8. Ghi bản ghi đối sánh vào KetQuaAI (Score, Matched, Missing)", False, 420),
    (4, 3, "9. Xác nhận lưu kết quả thành công", True, 460),
    (3, 0, "10. HTTP 200 OK: Trả về Match Score (0-100) & Kỹ năng", True, 490)
]
draw_sequence_diagram("docs_images/seq_02_cv_ai_matching.png", "HÌNH 2.8: SƠ ĐỒ TRÌNH TỰ TIẾP NHẬN CV & GỌI AI ĐỐI SÁNH NĂNG LỰC", actors_2, msgs_2)

# =============================================================================
# BIỂU ĐỒ 3: LÊN LỊCH PHỎNG VẤN & GỢI Ý CÂU HỎI BẰNG AI
# =============================================================================
actors_3 = ["Recruiter", "lichPhongVanController", "DichVuAI", "ThongBao (Email)", "LichPhongVan (DB)"]
msgs_3 = [
    (0, 1, "1. POST /api/lich-phong-van {luot_ung_tuyen_id, thoi_gian, link}", False, 130),
    (1, 4, "2. Ghi bản ghi lịch hẹn mới (trang_thai = LEN_LICH)", False, 175),
    (4, 1, "3. Xác nhận tạo lịch thành công", True, 215),
    (1, 2, "4. goiYCauHoiPhongVan(cvText, jdText)", False, 260),
    (2, 1, "5. Trả về bộ câu hỏi 3 nhóm: Chuyên môn, CSDL, Gap", True, 305),
    (1, 3, "6. guiEmail() thông báo ứng viên (vòng đời CHO_GUI -> DA_GUI)", False, 355),
    (3, 1, "7. Xác nhận email đã gửi đi thành công", True, 400),
    (1, 0, "8. HTTP 201 Created: Lịch phỏng vấn + Bộ câu hỏi gợi ý", True, 445),
    (0, 1, "9. POST /api/lich-phong-van/danh-gia (Điểm 3 thang: 1-10)", False, 480)
]
draw_sequence_diagram("docs_images/seq_03_interview_ai_questions.png", "HÌNH 2.9: SƠ ĐỒ TRÌNH TỰ LÊN LỊCH PHỎNG VẤN & GỢI Ý CÂU HỎI AI", actors_3, msgs_3)

# =============================================================================
# BIỂU ĐỒ 4: THỐNG KÊ & HỎI ĐÁP ĐIỀU HÀNH SAFE TEXT-TO-SQL
# =============================================================================
actors_4 = ["Quản trị viên (Admin)", "aiController", "Security Sandbox", "DichVuAI (SQL Engine)", "MySQL DB"]
msgs_4 = [
    (0, 1, "1. POST /api/ai/hoi-dap {cau_hoi: 'Tổng chi phí tuyển dụng tháng này?'}", False, 130),
    (1, 2, "2. Tầng 1: Security Filter (Chặn injection, cấm xin password, cấm DROP/DELETE)", False, 175),
    (2, 3, "3. Tầng 2: Intent Analyzer sinh SQL SELECT chuẩn hóa", False, 220),
    (3, 3, "4. Whitelist Checker: Kiểm tra 17 bảng được phép truy vấn", False, 265),
    (3, 4, "5. Tầng 3: Execute SELECT query (Lọc deleted_at IS NULL)", False, 315),
    (4, 3, "6. Trả về tập dữ liệu thô (Raw Aggregates)", True, 360),
    (3, 1, "7. Định dạng ngôn ngữ tự nhiên tiếng Việt có số liệu kiểm chứng", True, 410),
    (1, 4, "8. Lưu vết tương tác vào KetQuaAI (loai_nghiep_vu = HOI_DAP)", False, 455),
    (1, 0, "9. HTTP 200 OK: Trả về câu trả lời tự nhiên + SQL an toàn", True, 495)
]
draw_sequence_diagram("docs_images/seq_04_text_to_sql_analytics.png", "HÌNH 2.10: SƠ ĐỒ TRÌNH TỰ THỐNG KÊ & HỎI ĐÁP ĐIỀU HÀNH SAFE TEXT-TO-SQL", actors_4, msgs_4)

print("Hoàn thành vẽ 4 biểu đồ trình tự chuẩn UML!")
