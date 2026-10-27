import express from 'express';
import {
  authenticateToken,
  requireRoles,
  checkRecruiterScope,
  checkCandidateOwnership
} from '../middleware/auth.js';
import { handleUploadCV } from '../middleware/upload.js';

// Import Controllers
import * as authController from '../controllers/authController.js';
import * as phongBanController from '../controllers/phongBanController.js';
import * as tinTuyenDungController from '../controllers/tinTuyenDungController.js';
import * as hoSoCvController from '../controllers/hoSoCvController.js';
import * as luotUngTuyenController from '../controllers/luotUngTuyenController.js';
import * as lichPhongVanController from '../controllers/lichPhongVanController.js';
import * as nguonTuyenDungController from '../controllers/nguonTuyenDungController.js';
import * as thongBaoController from '../controllers/thongBaoController.js';
import * as baoCaoController from '../controllers/baoCaoController.js';
import * as aiController from '../controllers/aiController.js';
import * as taiKhoanController from '../controllers/taiKhoanController.js';

const router = express.Router();

// =====================================================================
// F01: AUTHENTICATION & PROFILE
// =====================================================================
router.post('/auth/login', authController.dangNhap);
router.post('/auth/register', authController.dangKy);
router.get('/auth/me', authenticateToken, authController.thongTinCaNhan);

// =====================================================================
// F02: PHÒNG BAN & VỊ TRÍ TUYỂN DỤNG (MO, DONG, DA_LAP_DAY)
// =====================================================================
router.get('/phong-ban', phongBanController.layDanhSachPhongBan);
router.post('/phong-ban', authenticateToken, requireRoles('ADMIN'), phongBanController.taoPhongBan);

router.get('/vi-tri', phongBanController.layDanhSachViTri);
router.post('/vi-tri', authenticateToken, requireRoles('ADMIN', 'RECRUITER'), phongBanController.taoViTri);
router.patch('/vi-tri/:id/trang-thai', authenticateToken, requireRoles('ADMIN', 'RECRUITER'), phongBanController.capNhatTrangThaiViTri);

// =====================================================================
// F03: TIN TUYỂN DỤNG (Kiểm soát phạm vi Recruiter)
// =====================================================================
router.get('/tin-tuyen-dung', tinTuyenDungController.layDanhSachTin);
router.get('/tin-tuyen-dung/:id', tinTuyenDungController.layChiTietTin);
router.post('/tin-tuyen-dung', authenticateToken, requireRoles('ADMIN', 'RECRUITER'), tinTuyenDungController.taoTin);
router.put('/tin-tuyen-dung/:id', authenticateToken, requireRoles('ADMIN', 'RECRUITER'), checkRecruiterScope, tinTuyenDungController.suaTin);
router.post('/tin-tuyen-dung/:id/dong-tin', authenticateToken, requireRoles('ADMIN', 'RECRUITER'), checkRecruiterScope, tinTuyenDungController.dongTin);

// =====================================================================
// F04: HỒ SƠ CV & TRÍCH XUẤT TEXT (OCR)
// =====================================================================
router.post('/ho-so-cv/upload', handleUploadCV, hoSoCvController.taiLenCV);
router.get('/ho-so-cv', authenticateToken, hoSoCvController.layDanhSachCV);

// =====================================================================
// F05 & F06: LƯỢT ỨNG TUYỂN & QUY TRÌNH CHUYỂN TRẠNG THÁI TUẦN TỰ
// =====================================================================
router.post('/luot-ung-tuyen', authenticateToken, luotUngTuyenController.nopDonUngTuyen);
router.get('/luot-ung-tuyen', authenticateToken, luotUngTuyenController.layDanhSachUngTuyen);
router.patch('/luot-ung-tuyen/:id/chuyen-trang-thai', authenticateToken, requireRoles('ADMIN', 'RECRUITER'), luotUngTuyenController.chuyenTrangThai);

// =====================================================================
// F07: LỊCH PHỎNG VẤN & ĐÁNH GIÁ (Ứng viên chỉ xem lịch của mình)
// =====================================================================
router.get('/lich-phong-van', authenticateToken, lichPhongVanController.layDanhSachLichPhongVan);
router.post('/lich-phong-van', authenticateToken, requireRoles('ADMIN', 'RECRUITER'), lichPhongVanController.taoLichPhongVan);
router.post('/lich-phong-van/danh-gia', authenticateToken, requireRoles('ADMIN', 'RECRUITER'), lichPhongVanController.danhGiaPhongVan);

// =====================================================================
// F08: NGUỒN TUYỂN DỤNG & TALENT POOL
// =====================================================================
router.get('/nguon-tuyen-dung', authenticateToken, nguonTuyenDungController.layDanhSachNguon);
router.post('/nguon-tuyen-dung', authenticateToken, requireRoles('ADMIN'), nguonTuyenDungController.taoNguon);
router.get('/talent-pool', authenticateToken, requireRoles('ADMIN', 'RECRUITER'), nguonTuyenDungController.layTalentPool);
router.post('/talent-pool', authenticateToken, requireRoles('ADMIN', 'RECRUITER'), nguonTuyenDungController.luuVaoTalentPool);

// =====================================================================
// F09: THÔNG BÁO & EMAIL (Vòng đời: CHO_GUI -> DA_GUI / LOI)
// =====================================================================
router.get('/thong-bao', authenticateToken, thongBaoController.layDanhSachThongBao);
router.post('/thong-bao/gui-email', authenticateToken, requireRoles('ADMIN', 'RECRUITER'), thongBaoController.guiEmailAPI);
router.patch('/thong-bao/danh-dau-tat-ca-da-doc', authenticateToken, thongBaoController.danhDauTatCaDaDoc);
router.patch('/thong-bao/:id/da-doc', authenticateToken, thongBaoController.danhDauDaDoc);
router.delete('/thong-bao/:id', authenticateToken, thongBaoController.xoaThongBao);

// =====================================================================
// F10: BÁO CÁO TUYỂN DỤNG & KHOẢN CHI
// =====================================================================
router.get('/bao-cao/tong-quan', authenticateToken, requireRoles('ADMIN', 'RECRUITER'), baoCaoController.layThongKeTongQuan);
router.get('/bao-cao/khoan-chi', authenticateToken, requireRoles('ADMIN', 'RECRUITER'), baoCaoController.layDanhSachKhoanChi);
router.post('/bao-cao/khoan-chi', authenticateToken, requireRoles('ADMIN'), baoCaoController.taoKhoanChi);
router.delete('/bao-cao/khoan-chi/:id', authenticateToken, requireRoles('ADMIN'), baoCaoController.xoaKhoanChi);

// =====================================================================
// F11 - F13: MODULE AI SERVICES & SAFE TEXT-TO-SQL
// =====================================================================
router.post('/ai/doi-sanh', authenticateToken, requireRoles('ADMIN', 'RECRUITER'), aiController.doiSanhCV);
router.post('/ai/goi-y-cau-hoi', authenticateToken, requireRoles('ADMIN', 'RECRUITER'), aiController.goiYCauHoi);
router.post('/ai/sinh-bao-cao', authenticateToken, requireRoles('ADMIN', 'RECRUITER'), aiController.sinhBaoCaoAI);
router.post('/ai/hoi-dap', authenticateToken, requireRoles('ADMIN', 'RECRUITER'), aiController.hoiDapTextToSql);
router.post('/ai/tro-ly-ung-vien', authenticateToken, aiController.troLyUngVien);

// =====================================================================
// F14: QUẢN LÝ TÀI KHOẢN & PHÂN QUYỀN (DÀNH CHO ADMIN)
// =====================================================================
router.get('/tai-khoan', authenticateToken, requireRoles('ADMIN'), taiKhoanController.layDanhSachTaiKhoan);
router.post('/tai-khoan', authenticateToken, requireRoles('ADMIN'), taiKhoanController.taoTaiKhoan);
router.patch('/tai-khoan/:id/vai-tro', authenticateToken, requireRoles('ADMIN'), taiKhoanController.capNhatVaiTro);
router.patch('/tai-khoan/:id/trang-thai', authenticateToken, requireRoles('ADMIN'), taiKhoanController.khoaMoKhoaTaiKhoan);
router.delete('/tai-khoan/:id', authenticateToken, requireRoles('ADMIN'), taiKhoanController.xoaTaiKhoan);

export default router;
