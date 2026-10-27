-- =====================================================================
-- DỮ LIỆU MẪU (SEED DATA) - HỆ THỐNG QUẢN LÝ TUYỂN DỤNG AI
-- Gồm dữ liệu chuẩn cho 17 thực thể, đầy đủ tài khoản thử nghiệm:
-- 1. ADMIN: admin@tuyendungai.vn / MatKhau@123
-- 2. RECRUITER: recruiter@tuyendungai.vn / MatKhau@123
-- 3. CANDIDATE: ungvien.an@gmail.com / MatKhau@123
-- =====================================================================

USE `tuyendung_ai`;

SET FOREIGN_KEY_CHECKS = 0;

-- 1. PhongBan
INSERT INTO `PhongBan` (`id`, `ma_phong_ban`, `ten_phong_ban`, `mo_ta`, `nguoi_quan_ly_id`) VALUES
('e1000000-0000-0000-0000-000000000001', 'PB_IT', 'Phòng Công nghệ Thông tin', 'Phụ trách nghiên cứu, phát triển và vận hành hệ thống phần mềm AI & Cloud.', NULL),
('e1000000-0000-0000-0000-000000000002', 'PB_HR', 'Phòng Nhân sự & Đào tạo', 'Quản lý tuyển dụng, chế độ đãi ngộ và phát triển nhân tài toàn diện.', NULL),
('e1000000-0000-0000-0000-000000000003', 'PB_MKT', 'Phòng Marketing & Tăng trưởng', 'Phát triển thương hiệu tuyển dụng và mở rộng thị phần sản phẩm.', NULL);

-- 2. TaiKhoan (Mật khẩu hash của "MatKhau@123" dạng bcrypt)
-- Hash bcrypt tương thích: $2b$10$wE4IqfJq2kZ3iR0kPZ4A..XnF3n0B0pZ3dF8P/6z.WvL9wF3gq3qy hoặc chuỗi demo
INSERT INTO `TaiKhoan` (`id`, `ten_dang_nhap`, `mat_khau_hash`, `email`, `so_dien_thoai`, `ho_ten`, `vai_tro`, `trang_thai`, `phong_ban_id`, `avatar_url`) VALUES
('a0000000-0000-0000-0000-000000000001', 'admin', '$2a$10$X87oD0Q/j0FekYdZpS4rX.2zUvN4xUqPZ5Xm0P2.Z/3g9wF3gq3qy', 'admin@tuyendungai.vn', '0901234567', 'Nguyễn Quản Trị', 'ADMIN', 'HOAT_DONG', 'e1000000-0000-0000-0000-000000000002', 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150'),
('a0000000-0000-0000-0000-000000000002', 'recruiter_linh', '$2a$10$X87oD0Q/j0FekYdZpS4rX.2zUvN4xUqPZ5Xm0P2.Z/3g9wF3gq3qy', 'recruiter@tuyendungai.vn', '0912345678', 'Trần Thảo Linh', 'RECRUITER', 'HOAT_DONG', 'e1000000-0000-0000-0000-000000000002', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'),
('a0000000-0000-0000-0000-000000000003', 'recruiter_nam', '$2a$10$X87oD0Q/j0FekYdZpS4rX.2zUvN4xUqPZ5Xm0P2.Z/3g9wF3gq3qy', 'nam.recruiter@tuyendungai.vn', '0987654321', 'Lê Hoàng Nam', 'RECRUITER', 'HOAT_DONG', 'e1000000-0000-0000-0000-000000000002', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150'),
('a0000000-0000-0000-0000-000000000004', 'candidate_an', '$2a$10$X87oD0Q/j0FekYdZpS4rX.2zUvN4xUqPZ5Xm0P2.Z/3g9wF3gq3qy', 'ungvien.an@gmail.com', '0933112233', 'Phạm Quốc An', 'CANDIDATE', 'HOAT_DONG', NULL, 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150'),
('a0000000-0000-0000-0000-000000000005', 'candidate_mai', '$2a$10$X87oD0Q/j0FekYdZpS4rX.2zUvN4xUqPZ5Xm0P2.Z/3g9wF3gq3qy', 'mai.nguyen@gmail.com', '0944556677', 'Nguyễn Phương Mai', 'CANDIDATE', 'HOAT_DONG', NULL, 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150');

-- Cập nhật người quản lý phòng ban
UPDATE `PhongBan` SET `nguoi_quan_ly_id` = 'a0000000-0000-0000-0000-000000000001' WHERE `id` = 'e1000000-0000-0000-0000-000000000002';
UPDATE `PhongBan` SET `nguoi_quan_ly_id` = 'a0000000-0000-0000-0000-000000000002' WHERE `id` = 'e1000000-0000-0000-0000-000000000001';

-- 3. ViTriTuyenDung (Trạng thái MO, DONG, DA_LAP_DAY)
INSERT INTO `ViTriTuyenDung` (`id`, `phong_ban_id`, `ma_vi_tri`, `ten_vi_tri`, `mo_ta`, `yeu_cau`, `muc_luong_min`, `muc_luong_max`, `so_luong_can_tuyen`, `so_luong_da_tuyen`, `trang_thai`) VALUES
('b1000000-0000-0000-0000-000000000001', 'e1000000-0000-0000-0000-000000000001', 'VT_SE_SR', 'Senior Backend Engineer (Node.js/Python)', 
 'Thiết kế và triển khai kiến trúc backend phân tán, RESTful API và tích hợp mô hình AI/RAG cho hệ thống doanh nghiệp lớn.', 
 'Yêu cầu: Tối thiểu 3+ năm kinh nghiệm Node.js, Express, Python. Thành thạo cơ sở dữ liệu MySQL, Redis, tối ưu hóa truy vấn. Có hiểu biết về Docker, CI/CD và tích hợp OpenAI/Gemini API.', 
 25000000.00, 45000000.00, 2, 0, 'MO'),

('b1000000-0000-0000-0000-000000000002', 'e1000000-0000-0000-0000-000000000001', 'VT_AI_ENG', 'AI / RAG Engineer', 
 'Nghiên cứu ứng dụng LLM, xây dựng hệ thống Retrieval-Augmented Generation (RAG) và pipeline xử lý dữ liệu thông minh.', 
 'Yêu cầu: Thành thạo Python, LangChain, Vector Database, Prompt Engineering. Kinh nghiệm triển khai giải pháp Text-to-SQL và chống ảo giác (hallucination) cho LLM.', 
 30000000.00, 55000000.00, 1, 0, 'MO'),

('b1000000-0000-0000-0000-000000000003', 'e1000000-0000-0000-0000-000000000003', 'VT_MKT_SPEC', 'Chuyên viên Marketing Tuyển dụng', 
 'Xây dựng thương hiệu nhà tuyển dụng và tổ chức các sự kiện Job Fair.', 
 'Yêu cầu: 2 năm kinh nghiệm Employer Branding, sáng tạo nội dung truyền thông, kỹ năng giao tiếp tốt.', 
 15000000.00, 22000000.00, 1, 1, 'DA_LAP_DAY'),

('b1000000-0000-0000-0000-000000000004', 'e1000000-0000-0000-0000-000000000001', 'VT_FE_DEV', 'Frontend React Developer', 
 'Phát triển giao diện web portal responsive cho ứng viên và ban quản trị.', 
 'Yêu cầu: React.js, Tailwind CSS, TypeScript, hiểu biết về UX/UI và Responsive Web Design.', 
 18000000.00, 30000000.00, 2, 0, 'DONG');

-- 4. TinTuyenDung
INSERT INTO `TinTuyenDung` (`id`, `vi_tri_id`, `tieu_de`, `noi_dung`, `dia_diem`, `han_nop`, `nguoi_phu_trach_id`, `trang_thai`) VALUES
('c1000000-0000-0000-0000-000000000001', 'b1000000-0000-0000-0000-000000000001', 
 'Tuyển Gấp Senior Backend Engineer (Node.js/Python) - Thu Nhập Đến 45 Triệu', 
 'Chúng tôi tìm kiếm ứng viên đam mê công nghệ, có tư duy logic vững chắc, mong muốn làm việc trong môi trường phát triển AI tiên phong. Quyền lợi: Thưởng tháng 13++, du lịch hàng năm, gói bảo hiểm cao cấp.', 
 'Hà Nội (Hybrid)', '2026-11-30', 'a0000000-0000-0000-0000-000000000002', 'DANG_TUYEN'),

('c1000000-0000-0000-0000-000000000002', 'b1000000-0000-0000-0000-000000000002', 
 'Tuyển Kỹ Sư AI & RAG Specialist (Lương Tới 55 Triệu) - Thưởng Cổ Phần ESOP', 
 'Cơ hội dẫn dắt mảng RAG & Agentic Workflow cho nền tảng Smart Recruitment. Được cấp tài khoản GPU riêng biệt và làm việc cùng các chuyên gia hàng đầu.', 
 'Hà Nội / Remote', '2026-12-15', 'a0000000-0000-0000-0000-000000000002', 'DANG_TUYEN');

-- 5. UngVien
INSERT INTO `UngVien` (`id`, `tai_khoan_id`, `ho_ten`, `email`, `so_dien_thoai`, `dia_chi`, `ngay_sinh`, `link_linkedin`, `link_github`, `ky_nang_chinh`, `kinh_nghiem_nam`) VALUES
('u1000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000004', 'Phạm Quốc An', 'ungvien.an@gmail.com', '0933112233', 'Cầu Giấy, Hà Nội', '1996-05-12', 'https://linkedin.com/in/quocan-dev', 'https://github.com/quocan-backend', 'Node.js, Express, Python, MySQL, Redis, Docker, RESTful API, Gemini API', 4.5),
('u1000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000005', 'Nguyễn Phương Mai', 'mai.nguyen@gmail.com', '0944556677', 'Ba Đình, Hà Nội', '1998-08-20', 'https://linkedin.com/in/phuongmai-ai', 'https://github.com/phuongmai-data', 'Python, LangChain, Vector Database, RAG, Text-to-SQL, Prompt Engineering, PyTorch', 3.0),
('u1000000-0000-0000-0000-000000000003', NULL, 'Đỗ Văn Thành', 'thanh.do@outlook.com', '0977889900', 'Đống Đa, Hà Nội', '1999-10-05', 'https://linkedin.com/in/thanhdo-it', NULL, 'Java, Spring Boot, PostgreSQL, Docker', 2.0);

-- 6. HoSoCV
INSERT INTO `HoSoCV` (`id`, `ung_vien_id`, `ten_file`, `duong_dan_file`, `dinh_dang`, `dung_luong_bytes`, `vanBanTrichXuat`, `phien_ban`) VALUES
('h1000000-0000-0000-0000-000000000001', 'u1000000-0000-0000-0000-000000000001', 
 'CV_PhamQuocAn_SeniorBackend.pdf', '/uploads/cvs/CV_PhamQuocAn_SeniorBackend.pdf', 'pdf', 1450200, 
 'HỌ VÀ TÊN: PHẠM QUỐC AN\nEMAIL: ungvien.an@gmail.com | ĐT: 0933112233\nVỊ TRÍ ỨNG TUYỂN: Senior Backend Engineer\n\nTỔNG QUAN NĂNG LỰC:\n- 4.5 năm kinh nghiệm phát triển hệ thống backend hiệu năng cao bằng Node.js và Python.\n- Tối ưu hóa cơ sở dữ liệu quan hệ MySQL, PostgreSQL và kiến trúc cache phân tán Redis.\n- Triển khai microservices với Docker, Kubernetes và CI/CD GitHub Actions.\n- Tích hợp thành công mô hình ngôn ngữ lớn (LLM) OpenAI, Google Gemini vào quy trình nghiệp vụ.\n\nKINH NGHIỆM LÀM VIỆC:\n1. Senior Backend Developer - Công ty TechVina (2023 - Nay):\n- Xây dựng RESTful API phục vụ 500,000 người dùng hoạt động hàng tháng.\n- Tối ưu hóa thời gian phản hồi API từ 350ms xuống 65ms bằng Redis caching và indexing MySQL.\n- Đóng gói ứng dụng chạy container Docker chuẩn hóa môi trường phát triển.\n2. Backend Developer - Công ty F-Solution (2020 - 2023):\n- Phát triển module quản lý người dùng, phân quyền RBAC và tích hợp cổng thanh toán.\n- Viết test tự động đạt độ bao phủ mã 85%.\n\nKỸ NĂNG KỸ THUẬT:\n- Ngôn ngữ: JavaScript/TypeScript, Python, SQL\n- Frameworks: Node.js, Express, FastAPI\n- Cơ sở dữ liệu: MySQL, Redis, MongoDB\n- Công cụ & DevOps: Docker, Git, CI/CD, Postman, Linux\n- Ngoại ngữ: Tiếng Anh giao tiếp tốt (IELTS 7.0)', 1),

('h1000000-0000-0000-0000-000000000002', 'u1000000-0000-0000-0000-000000000002', 
 'CV_NguyenPhuongMai_AIEngineer.docx', '/uploads/cvs/CV_NguyenPhuongMai_AIEngineer.docx', 'docx', 980400, 
 'HỌ VÀ TÊN: NGUYỄN PHƯƠNG MAI\nEMAIL: mai.nguyen@gmail.com | ĐT: 0944556677\nVỊ TRÍ ỨNG TUYỂN: AI / RAG Engineer\n\nTÓM TẮT:\n- 3 năm nghiên cứu và ứng dụng Trí tuệ Nhân tạo (GenAI), Natural Language Processing (NLP).\n- Chuyên môn sâu về hệ thống RAG (Retrieval-Augmented Generation), Text-to-SQL và kiểm soát độ chính xác thông tin (Hallucination Mitigation).\n\nKINH NGHIỆM THỰC TẾ:\n- AI Engineer - AI Next Labs (2023 - Hiện tại):\n  + Thiết kế giải pháp RAG dựa trên LangChain và Milvus Vector DB cho khách hàng khối tài chính ngân hàng.\n  + Triển khai pipeline an toàn cho Text-to-SQL, ngăn chặn injection và lọc câu hỏi độc hại.\n  + Đánh giá độ tin cậy của mô hình qua RAGAS framework.\n\nKỸ NĂNG:\n- Ngôn ngữ: Python, SQL\n- AI / LLM: LangChain, LlamaIndex, OpenAI API, Gemini API, HuggingFace\n- Vector DB: Chroma, Pinecone, Qdrant\n- Khác: FastAPI, Docker, Prompt Engineering', 1);

-- 7. NguonTuyenDung
INSERT INTO `NguonTuyenDung` (`id`, `ten_nguon`, `loai_nguon`, `chi_phi_co_dinh`, `mo_ta`) VALUES
('s1000000-0000-0000-0000-000000000001', 'LinkedIn Recruiter', 'LINKEDIN', 8500000.00, 'Kênh tìm kiếm ứng viên cấp cao và chuyên gia công nghệ.'),
('s1000000-0000-0000-0000-000000000002', 'TopCV Premium', 'TOPCV', 5000000.00, 'Đăng tin tuyển dụng và tìm kiếm hồ sơ mở trên sàn TopCV.'),
('s1000000-0000-0000-0000-000000000003', 'Website Tuyển Dụng Công Ty', 'WEBSITE_CONG_TY', 0.00, 'Kênh ứng tuyển trực tiếp qua cổng thông tin nội bộ của doanh nghiệp.');

-- 8. LuotUngTuyen
-- Ứng viên An nộp tin Senior Backend (Trạng thái: DANG_PHONG_VAN)
INSERT INTO `LuotUngTuyen` (`id`, `tin_tuyen_dung_id`, `ung_vien_id`, `ho_so_cv_id`, `nguon_id`, `trang_thai`, `diem_danh_gia_tong`, `ghi_chu`) VALUES
('l1000000-0000-0000-0000-000000000001', 'c1000000-0000-0000-0000-000000000001', 'u1000000-0000-0000-0000-000000000001', 'h1000000-0000-0000-0000-000000000001', 's1000000-0000-0000-0000-000000000003', 'DANG_PHONG_VAN', 92.50, 'Hồ sơ kỹ thuật rất ấn tượng, AI đối sánh đạt điểm 94/100.'),
('l1000000-0000-0000-0000-000000000002', 'c1000000-0000-0000-0000-000000000002', 'u1000000-0000-0000-0000-000000000002', 'h1000000-0000-0000-0000-000000000002', 's1000000-0000-0000-0000-000000000001', 'MOI', NULL, 'Hồ sơ mới nộp, đang chờ HR rà soát vòng đầu.');

-- 9. LichPhongVan
INSERT INTO `LichPhongVan` (`id`, `luot_ung_tuyen_id`, `nguoi_phong_van_id`, `thoi_gian_bat_dau`, `thoi_gian_ket_thuc`, `hinh_thuc`, `dia_diem_hoac_link`, `trang_thai`, `ghi_chu`) VALUES
('m1000000-0000-0000-0000-000000000001', 'l1000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000002', 
 '2026-10-05 14:00:00', '2026-10-05 15:30:00', 'ONLINE', 'https://meet.google.com/xyz-recruitment-interview', 'LEN_LICH', 'Phỏng vấn chuyên môn kỹ thuật vòng 1 cùng Tech Lead.');

-- 10. DanhGiaPhongVan
INSERT INTO `DanhGiaPhongVan` (`id`, `lich_phong_van_id`, `nguoi_danh_gia_id`, `diem_chuyen_mon`, `diem_ky_nang_mem`, `diem_van_hoa`, `nhan_xet`, `de_xuat`) VALUES
('d1000000-0000-0000-0000-000000000001', 'm1000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000002', 
 9, 8, 9, 'Ứng viên trả lời trôi chảy các câu hỏi về Node.js event loop, caching Redis và thiết kế RESTful API an toàn. Phù hợp văn hóa công ty.', 'DAT');

-- 11. HoSoTiemNang
INSERT INTO `HoSoTiemNang` (`id`, `ung_vien_id`, `vi_tri_quan_tam_id`, `ky_nang_noi_bat`, `diem_tiem_nang`, `ghi_chu_talent_pool`) VALUES
('t1000000-0000-0000-0000-000000000001', 'u1000000-0000-0000-0000-000000000003', 'b1000000-0000-0000-0000-000000000001', 'Java Spring Boot, Microservices, CI/CD', 82.00, 'Ứng viên có nền tảng tốt, có thể cân nhắc cho đợt tuyển dụng quý sau.');

-- 12. ThongBao
INSERT INTO `ThongBao` (`id`, `nguoi_nhan_id`, `tieu_de`, `noi_dung`, `loai_thong_bao`, `trang_thai_gui`, `da_doc`) VALUES
('n1000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000004', 
 'Lời mời tham dự phỏng vấn vòng chuyên môn - Vị trí Senior Backend', 
 'Kính gửi bạn Phạm Quốc An, bạn đã vượt qua vòng sơ loại hồ sơ. Trân trọng mời bạn tham dự phỏng vấn trực tuyến vào lúc 14:00 ngày 05/10/2026.', 
 'LICH_PHONG_VAN', 'DA_GUI', FALSE),

('n1000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000002', 
 'Hồ sơ ứng tuyển mới: Nguyễn Phương Mai', 
 'Có 1 hồ sơ ứng tuyển mới vào vị trí AI / RAG Engineer.', 
 'HE_THONG', 'DA_GUI', TRUE);

-- 13. KetQuaAI
INSERT INTO `KetQuaAI` (`id`, `luot_ung_tuyen_id`, `ho_so_cv_id`, `loai_nghiep_vu`, `diem_phu_hop`, `du_lieu_dau_vao`, `ket_qua_json`, `prompt_da_dung`, `do_tin_cay`, `trang_thai_hop_le`) VALUES
('k1000000-0000-0000-0000-000000000001', 'l1000000-0000-0000-0000-000000000001', 'h1000000-0000-0000-0000-000000000001', 
 'DOI_SANH', 94.00, 
 '{"cv_id": "h1000000-0000-0000-0000-000000000001", "job_id": "b1000000-0000-0000-0000-000000000001"}', 
 '{"score": 94, "matched_skills": ["Node.js", "Express", "Python", "MySQL", "Redis", "Docker", "RESTful API", "LLM Integration"], "missing_skills": ["Kubernetes chuyên sâu"], "experience_years": 4.5, "justification": "Ứng viên có 4.5 năm kinh nghiệm thực tế đúng với yêu cầu tối thiểu 3 năm. Kỹ năng lập trình backend và tối ưu hóa DB rất phù hợp."}', 
 'Prompt: Đối sánh kỹ năng ứng viên dựa trên văn bản CV và yêu cầu công việc, không suy diễn.', 0.980, TRUE),

('k1000000-0000-0000-0000-000000000002', 'l1000000-0000-0000-0000-000000000001', 'h1000000-0000-0000-0000-000000000001', 
 'CAU_HOI', NULL, 
 '{"cv_id": "h1000000-0000-0000-0000-000000000001"}', 
 '{"questions": [{"category": "Technical", "question": "Bạn có thể giải thích chi tiết cách tối ưu truy vấn MySQL và chiến lược đánh index khi tải tăng cao?"}, {"category": "System Design", "question": "Cách bạn thiết kế cơ chế caching Redis để chống cache breakdown/stampede?"}, {"category": "Gap Validation", "question": "Kinh nghiệm của bạn trong việc đóng gói và điều phối container trên Kubernetes ở môi trường production thực tế là gì?"}]}', 
 'Prompt: Gợi ý 3 câu hỏi phỏng vấn bám sát kinh nghiệm và khoảng trống kỹ năng trong CV.', 0.950, TRUE);

-- 14. BaoCaoTuyenDung
INSERT INTO `BaoCaoTuyenDung` (`id`, `tieu_de`, `ky_bao_cao`, `tong_don_ung_tuyen`, `so_luot_phong_van`, `so_luot_dat`, `ty_le_chuyen_doi`, `chi_phi_trung_binh`, `du_lieu_chi_tiet`, `nguoi_lap_id`) VALUES
('r1000000-0000-0000-0000-000000000001', 
 'Báo cáo hiệu quả tuyển dụng Quý 3/2026', 'Q3-2026', 45, 18, 5, 27.78, 2700000.00, 
 '{"kenh_tuyen_dung": {"LinkedIn": 25, "TopCV": 15, "Website": 5}, "chi_phi_tong": 13500000, "thoi_gian_tuyen_tb_ngay": 18}', 
 'a0000000-0000-0000-0000-000000000001');

-- 15. SuKienTrangThai (Audit log trạng thái tuần tự)
INSERT INTO `SuKienTrangThai` (`id`, `luot_ung_tuyen_id`, `trang_thai_cu`, `trang_thai_moi`, `nguoi_thuc_hien_id`, `ly_do`, `thoi_gian`) VALUES
('e2000000-0000-0000-0000-000000000001', 'l1000000-0000-0000-0000-000000000001', 'KHOI_TAO', 'MOI', 'a0000000-0000-0000-0000-000000000004', 'Ứng viên nộp hồ sơ trực tuyến qua website công ty.', '2026-10-01 08:30:00'),
('e2000000-0000-0000-0000-000000000002', 'l1000000-0000-0000-0000-000000000001', 'MOI', 'DANG_PHONG_VAN', 'a0000000-0000-0000-0000-000000000002', 'Hồ sơ đạt tiêu chuẩn sơ loại, lên lịch phỏng vấn chuyên môn.', '2026-10-01 10:15:00');

-- 16. KhoanChi
INSERT INTO `KhoanChi` (`id`, `tin_tuyen_dung_id`, `nguon_id`, `ten_khoan_chi`, `so_tien`, `ngay_chi`, `hoa_don_url`, `nguoi_duyet_id`, `ghi_chu`) VALUES
('c2000000-0000-0000-0000-000000000001', 'c1000000-0000-0000-0000-000000000001', 's1000000-0000-0000-0000-000000000001', 
 'Chi phí đẩy tin LinkedIn Top Placement 30 ngày', 4500000.00, '2026-10-01', '/uploads/invoices/inv-001.pdf', 'a0000000-0000-0000-0000-000000000001', 'Đã thanh toán qua thẻ tín dụng công ty.'),

('c2000000-0000-0000-0000-000000000002', 'c1000000-0000-0000-0000-000000000002', 's1000000-0000-0000-0000-000000000002', 
 'Gói lọc hồ sơ ứng viên AI & Big Data TopCV', 3500000.00, '2026-10-01', '/uploads/invoices/inv-002.pdf', 'a0000000-0000-0000-0000-000000000001', 'Hóa đơn VAT điện tử lưu trữ kế toán.');

-- 17. TuongTac
INSERT INTO `TuongTac` (`id`, `ung_vien_id`, `nguoi_thuc_hien_id`, `loai_tuong_tac`, `noi_dung`, `thoi_gian`) VALUES
('i1000000-0000-0000-0000-000000000001', 'u1000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000002', 
 'EMAIL', 'Gửi thư mời phỏng vấn kỹ thuật và link Google Meet kèm tài liệu chuẩn bị.', '2026-10-01 11:00:00'),
('i1000000-0000-0000-0000-000000000002', 'u1000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000002', 
 'GOI_DIEN', 'Gọi điện xác nhận lịch hẹn 14:00 ngày 05/10/2026, ứng viên đã đồng ý.', '2026-10-01 11:30:00');

SET FOREIGN_KEY_CHECKS = 1;
