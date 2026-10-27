import { getStore } from '../config/database.js';
import DichVuAI from '../services/DichVuAI.js';

/**
 * F11 - F13: AI SERVICES CONTROLLER
 * Xử lý 4 nghiệp vụ:
 *   1. Phân tích đối sánh CV (DOI_SANH)
 *   2. Gợi ý câu hỏi phỏng vấn (CAU_HOI)
 *   3. Sinh báo cáo tổng hợp (BAO_CAO)
 *   4. Hỏi đáp ngôn ngữ tự nhiên an toàn Text-to-SQL (HOI_DAP)
 *
 * NGUYÊN TẮC BẢO MẬT:
 *   - AI KHÔNG ĐƯỢC PHÉP tự động thay đổi trạng thái tuyển dụng (LuotUngTuyen.trang_thai).
 *   - Tất cả kết quả phải qua kiểm tra tính hợp lệ kiemTraHopLe() trước khi ghi vào KetQuaAI.
 */

export async function doiSanhCV(req, res) {
  try {
    const { luot_ung_tuyen_id, ho_so_cv_id, tin_tuyen_dung_id } = req.body;

    const store = getStore();

    // 1. Tìm thông tin CV
    let cv = null;
    if (ho_so_cv_id) {
      cv = store.HoSoCV.find(c => c.id === ho_so_cv_id && c.deleted_at === null);
    } else if (luot_ung_tuyen_id) {
      const app = store.LuotUngTuyen.find(a => a.id === luot_ung_tuyen_id && a.deleted_at === null);
      if (app) {
        cv = store.HoSoCV.find(c => c.id === app.ho_so_cv_id && c.deleted_at === null);
      }
    }

    if (!cv || !cv.vanBanTrichXuat) {
      return res.status(400).json({
        success: false,
        message: 'Không tìm thấy hồ sơ CV hoặc nội dung văn bản trích xuất (vanBanTrichXuat) đang rỗng.'
      });
    }

    // 2. Tìm thông tin tin tuyển dụng & yêu cầu vị trí
    let tin = null;
    if (tin_tuyen_dung_id) {
      tin = store.TinTuyenDung.find(t => t.id === tin_tuyen_dung_id && t.deleted_at === null);
    } else if (luot_ung_tuyen_id) {
      const app = store.LuotUngTuyen.find(a => a.id === luot_ung_tuyen_id && a.deleted_at === null);
      if (app) {
        tin = store.TinTuyenDung.find(t => t.id === app.tin_tuyen_dung_id && t.deleted_at === null);
      }
    }

    let yeuCau = '';
    let noiDungTin = '';
    if (tin) {
      noiDungTin = tin.noi_dung;
      const viTri = store.ViTriTuyenDung.find(v => v.id === tin.vi_tri_id && v.deleted_at === null);
      if (viTri) {
        yeuCau = viTri.yeu_cau;
      }
    }

    // 3. Gọi AI phân tích và đối sánh không suy diễn (Anti-Hallucination)
    const ketQuaPhanTich = await DichVuAI.phanTichVaDoiSanh(cv.vanBanTrichXuat, noiDungTin, yeuCau);

    // 4. Lưu vào bảng KetQuaAI sau khi đã qua kiemTraHopLe()
    const savedRecord = await DichVuAI.luuKetQuaAI(luot_ung_tuyen_id, cv.id, ketQuaPhanTich);

    // Cập nhật điểm đánh giá tổng vào LuotUngTuyen (nhưng TUYỆT ĐỐI KHÔNG tự đổi trạng thái tuyển dụng)
    if (luot_ung_tuyen_id) {
      const app = store.LuotUngTuyen.find(a => a.id === luot_ung_tuyen_id);
      if (app) {
        app.diem_danh_gia_tong = ketQuaPhanTich.diem_phu_hop;
      }
    }

    return res.status(200).json({
      success: true,
      message: 'Đối sánh CV với yêu cầu tuyển dụng thành công (Đã qua kiểm định chống ảo giác).',
      data: savedRecord
    });
  } catch (error) {
    console.error('Lỗi phân tích đối sánh AI:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
}

export async function goiYCauHoi(req, res) {
  try {
    const { ho_so_cv_id, tin_tuyen_dung_id } = req.body;
    const store = getStore();

    const cv = store.HoSoCV.find(c => c.id === ho_so_cv_id && c.deleted_at === null);
    if (!cv) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy hồ sơ CV.' });
    }

    const tin = store.TinTuyenDung.find(t => t.id === tin_tuyen_dung_id && t.deleted_at === null);
    const viTri = tin ? store.ViTriTuyenDung.find(v => v.id === tin.vi_tri_id) : null;

    const ketQua = await DichVuAI.goiYCauHoiPhongVan(cv.vanBanTrichXuat, tin ? tin.noi_dung : '', viTri ? viTri.yeu_cau : '');

    return res.status(200).json({
      success: true,
      message: 'Gợi ý bộ câu hỏi phỏng vấn bám sát hồ sơ ứng viên thành công.',
      data: ketQua
    });
  } catch (error) {
    console.error('Lỗi gợi ý câu hỏi:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
}

export async function sinhBaoCaoAI(req, res) {
  try {
    const store = getStore();
    const activeApps = store.LuotUngTuyen.filter(a => a.deleted_at === null);
    const activeExpenses = store.KhoanChi.filter(k => k.deleted_at === null);

    const duLieu = {
      tong_don: activeApps.length,
      so_pv: activeApps.filter(a => ['DANG_PHONG_VAN', 'DAT', 'KHONG_DAT'].includes(a.trang_thai)).length,
      so_dat: activeApps.filter(a => a.trang_thai === 'DAT').length,
      tong_chi_phi: activeExpenses.reduce((acc, c) => acc + (parseFloat(c.so_tien) || 0), 0)
    };

    const ketQua = await DichVuAI.sinhBaoCao(duLieu);

    return res.status(200).json({
      success: true,
      message: 'Sinh báo cáo AI thành công.',
      data: ketQua
    });
  } catch (error) {
    console.error('Lỗi sinh báo cáo AI:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
}

/**
 * F12: Hỏi đáp dữ liệu tự nhiên qua Safe Text-to-SQL
 */
export async function hoiDapTextToSql(req, res) {
  try {
    const { cau_hoi } = req.body;
    const user = req.user;

    if (!cau_hoi) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng nhập câu hỏi phân tích dữ liệu tuyển dụng.'
      });
    }

    const ketQua = await DichVuAI.hoiDap(cau_hoi, user);

    // Lưu kết quả hỏi đáp vào KetQuaAI
    await DichVuAI.luuKetQuaAI(null, null, ketQua);

    return res.status(200).json({
      success: true,
      message: 'Hỏi đáp dữ liệu thành công qua Safe Text-to-SQL.',
      data: ketQua
    });
  } catch (error) {
    console.error('Lỗi hỏi đáp Text-to-SQL:', error);
    return res.status(400).json({
      success: false,
      error: 'SQL_SAFETY_VIOLATION_OR_ERROR',
      message: error.message
    });
  }
}

/**
 * Hỏi đáp Trợ lý AI dành riêng cho Ứng viên (Giao diện chat tự nhiên, không lộ code/SQL)
 */
export async function troLyUngVien(req, res) {
  try {
    const { cau_hoi } = req.body;
    const user = req.user;

    if (!cau_hoi || !cau_hoi.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng nhập câu hỏi để gửi cho trợ lý AI.'
      });
    }

    const ketQua = await DichVuAI.troLyUngVien(cau_hoi, user);

    return res.status(200).json({
      success: true,
      data: ketQua
    });
  } catch (error) {
    console.error('Lỗi trợ lý AI ứng viên:', error);
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
}

