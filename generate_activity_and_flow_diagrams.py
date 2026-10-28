# -*- coding: utf-8 -*-
"""
Script sinh 6 Sơ đồ hoạt động (Activity Diagrams) và 1 Sơ đồ luồng màn hình (Screen Flow Diagram)
chuẩn UML bằng Pillow, độ nét cao, kích thước vừa vặn trang in A4.
"""
import os
import sys

try:
    if hasattr(sys.stdout, 'reconfigure'):
        sys.stdout.reconfigure(encoding='utf-8')
    if hasattr(sys.stderr, 'reconfigure'):
        sys.stderr.reconfigure(encoding='utf-8')
except Exception:
    pass

from PIL import Image, ImageDraw, ImageFont

os.makedirs('docs_images', exist_ok=True)

try:
    font_title = ImageFont.truetype("arialbd.ttf", 16)
    font_bold = ImageFont.truetype("arialbd.ttf", 12)
    font_text = ImageFont.truetype("arial.ttf", 11)
    font_small = ImageFont.truetype("ariali.ttf", 10)
except Exception:
    font_title = font_bold = font_text = font_small = ImageFont.load_default()

def draw_arrow(draw, start, end, color="#475569", width=2, arrow_size=6):
    draw.line([start, end], fill=color, width=width)
    x1, y1 = start
    x2, y2 = end
    import math
    angle = math.atan2(y2 - y1, x2 - x1)
    p1 = (x2 - arrow_size * math.cos(angle - math.pi / 6), y2 - arrow_size * math.sin(angle - math.pi / 6))
    p2 = (x2 - arrow_size * math.cos(angle + math.pi / 6), y2 - arrow_size * math.sin(angle + math.pi / 6))
    draw.polygon([end, p1, p2], fill=color)

def draw_activity_diagram(filename, title, steps):
    """
    Vẽ sơ đồ hoạt động dạng dọc chuẩn UML.
    steps: list các tuple:
      - ('start', 'Bắt đầu')
      - ('action', 'Tên hành động', 'Chi tiết kỹ thuật')
      - ('decision', 'Điều kiện kiểm tra?', 'Đúng / Hợp lệ', 'Sai / Lỗi')
      - ('end', 'Kết thúc')
    """
    width = 750
    height = 580
    img = Image.new("RGB", (width, height), "#FFFFFF")
    draw = ImageDraw.Draw(img)

    # Header
    draw.rectangle([(0, 0), (width, 42)], fill="#1E3A8A")
    draw.text((width // 2, 21), title, fill="#FFFFFF", font=font_title, anchor="mm")

    # Start node
    cur_y = 65
    center_x = 320

    for idx, step in enumerate(steps):
        stype = step[0]
        if stype == 'start':
            # Vẽ hình tròn đặc màu đen
            draw.ellipse([(center_x - 12, cur_y), (center_x + 12, cur_y + 24)], fill="#1E293B", outline="#0F172A", width=2)
            draw.text((center_x + 22, cur_y + 12), step[1], fill="#1E293B", font=font_bold, anchor="lm")
            draw_arrow(draw, (center_x, cur_y + 24), (center_x, cur_y + 44))
            cur_y += 44

        elif stype == 'action':
            box_w = 340
            box_h = 44
            x0 = center_x - box_w // 2
            y0 = cur_y
            x1 = center_x + box_w // 2
            y1 = cur_y + box_h
            draw.rounded_rectangle([(x0, y0), (x1, y1)], radius=8, fill="#F0FDF4", outline="#16A34A", width=2)
            draw.text((center_x, y0 + 14), step[1], fill="#0F172A", font=font_bold, anchor="mm")
            if len(step) > 2 and step[2]:
                draw.text((center_x, y0 + 30), step[2], fill="#475569", font=font_small, anchor="mm")
            
            # Mũi tên xuống bước tiếp
            if idx < len(steps) - 1:
                draw_arrow(draw, (center_x, y1), (center_x, y1 + 22))
            cur_y += box_h + 22

        elif stype == 'decision':
            # Hình thoi quyết định
            cond_text = step[1]
            pass_label = step[2] if len(step) > 2 else "Hợp lệ"
            fail_label = step[3] if len(step) > 3 else "Không hợp lệ"
            
            rh_w = 80
            rh_h = 32
            pt_top = (center_x, cur_y)
            pt_right = (center_x + rh_w, cur_y + rh_h)
            pt_bottom = (center_x, cur_y + rh_h * 2)
            pt_left = (center_x - rh_w, cur_y + rh_h)

            draw.polygon([pt_top, pt_right, pt_bottom, pt_left], fill="#FEF3C7", outline="#D97706", width=2)
            draw.text((center_x, cur_y + rh_h), cond_text, fill="#78350F", font=font_bold, anchor="mm")

            # Nhánh Đúng (Xuống)
            draw.text((center_x + 8, pt_bottom[1] + 8), f"[ {pass_label} ]", fill="#16A34A", font=font_small, anchor="lt")
            draw_arrow(draw, pt_bottom, (center_x, pt_bottom[1] + 24))

            # Nhánh Sai (Rẽ sang phải)
            fail_x = center_x + rh_w + 110
            draw.text((pt_right[0] + 6, pt_right[1] - 12), f"[ {fail_label} ]", fill="#DC2626", font=font_small, anchor="lb")
            draw.line([pt_right, (fail_x, pt_right[1])], fill="#DC2626", width=2)
            
            # Hộp xử lý lỗi bên phải
            err_box_h = 36
            err_box_w = 190
            draw.rounded_rectangle([(fail_x, pt_right[1] - err_box_h//2), (fail_x + err_box_w, pt_right[1] + err_box_h//2)], radius=6, fill="#FEF2F2", outline="#EF4444", width=2)
            err_msg = step[4] if len(step) > 4 else "Báo lỗi HTTP & Kết thúc"
            draw.text((fail_x + err_box_w//2, pt_right[1]), err_msg, fill="#991B1B", font=font_small, anchor="mm")
            
            # Nối từ lỗi về kết thúc
            draw_arrow(draw, (fail_x + err_box_w//2, pt_right[1] + err_box_h//2), (fail_x + err_box_w//2, height - 35))

            cur_y += rh_h * 2 + 24

        elif stype == 'end':
            # Vòng tròn đôi kết thúc
            draw.ellipse([(center_x - 14, cur_y), (center_x + 14, cur_y + 28)], fill="#FFFFFF", outline="#1E293B", width=2)
            draw.ellipse([(center_x - 9, cur_y + 5), (center_x + 9, cur_y + 23)], fill="#1E293B")
            draw.text((center_x + 24, cur_y + 14), step[1], fill="#1E293B", font=font_bold, anchor="lm")
            cur_y += 35

    # Viền ngoài
    draw.rectangle([(1, 1), (width - 2, height - 2)], outline="#CBD5E1", width=1)
    img.save(filename, quality=95)
    print(f"SUCCESS: Generated {filename}")

def generate_all_activity_diagrams():
    # 1. Login
    steps_login = [
        ('start', 'Người dùng bắt đầu'),
        ('action', 'Nhập Username / Email & Mật khẩu', 'Gửi POST /api/auth/login'),
        ('action', 'Truy vấn tài khoản trong CSDL', 'Kiểm tra deleted_at IS NULL & trạng thái HOAT_DONG'),
        ('decision', 'Tài khoản tồn tại?', 'Có', 'Không', 'Lỗi 401: Sai thông tin'),
        ('action', 'Kiểm tra mật khẩu bằng Bcrypt', 'bcrypt.compare(matKhau, matKhauHash)'),
        ('decision', 'Mật khẩu khớp?', 'Đúng', 'Sai', 'Lỗi 401: Mật khẩu không đúng'),
        ('action', 'Ký số Token JWT & Cấp quyền RBAC', 'Payload chứa userId, vai_tro, phong_ban_id'),
        ('action', 'Điều hướng về Dashboard theo vai trò', 'Admin, Recruiter hoặc Candidate'),
        ('end', 'Đăng nhập thành công')
    ]
    draw_activity_diagram("docs_images/act_01_login.png", "SƠ ĐỒ HOẠT ĐỘNG: ĐĂNG NHẬP & PHÂN QUYỀN (UC-01)", steps_login)

    # 2. Post Job
    steps_post_job = [
        ('start', 'Nhà tuyển dụng / Admin bắt đầu'),
        ('action', 'Chọn Vị trí tuyển dụng & Nhập thông tin tin đăng', 'Tiêu đề, nội dung JD, hạn nộp, phòng ban'),
        ('decision', 'Dữ liệu hợp lệ?', 'Hợp lệ', 'Thiếu trường', 'Lỗi 400: Thiếu thông tin bắt buộc'),
        ('action', 'Kiểm tra phân quyền phạm vi phụ trách', 'Recruiter chỉ được đăng cho phòng ban/vị trí được giao'),
        ('decision', 'Thuộc phạm vi?', 'Đúng quyền', 'Ngoài quyền', 'Lỗi 403: Không có quyền vị trí này'),
        ('action', 'Lưu bản ghi TinTuyenDung vào MySQL', 'Gắn nguoi_phu_trach_id, trạng thái DANG_TUYEN'),
        ('action', 'Ghi nhật ký hệ thống & Gửi thông báo', 'Tạo bản ghi ThongBao CHO_GUI'),
        ('end', 'Tin tuyển dụng hiển thị công khai')
    ]
    draw_activity_diagram("docs_images/act_02_post_job.png", "SƠ ĐỒ HOẠT ĐỘNG: ĐĂNG TIN TUYỂN DỤNG (UC-02)", steps_post_job)

    # 3. Apply CV & OCR
    steps_apply = [
        ('start', 'Ứng viên bắt đầu nộp hồ sơ'),
        ('action', 'Chọn Tin tuyển dụng & Tải tệp CV', 'Định dạng PDF/DOCX, dung lượng tối đa 10 MiB'),
        ('decision', 'Tệp tin hợp lệ?', 'Đúng chuẩn', 'Sai định dạng', 'Lỗi 400: Tệp quá lớn hoặc sai định dạng'),
        ('action', 'Kiểm tra chống nộp trùng lặp', 'Query LuotUngTuyen theo ung_vien_id + tin_tuyen_dung_id'),
        ('decision', 'Đã nộp trước đó?', 'Chưa nộp', 'Đã nộp', 'Lỗi 409: Bạn đã ứng tuyển vị trí này'),
        ('action', 'Lưu tệp đĩa & Bóc tách OCR trích xuất text', 'Lưu text vào vanBanTrichXuat trong bảng HoSoCV'),
        ('action', 'Tạo bản ghi LuotUngTuyen & Ghi vết trạng thái', 'Trạng thái ban đầu: MOI; ghi log SuKienTrangThai'),
        ('end', 'Nộp đơn thành công')
    ]
    draw_activity_diagram("docs_images/act_03_apply_cv.png", "SƠ ĐỒ HOẠT ĐỘNG: NỘP HỒ SƠ ỨNG TUYỂN & OCR (UC-03)", steps_apply)

    # 4. AI Matching
    steps_ai_match = [
        ('start', 'Recruiter bấm nút AI Đối sánh'),
        ('action', 'Hệ thống nạp văn bản CV (OCR) và JD', 'Kiểm soát Context Length <= 200.000 ký tự'),
        ('decision', 'Độ dài ngữ cảnh?', 'An toàn', 'Vượt 200k ký tự', 'Lỗi 400: CV quá dài vượt ngưỡng an toàn'),
        ('action', 'Gửi Prompt tới Google Gemini 2.5 Flash', 'Yêu cầu trích xuất JSON: điểm 0-100, kỹ năng khớp, thiếu'),
        ('decision', 'Gemini phản hồi?', 'Thành công', 'Timeout / Lỗi mạng', 'Kích hoạt Heuristic Matching Fallback'),
        ('action', 'Kiểm duyệt cấu trúc JSON bằng kiemTraHopLe()', 'Xác thực schema, loại bỏ ảo giác ngoài ngữ cảnh CV'),
        ('action', 'Lưu kết quả phân tích vào bảng KetQuaAI', 'loai_nghiep_vu = DOI_SANH; xếp hạng ứng viên'),
        ('end', 'Hiển thị điểm số & Phân tích minh bạch')
    ]
    draw_activity_diagram("docs_images/act_04_ai_matching.png", "SƠ ĐỒ HOẠT ĐỘNG: AI ĐỐI SÁNH NĂNG LỰC RAG (UC-04)", steps_ai_match)

    # 5. Interview Schedule
    steps_interview = [
        ('start', 'Recruiter lên lịch phỏng vấn'),
        ('action', 'Chọn ứng viên, thời gian & hình thức phỏng vấn', 'Online (Google Meet) hoặc Trực tiếp tại văn phòng'),
        ('action', 'Chuyển trạng thái sang DANG_PHONG_VAN', 'Chặn nhảy cóc trạng thái; ghi log SuKienTrangThai'),
        ('action', 'DichVuAI tự động phân tích gợi ý bộ câu hỏi', 'Tập trung vào điểm mạnh và khoảng trống kỹ năng của CV'),
        ('action', 'Lưu LichPhongVan & Đẩy email vào hàng đợi', 'Tạo ThongBao với trạng thái CHO_GUI'),
        ('action', 'DichVuEmail gửi thư mời tự động tới ứng viên', 'Cập nhật trạng thái email sang DA_GUI'),
        ('action', 'Sau phỏng vấn: Ghi nhận đánh giá 3 thang điểm', 'Chuyên môn, Kỹ năng mềm, Văn hóa (thang điểm 1-10)'),
        ('end', 'Hoàn tất quy trình phỏng vấn & Đánh giá')
    ]
    draw_activity_diagram("docs_images/act_05_interview_schedule.png", "SƠ ĐỒ HOẠT ĐỘNG: ĐIỀU PHỐI LỊCH PHỎNG VẤN & GỢI Ý CÂU HỎI (UC-05)", steps_interview)

    # 6. Safe Text-to-SQL
    steps_sql = [
        ('start', 'Quản trị viên đặt câu hỏi số liệu tiếng Việt'),
        ('action', 'Tầng 1: Security Filter lọc an ninh', 'Chặn Prompt Injection, cấm xin mật khẩu hash, cấm DROP/DELETE'),
        ('decision', 'Nội dung an toàn?', 'An toàn', 'Chứa từ khóa cấm', 'Chặn truy vấn & Cảnh báo an ninh'),
        ('action', 'Tầng 2: Intent Analyzer sinh câu lệnh SQL', 'Chỉ sinh câu lệnh SELECT trên 17 bảng thuộc Whitelist'),
        ('action', 'Tầng 3: Sandboxed Execution thực thi trên MySQL', 'Truy vấn dữ liệu thực, tự động thêm deleted_at IS NULL'),
        ('decision', 'Thực thi SQL?', 'Có dữ liệu', 'Lỗi cú pháp / Trống', 'Trả về thông báo dữ liệu không tồn tại'),
        ('action', 'DichVuAI định dạng câu trả lời ngôn ngữ tự nhiên', 'Đính kèm số liệu chính xác và câu lệnh SQL minh bạch'),
        ('action', 'Ghi nhật ký kiểm toán vào bảng KetQuaAI', 'loai_nghiep_vu = HOI_DAP'),
        ('end', 'Admin nhận báo cáo số liệu tức thì')
    ]
    draw_activity_diagram("docs_images/act_06_safe_text_to_sql.png", "SƠ ĐỒ HOẠT ĐỘNG: SAFE TEXT-TO-SQL ANALYTICS (UC-06)", steps_sql)

def generate_screen_flow_diagram():
    """
    Vẽ Sơ đồ luồng màn hình tổng quan (Screen Flow Diagram)
    """
    width = 900
    height = 540
    img = Image.new("RGB", (width, height), "#FFFFFF")
    draw = ImageDraw.Draw(img)

    # Header
    draw.rectangle([(0, 0), (width, 45)], fill="#1E3A8A")
    draw.text((width // 2, 22), "SƠ ĐỒ LUỒNG ĐIỀU HƯỚNG MÀN HÌNH TỔNG QUAN (SCREEN FLOW DIAGRAM)", fill="#FFFFFF", font=font_title, anchor="mm")

    # Màn hình Đăng nhập (Trung tâm bên trái)
    login_box = [(40, 180), (220, 310)]
    draw.rounded_rectangle(login_box, radius=10, fill="#EFF6FF", outline="#2563EB", width=3)
    draw.text((130, 205), "CỔNG XÁC THỰC", fill="#1E3A8A", font=font_bold, anchor="mm")
    draw.text((130, 230), "login.html", fill="#2563EB", font=font_bold, anchor="mm")
    draw.text((130, 255), "• Đăng nhập Bcrypt + JWT", fill="#475569", font=font_small, anchor="mm")
    draw.text((130, 275), "• Đăng ký tài khoản", fill="#475569", font=font_small, anchor="mm")
    draw.text((130, 295), "• Phân luồng theo vai trò", fill="#475569", font=font_small, anchor="mm")

    # Decision Node RBAC
    rbac_center = (330, 245)
    draw.polygon([(330, 205), (380, 245), (330, 285), (280, 245)], fill="#FEF3C7", outline="#D97706", width=2)
    draw.text(rbac_center, "Vai trò\n(RBAC)?", fill="#78350F", font=font_bold, anchor="mm")

    # Arrow Login -> RBAC
    draw_arrow(draw, (220, 245), (280, 245))

    # 3 Cổng Màn hình chính
    # 1. Admin Portal (Trên)
    admin_box = [(480, 65), (860, 185)]
    draw.rounded_rectangle(admin_box, radius=10, fill="#FEF2F2", outline="#DC2626", width=2)
    draw.text((670, 85), "QUẢN TRỊ VIÊN (ADMIN DASHBOARD) - admin.html", fill="#991B1B", font=font_bold, anchor="mm")
    draw.line([(490, 100), (850, 100)], fill="#FECACA", width=1)
    draw.text((500, 118), "• Tab 1: Tổng quan KPI & Phễu tuyển dụng thời gian thực", fill="#334155", font=font_text, anchor="lm")
    draw.text((500, 138), "• Tab 2: Quản trị tài khoản (F14) & Phân quyền phòng ban (F02)", fill="#334155", font=font_text, anchor="lm")
    draw.text((500, 158), "• Tab 3: Quản lý khoản chi (F10) & Hỏi đáp Safe Text-to-SQL (F12)", fill="#334155", font=font_text, anchor="lm")

    # 2. Recruiter Portal (Giữa)
    rec_box = [(480, 210), (860, 330)]
    draw.rounded_rectangle(rec_box, radius=10, fill="#F0FDF4", outline="#16A34A", width=2)
    draw.text((670, 230), "NHÂN VIÊN TUYỂN DỤNG (RECRUITER) - recruiter.html", fill="#166534", font=font_bold, anchor="mm")
    draw.line([(490, 245), (850, 245)], fill="#BBF7D0", width=1)
    draw.text((500, 263), "• Tab 1: Quản lý Vị trí (F02) & Đăng tin tuyển dụng (F03)", fill="#334155", font=font_text, anchor="lm")
    draw.text((500, 283), "• Tab 2: Danh sách hồ sơ & AI Đối sánh CV-JD RAG (F11)", fill="#334155", font=font_text, anchor="lm")
    draw.text((500, 303), "• Tab 3: Lên lịch phỏng vấn, AI gợi ý câu hỏi & Chấm điểm (F07)", fill="#334155", font=font_text, anchor="lm")

    # 3. Candidate Portal (Dưới)
    cand_box = [(480, 355), (860, 475)]
    draw.rounded_rectangle(cand_box, radius=10, fill="#EFF6FF", outline="#2563EB", width=2)
    draw.text((670, 375), "CỔNG ỨNG VIÊN (CANDIDATE PORTAL) - candidate.html", fill="#1E40AF", font=font_bold, anchor="mm")
    draw.line([(490, 390), (850, 390)], fill="#BFDBFE", width=1)
    draw.text((500, 408), "• Tab 1: Khám phá cơ hội việc làm & Nộp hồ sơ tải CV (F04-05)", fill="#334155", font=font_text, anchor="lm")
    draw.text((500, 428), "• Tab 2: Theo dõi lịch sử & Tiến độ xét duyệt đơn ứng tuyển (F06)", fill="#334155", font=font_text, anchor="lm")
    draw.text((500, 448), "• Tab 3: Chatbot Trợ lý AI Hướng nghiệp chuẩn STAR 24/7 (F13)", fill="#334155", font=font_text, anchor="lm")

    # Mũi tên từ RBAC tới 3 cổng
    draw_arrow(draw, (380, 245), (480, 125), color="#DC2626")
    draw.text((410, 160), "ADMIN", fill="#DC2626", font=font_bold, anchor="mm")

    draw_arrow(draw, (380, 245), (480, 270), color="#16A34A")
    draw.text((430, 245), "RECRUITER", fill="#16A34A", font=font_bold, anchor="mm")

    draw_arrow(draw, (380, 245), (480, 415), color="#2563EB")
    draw.text((410, 350), "CANDIDATE", fill="#2563EB", font=font_bold, anchor="mm")

    # Luồng Đăng xuất
    draw.line([(860, 125), (885, 125), (885, 505), (130, 505), (130, 310)], fill="#94A3B8", width=2)
    draw.text((500, 515), "Nút 'Đăng xuất' (Logout) -> Xóa JWT Token khỏi localStorage -> Điều hướng về login.html", fill="#64748B", font=font_small, anchor="mm")

    # Viền ngoài
    draw.rectangle([(1, 1), (width - 2, height - 2)], outline="#CBD5E1", width=1)
    img.save("docs_images/screen_flow_diagram.png", quality=95)
    print("SUCCESS: Generated docs_images/screen_flow_diagram.png")

if __name__ == "__main__":
    generate_all_activity_diagrams()
    generate_screen_flow_diagram()
