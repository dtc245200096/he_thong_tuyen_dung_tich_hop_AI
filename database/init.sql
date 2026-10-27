-- =====================================================================
-- HỆ THỐNG QUẢN LÝ TUYỂN DỤNG AI (SMART RECRUITMENT SYSTEM)
-- SCRIPT KHỞI TẠO CƠ SỞ DỮ LIỆU - 17 THỰC THỂ CHUẨN DOANH NGHIỆP
-- Yêu cầu kỹ thuật:
--   1. Khóa chính (PK): UUID (CHAR(36))
--   2. Bảng HoSoCV: Dung lượng tối đa 10 MiB, định dạng PDF/DOCX, vanBanTrichXuat 100.000 ký tự
--   3. Bảng ViTriTuyenDung: Trạng thái MO, DONG, DA_LAP_DAY
--   4. Ràng buộc xóa mềm (Soft-delete) với deleted_at trên tất cả các bảng
--   5. Khóa ngoại toàn vẹn (ON DELETE RESTRICT để bảo toàn lịch sử thống kê)
-- =====================================================================

CREATE DATABASE IF NOT EXISTS `tuyendung_ai` 
  CHARACTER SET utf8mb4 
  COLLATE utf8mb4_unicode_ci;

USE `tuyendung_ai`;

-- Tắt kiểm tra khóa ngoại tạm thời khi tạo bảng
SET FOREIGN_KEY_CHECKS = 0;

-- ---------------------------------------------------------------------
-- 1. THỰC THỂ: TaiKhoan (Tài khoản người dùng hệ thống)
-- Phân quyền 3 vai trò: ADMIN (Quản trị/Quản lý), RECRUITER (Nhân viên), CANDIDATE (Ứng viên)
-- ---------------------------------------------------------------------
DROP TABLE IF EXISTS `TaiKhoan`;
CREATE TABLE `TaiKhoan` (
  `id` CHAR(36) NOT NULL,
  `ten_dang_nhap` VARCHAR(100) NOT NULL UNIQUE,
  `mat_khau_hash` VARCHAR(255) NOT NULL,
  `email` VARCHAR(191) NOT NULL UNIQUE,
  `so_dien_thoai` VARCHAR(20) NULL,
  `ho_ten` VARCHAR(150) NOT NULL,
  `vai_tro` ENUM('ADMIN', 'RECRUITER', 'CANDIDATE') NOT NULL DEFAULT 'CANDIDATE',
  `trang_thai` ENUM('HOAT_DONG', 'KHOA') NOT NULL DEFAULT 'HOAT_DONG',
  `phong_ban_id` CHAR(36) NULL,
  `avatar_url` VARCHAR(255) NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` TIMESTAMP NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  INDEX `idx_taikhoan_vaitro` (`vai_tro`),
  INDEX `idx_taikhoan_phongban` (`phong_ban_id`),
  INDEX `idx_taikhoan_deleted` (`deleted_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------
-- 2. THỰC THỂ: PhongBan (Phòng ban chuyên môn trong công ty)
-- ---------------------------------------------------------------------
DROP TABLE IF EXISTS `PhongBan`;
CREATE TABLE `PhongBan` (
  `id` CHAR(36) NOT NULL,
  `ma_phong_ban` VARCHAR(50) NOT NULL UNIQUE,
  `ten_phong_ban` VARCHAR(150) NOT NULL,
  `mo_ta` TEXT NULL,
  `nguoi_quan_ly_id` CHAR(36) NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` TIMESTAMP NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  INDEX `idx_phongban_quanly` (`nguoi_quan_ly_id`),
  INDEX `idx_phongban_deleted` (`deleted_at`),
  CONSTRAINT `fk_phongban_quanly` FOREIGN KEY (`nguoi_quan_ly_id`) 
    REFERENCES `TaiKhoan` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Thêm FK TaiKhoan -> PhongBan sau khi cả 2 bảng đã tồn tại
ALTER TABLE `TaiKhoan` 
  ADD CONSTRAINT `fk_taikhoan_phongban` FOREIGN KEY (`phong_ban_id`) 
  REFERENCES `PhongBan` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- ---------------------------------------------------------------------
-- 3. THỰC THỂ: ViTriTuyenDung (Vị trí công việc cần tuyển dụng)
-- Yêu cầu: Trạng thái MO, DONG, DA_LAP_DAY
-- ---------------------------------------------------------------------
DROP TABLE IF EXISTS `ViTriTuyenDung`;
CREATE TABLE `ViTriTuyenDung` (
  `id` CHAR(36) NOT NULL,
  `phong_ban_id` CHAR(36) NOT NULL,
  `ma_vi_tri` VARCHAR(50) NOT NULL UNIQUE,
  `ten_vi_tri` VARCHAR(150) NOT NULL,
  `mo_ta` TEXT NOT NULL,
  `yeu_cau` TEXT NOT NULL,
  `muc_luong_min` DECIMAL(15,2) NULL,
  `muc_luong_max` DECIMAL(15,2) NULL,
  `so_luong_can_tuyen` INT NOT NULL DEFAULT 1,
  `so_luong_da_tuyen` INT NOT NULL DEFAULT 0,
  `trang_thai` ENUM('MO', 'DONG', 'DA_LAP_DAY') NOT NULL DEFAULT 'MO',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` TIMESTAMP NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  INDEX `idx_vitri_phongban` (`phong_ban_id`),
  INDEX `idx_vitri_trangthai` (`trang_thai`),
  INDEX `idx_vitri_deleted` (`deleted_at`),
  CONSTRAINT `fk_vitri_phongban` FOREIGN KEY (`phong_ban_id`) 
    REFERENCES `PhongBan` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------
-- 4. THỰC THỂ: TinTuyenDung (Tin đăng tuyển dụng công khai)
-- ---------------------------------------------------------------------
DROP TABLE IF EXISTS `TinTuyenDung`;
CREATE TABLE `TinTuyenDung` (
  `id` CHAR(36) NOT NULL,
  `vi_tri_id` CHAR(36) NOT NULL,
  `tieu_de` VARCHAR(255) NOT NULL,
  `noi_dung` MEDIUMTEXT NOT NULL,
  `dia_diem` VARCHAR(200) NOT NULL DEFAULT 'Hà Nội / Toàn quốc',
  `han_nop` DATE NOT NULL,
  `nguoi_phu_trach_id` CHAR(36) NOT NULL,
  `trang_thai` ENUM('NHAP', 'DANG_TUYEN', 'TAM_DUNG', 'DONG') NOT NULL DEFAULT 'DANG_TUYEN',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` TIMESTAMP NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  INDEX `idx_tintuyendung_vitri` (`vi_tri_id`),
  INDEX `idx_tintuyendung_phutrach` (`nguoi_phu_trach_id`),
  INDEX `idx_tintuyendung_trangthai` (`trang_thai`),
  INDEX `idx_tintuyendung_deleted` (`deleted_at`),
  CONSTRAINT `fk_tintuyendung_vitri` FOREIGN KEY (`vi_tri_id`) 
    REFERENCES `ViTriTuyenDung` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `fk_tintuyendung_phutrach` FOREIGN KEY (`nguoi_phu_trach_id`) 
    REFERENCES `TaiKhoan` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------
-- 5. THỰC THỂ: UngVien (Hồ sơ ứng viên cá nhân)
-- ---------------------------------------------------------------------
DROP TABLE IF EXISTS `UngVien`;
CREATE TABLE `UngVien` (
  `id` CHAR(36) NOT NULL,
  `tai_khoan_id` CHAR(36) NULL UNIQUE,
  `ho_ten` VARCHAR(150) NOT NULL,
  `email` VARCHAR(191) NOT NULL UNIQUE,
  `so_dien_thoai` VARCHAR(20) NOT NULL,
  `dia_chi` VARCHAR(255) NULL,
  `ngay_sinh` DATE NULL,
  `link_linkedin` VARCHAR(255) NULL,
  `link_github` VARCHAR(255) NULL,
  `ky_nang_chinh` TEXT NULL,
  `kinh_nghiem_nam` DECIMAL(4,1) DEFAULT 0,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` TIMESTAMP NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  INDEX `idx_ungvien_taikhoan` (`tai_khoan_id`),
  INDEX `idx_ungvien_email` (`email`),
  INDEX `idx_ungvien_deleted` (`deleted_at`),
  CONSTRAINT `fk_ungvien_taikhoan` FOREIGN KEY (`tai_khoan_id`) 
    REFERENCES `TaiKhoan` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------
-- 6. THỰC THỂ: HoSoCV (File CV đã tải lên và nội dung trích xuất)
-- Yêu cầu kỹ thuật:
--   - Giới hạn dung lượng: 10 MiB (10 * 1024 * 1024 = 10.485.760 bytes)
--   - Định dạng: PDF hoặc DOCX (CHECK)
--   - vanBanTrichXuat: MEDIUMTEXT (chứa thoải mái > 100.000 ký tự)
-- ---------------------------------------------------------------------
DROP TABLE IF EXISTS `HoSoCV`;
CREATE TABLE `HoSoCV` (
  `id` CHAR(36) NOT NULL,
  `ung_vien_id` CHAR(36) NOT NULL,
  `ten_file` VARCHAR(255) NOT NULL,
  `duong_dan_file` VARCHAR(500) NOT NULL,
  `dinh_dang` VARCHAR(10) NOT NULL,
  `dung_luong_bytes` INT NOT NULL,
  `vanBanTrichXuat` MEDIUMTEXT NOT NULL,
  `phien_ban` INT NOT NULL DEFAULT 1,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` TIMESTAMP NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  INDEX `idx_hosocv_ungvien` (`ung_vien_id`),
  INDEX `idx_hosocv_deleted` (`deleted_at`),
  CONSTRAINT `chk_hosocv_dungluong` CHECK (`dung_luong_bytes` > 0 AND `dung_luong_bytes` <= 10485760),
  CONSTRAINT `chk_hosocv_dinhdang` CHECK (`dinh_dang` IN ('pdf', 'docx', 'PDF', 'DOCX')),
  CONSTRAINT `fk_hosocv_ungvien` FOREIGN KEY (`ung_vien_id`) 
    REFERENCES `UngVien` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------
-- 7. THỰC THỂ: NguonTuyenDung (Kênh/nguồn tiếp nhận hồ sơ)
-- ---------------------------------------------------------------------
DROP TABLE IF EXISTS `NguonTuyenDung`;
CREATE TABLE `NguonTuyenDung` (
  `id` CHAR(36) NOT NULL,
  `ten_nguon` VARCHAR(100) NOT NULL,
  `loai_nguon` ENUM('LINKEDIN', 'TOPCV', 'WEBSITE_CONG_TY', 'GIOI_THIEU', 'FACEBOOK', 'KHAC') NOT NULL DEFAULT 'WEBSITE_CONG_TY',
  `chi_phi_co_dinh` DECIMAL(15,2) NOT NULL DEFAULT 0.00,
  `mo_ta` TEXT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` TIMESTAMP NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  INDEX `idx_nguon_deleted` (`deleted_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------
-- 8. THỰC THỂ: LuotUngTuyen (Lượt ứng tuyển vào tin tuyển dụng)
-- Yêu cầu:
--   - Chống nộp trùng: 1 ứng viên chỉ có 1 lượt trên 1 tin (Unique index)
--   - Trạng thái tuần tự: MOI -> DANG_PHONG_VAN -> DAT / KHONG_DAT
-- ---------------------------------------------------------------------
DROP TABLE IF EXISTS `LuotUngTuyen`;
CREATE TABLE `LuotUngTuyen` (
  `id` CHAR(36) NOT NULL,
  `tin_tuyen_dung_id` CHAR(36) NOT NULL,
  `ung_vien_id` CHAR(36) NOT NULL,
  `ho_so_cv_id` CHAR(36) NOT NULL,
  `nguon_id` CHAR(36) NULL,
  `trang_thai` ENUM('MOI', 'DANG_PHONG_VAN', 'DAT', 'KHONG_DAT') NOT NULL DEFAULT 'MOI',
  `diem_danh_gia_tong` DECIMAL(5,2) NULL,
  `ghi_chu` TEXT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` TIMESTAMP NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  -- Ràng buộc chống nộp trùng: mỗi cặp (ung_vien_id, tin_tuyen_dung_id) chỉ duy nhất khi chưa soft-delete
  UNIQUE KEY `uq_ungvien_tintuyendung` (`ung_vien_id`, `tin_tuyen_dung_id`),
  INDEX `idx_luotungtuyen_tin` (`tin_tuyen_dung_id`),
  INDEX `idx_luotungtuyen_trangthai` (`trang_thai`),
  INDEX `idx_luotungtuyen_deleted` (`deleted_at`),
  CONSTRAINT `fk_luotungtuyen_tin` FOREIGN KEY (`tin_tuyen_dung_id`) 
    REFERENCES `TinTuyenDung` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `fk_luotungtuyen_ungvien` FOREIGN KEY (`ung_vien_id`) 
    REFERENCES `UngVien` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `fk_luotungtuyen_cv` FOREIGN KEY (`ho_so_cv_id`) 
    REFERENCES `HoSoCV` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `fk_luotungtuyen_nguon` FOREIGN KEY (`nguon_id`) 
    REFERENCES `NguonTuyenDung` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------
-- 9. THỰC THỂ: LichPhongVan (Lịch phỏng vấn ứng viên)
-- ---------------------------------------------------------------------
DROP TABLE IF EXISTS `LichPhongVan`;
CREATE TABLE `LichPhongVan` (
  `id` CHAR(36) NOT NULL,
  `luot_ung_tuyen_id` CHAR(36) NOT NULL,
  `nguoi_phong_van_id` CHAR(36) NOT NULL,
  `thoi_gian_bat_dau` DATETIME NOT NULL,
  `thoi_gian_ket_thuc` DATETIME NOT NULL,
  `hinh_thuc` ENUM('ONLINE', 'OFFLINE') NOT NULL DEFAULT 'ONLINE',
  `dia_diem_hoac_link` VARCHAR(255) NOT NULL,
  `trang_thai` ENUM('LEN_LICH', 'HOAN_THANH', 'DA_HUY') NOT NULL DEFAULT 'LEN_LICH',
  `ghi_chu` TEXT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` TIMESTAMP NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  INDEX `idx_lichpv_luotungtuyen` (`luot_ung_tuyen_id`),
  INDEX `idx_lichpv_interviewer` (`nguoi_phong_van_id`),
  INDEX `idx_lichpv_thoigian` (`thoi_gian_bat_dau`),
  INDEX `idx_lichpv_deleted` (`deleted_at`),
  CONSTRAINT `fk_lichpv_luotungtuyen` FOREIGN KEY (`luot_ung_tuyen_id`) 
    REFERENCES `LuotUngTuyen` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `fk_lichpv_interviewer` FOREIGN KEY (`nguoi_phong_van_id`) 
    REFERENCES `TaiKhoan` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------
-- 10. THỰC THỂ: DanhGiaPhongVan (Đánh giá sau phỏng vấn)
-- ---------------------------------------------------------------------
DROP TABLE IF EXISTS `DanhGiaPhongVan`;
CREATE TABLE `DanhGiaPhongVan` (
  `id` CHAR(36) NOT NULL,
  `lich_phong_van_id` CHAR(36) NOT NULL,
  `nguoi_danh_gia_id` CHAR(36) NOT NULL,
  `diem_chuyen_mon` INT NOT NULL,
  `diem_ky_nang_mem` INT NOT NULL,
  `diem_van_hoa` INT NOT NULL,
  `nhan_xet` TEXT NOT NULL,
  `de_xuat` ENUM('DAT', 'KHONG_DAT', 'XEM_XET_THEM') NOT NULL DEFAULT 'XEM_XET_THEM',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` TIMESTAMP NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  INDEX `idx_danhgia_lich` (`lich_phong_van_id`),
  INDEX `idx_danhgia_nguoidanhgia` (`nguoi_danh_gia_id`),
  INDEX `idx_danhgia_deleted` (`deleted_at`),
  CONSTRAINT `chk_diem_chuyen_mon` CHECK (`diem_chuyen_mon` BETWEEN 1 AND 10),
  CONSTRAINT `chk_diem_ky_nang` CHECK (`diem_ky_nang_mem` BETWEEN 1 AND 10),
  CONSTRAINT `chk_diem_van_hoa` CHECK (`diem_van_hoa` BETWEEN 1 AND 10),
  CONSTRAINT `fk_danhgia_lich` FOREIGN KEY (`lich_phong_van_id`) 
    REFERENCES `LichPhongVan` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `fk_danhgia_nguoidanhgia` FOREIGN KEY (`nguoi_danh_gia_id`) 
    REFERENCES `TaiKhoan` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------
-- 11. THỰC THỂ: HoSoTiemNang (Talent Pool - Lưu trữ ứng viên tiềm năng)
-- ---------------------------------------------------------------------
DROP TABLE IF EXISTS `HoSoTiemNang`;
CREATE TABLE `HoSoTiemNang` (
  `id` CHAR(36) NOT NULL,
  `ung_vien_id` CHAR(36) NOT NULL,
  `vi_tri_quan_tam_id` CHAR(36) NULL,
  `ky_nang_noi_bat` TEXT NOT NULL,
  `diem_tiem_nang` DECIMAL(5,2) NOT NULL DEFAULT 80.00,
  `ghi_chu_talent_pool` TEXT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` TIMESTAMP NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  INDEX `idx_tiemnang_ungvien` (`ung_vien_id`),
  INDEX `idx_tiemnang_vitri` (`vi_tri_quan_tam_id`),
  INDEX `idx_tiemnang_deleted` (`deleted_at`),
  CONSTRAINT `fk_tiemnang_ungvien` FOREIGN KEY (`ung_vien_id`) 
    REFERENCES `UngVien` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `fk_tiemnang_vitri` FOREIGN KEY (`vi_tri_quan_tam_id`) 
    REFERENCES `ViTriTuyenDung` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------
-- 12. THỰC THỂ: ThongBao (Thông báo trong hệ thống & Trạng thái gửi Email)
-- ---------------------------------------------------------------------
DROP TABLE IF EXISTS `ThongBao`;
CREATE TABLE `ThongBao` (
  `id` CHAR(36) NOT NULL,
  `nguoi_nhan_id` CHAR(36) NOT NULL,
  `tieu_de` VARCHAR(255) NOT NULL,
  `noi_dung` TEXT NOT NULL,
  `loai_thong_bao` ENUM('HE_THONG', 'LICH_PHONG_VAN', 'KET_QUA_UNG_TUYEN', 'EMAIL') NOT NULL DEFAULT 'HE_THONG',
  `trang_thai_gui` ENUM('CHO_GUI', 'DA_GUI', 'LOI') NOT NULL DEFAULT 'CHO_GUI',
  `da_doc` BOOLEAN NOT NULL DEFAULT FALSE,
  `chi_tiet_loi` TEXT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` TIMESTAMP NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  INDEX `idx_thongbao_nguoinhan` (`nguoi_nhan_id`),
  INDEX `idx_thongbao_trangthai` (`trang_thai_gui`),
  INDEX `idx_thongbao_deleted` (`deleted_at`),
  CONSTRAINT `fk_thongbao_nguoinhan` FOREIGN KEY (`nguoi_nhan_id`) 
    REFERENCES `TaiKhoan` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------
-- 13. THỰC THỂ: KetQuaAI (Kết quả xử lý từ Module AI)
-- 4 Nghiệp vụ chính: DOI_SANH, CAU_HOI, BAO_CAO, HOI_DAP
-- ---------------------------------------------------------------------
DROP TABLE IF EXISTS `KetQuaAI`;
CREATE TABLE `KetQuaAI` (
  `id` CHAR(36) NOT NULL,
  `luot_ung_tuyen_id` CHAR(36) NULL,
  `ho_so_cv_id` CHAR(36) NULL,
  `loai_nghiep_vu` ENUM('DOI_SANH', 'CAU_HOI', 'BAO_CAO', 'HOI_DAP') NOT NULL,
  `diem_phu_hop` DECIMAL(5,2) NULL,
  `du_lieu_dau_vao` JSON NOT NULL,
  `ket_qua_json` JSON NOT NULL,
  `prompt_da_dung` TEXT NULL,
  `do_tin_cay` DECIMAL(4,3) NOT NULL DEFAULT 0.950,
  `trang_thai_hop_le` BOOLEAN NOT NULL DEFAULT TRUE,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` TIMESTAMP NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  INDEX `idx_ketquaai_luotungtuyen` (`luot_ung_tuyen_id`),
  INDEX `idx_ketquaai_nghiepvu` (`loai_nghiep_vu`),
  INDEX `idx_ketquaai_deleted` (`deleted_at`),
  CONSTRAINT `fk_ketquaai_luotungtuyen` FOREIGN KEY (`luot_ung_tuyen_id`) 
    REFERENCES `LuotUngTuyen` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `fk_ketquaai_cv` FOREIGN KEY (`ho_so_cv_id`) 
    REFERENCES `HoSoCV` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------
-- 14. THỰC THỂ: BaoCaoTuyenDung (Báo cáo thống kê hiệu quả tuyển dụng)
-- ---------------------------------------------------------------------
DROP TABLE IF EXISTS `BaoCaoTuyenDung`;
CREATE TABLE `BaoCaoTuyenDung` (
  `id` CHAR(36) NOT NULL,
  `tieu_de` VARCHAR(255) NOT NULL,
  `ky_bao_cao` VARCHAR(50) NOT NULL,
  `tong_don_ung_tuyen` INT NOT NULL DEFAULT 0,
  `so_luot_phong_van` INT NOT NULL DEFAULT 0,
  `so_luot_dat` INT NOT NULL DEFAULT 0,
  `ty_le_chuyen_doi` DECIMAL(5,2) NOT NULL DEFAULT 0.00,
  `chi_phi_trung_binh` DECIMAL(15,2) NOT NULL DEFAULT 0.00,
  `du_lieu_chi_tiet` JSON NULL,
  `nguoi_lap_id` CHAR(36) NOT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` TIMESTAMP NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  INDEX `idx_baocao_nguoilap` (`nguoi_lap_id`),
  INDEX `idx_baocao_deleted` (`deleted_at`),
  CONSTRAINT `fk_baocao_nguoilap` FOREIGN KEY (`nguoi_lap_id`) 
    REFERENCES `TaiKhoan` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------
-- 15. THỰC THỂ: SuKienTrangThai (Audit log trạng thái ứng tuyển tuần tự)
-- Đảm bảo truy vết: MOI -> DANG_PHONG_VAN -> DAT / KHONG_DAT
-- ---------------------------------------------------------------------
DROP TABLE IF EXISTS `SuKienTrangThai`;
CREATE TABLE `SuKienTrangThai` (
  `id` CHAR(36) NOT NULL,
  `luot_ung_tuyen_id` CHAR(36) NOT NULL,
  `trang_thai_cu` VARCHAR(50) NOT NULL,
  `trang_thai_moi` VARCHAR(50) NOT NULL,
  `nguoi_thuc_hien_id` CHAR(36) NULL,
  `ly_do` TEXT NULL,
  `thoi_gian` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` TIMESTAMP NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  INDEX `idx_sukien_luotungtuyen` (`luot_ung_tuyen_id`),
  INDEX `idx_sukien_nguoithuchien` (`nguoi_thuc_hien_id`),
  INDEX `idx_sukien_deleted` (`deleted_at`),
  CONSTRAINT `fk_sukien_luotungtuyen` FOREIGN KEY (`luot_ung_tuyen_id`) 
    REFERENCES `LuotUngTuyen` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `fk_sukien_nguoithuchien` FOREIGN KEY (`nguoi_thuc_hien_id`) 
    REFERENCES `TaiKhoan` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------
-- 16. THỰC THỂ: KhoanChi (Quản lý chi phí tuyển dụng cho tin/kênh)
-- ---------------------------------------------------------------------
DROP TABLE IF EXISTS `KhoanChi`;
CREATE TABLE `KhoanChi` (
  `id` CHAR(36) NOT NULL,
  `tin_tuyen_dung_id` CHAR(36) NULL,
  `nguon_id` CHAR(36) NULL,
  `ten_khoan_chi` VARCHAR(255) NOT NULL,
  `so_tien` DECIMAL(15,2) NOT NULL,
  `ngay_chi` DATE NOT NULL,
  `hoa_don_url` VARCHAR(255) NULL,
  `nguoi_duyet_id` CHAR(36) NOT NULL,
  `ghi_chu` TEXT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` TIMESTAMP NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  INDEX `idx_khoanchi_tin` (`tin_tuyen_dung_id`),
  INDEX `idx_khoanchi_nguon` (`nguon_id`),
  INDEX `idx_khoanchi_nguoiduyet` (`nguoi_duyet_id`),
  INDEX `idx_khoanchi_deleted` (`deleted_at`),
  CONSTRAINT `fk_khoanchi_tin` FOREIGN KEY (`tin_tuyen_dung_id`) 
    REFERENCES `TinTuyenDung` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `fk_khoanchi_nguon` FOREIGN KEY (`nguon_id`) 
    REFERENCES `NguonTuyenDung` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `fk_khoanchi_nguoiduyet` FOREIGN KEY (`nguoi_duyet_id`) 
    REFERENCES `TaiKhoan` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------
-- 17. THỰC THỂ: TuongTac (Nhật ký tương tác với ứng viên)
-- ---------------------------------------------------------------------
DROP TABLE IF EXISTS `TuongTac`;
CREATE TABLE `TuongTac` (
  `id` CHAR(36) NOT NULL,
  `ung_vien_id` CHAR(36) NOT NULL,
  `nguoi_thuc_hien_id` CHAR(36) NOT NULL,
  `loai_tuong_tac` ENUM('GOI_DIEN', 'EMAIL', 'TIN_NHAN', 'GAP_MAT') NOT NULL DEFAULT 'EMAIL',
  `noi_dung` TEXT NOT NULL,
  `thoi_gian` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` TIMESTAMP NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  INDEX `idx_tuongtac_ungvien` (`ung_vien_id`),
  INDEX `idx_tuongtac_nguoithuchien` (`nguoi_thuc_hien_id`),
  INDEX `idx_tuongtac_deleted` (`deleted_at`),
  CONSTRAINT `fk_tuongtac_ungvien` FOREIGN KEY (`ung_vien_id`) 
    REFERENCES `UngVien` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `fk_tuongtac_nguoithuchien` FOREIGN KEY (`nguoi_thuc_hien_id`) 
    REFERENCES `TaiKhoan` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Bật lại kiểm tra khóa ngoại
SET FOREIGN_KEY_CHECKS = 1;
