import { getStore } from '../config/database.js';
import DichVuEmail from '../services/DichVuEmail.js';

/**
 * F09: HỆ THỐNG THÔNG BÁO & EMAIL
 * Quản lý vòng đời trạng thái: CHO_GUI -> DA_GUI hoặc LOI
 * Ứng viên chỉ xem được thông báo của chính mình
 */

export async function layDanhSachThongBao(req, res) {
  const user = req.user;
  if (!user) {
    return res.status(401).json({ success: false, message: 'Chưa đăng nhập.' });
  }

  const store = getStore();
  let list = store.ThongBao.filter(t => t.deleted_at === null);

  // Phân quyền: Ứng viên chỉ xem thông báo của chính mình
  if (user.vai_tro === 'CANDIDATE') {
    list = list.filter(t => t.nguoi_nhan_id === user.id);
  } else if (req.query.nguoi_nhan_id) {
    list = list.filter(t => t.nguoi_nhan_id === req.query.nguoi_nhan_id);
  }

  list.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

  return res.status(200).json({ success: true, data: list });
}

/**
 * API guiEmail: Gửi email cập nhật vòng đời CHO_GUI -> DA_GUI / LOI
 */
export async function guiEmailAPI(req, res) {
  try {
    const { nguoi_nhan_id, tieu_de, noi_dung, loai_thong_bao, simulate_error } = req.body;

    if (!nguoi_nhan_id || !tieu_de || !noi_dung) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng cung cấp nguoi_nhan_id, tieu_de và noi_dung.'
      });
    }

    const result = await DichVuEmail.guiEmail(
      nguoi_nhan_id,
      tieu_de,
      noi_dung,
      loai_thong_bao || 'EMAIL',
      { simulateError: !!simulate_error }
    );

    return res.status(result.success ? 200 : 500).json({
      success: result.success,
      message: result.message,
      trang_thai_gui: result.thong_bao.trang_thai_gui,
      data: result.thong_bao,
      error: result.error || null
    });
  } catch (error) {
    console.error('Lỗi API guiEmail:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
}

export async function danhDauDaDoc(req, res) {
  const { id } = req.params;
  const store = getStore();
  const thongBao = store.ThongBao.find(t => t.id === id && t.deleted_at === null);

  if (!thongBao) {
    return res.status(404).json({ success: false, message: 'Không tìm thấy thông báo.' });
  }

  thongBao.da_doc = true;
  thongBao.updated_at = new Date();

  return res.status(200).json({ success: true, message: 'Đã đánh dấu thông báo là đã đọc.', data: thongBao });
}

export async function danhDauTatCaDaDoc(req, res) {
  const user = req.user;
  if (!user) {
    return res.status(401).json({ success: false, message: 'Chưa đăng nhập.' });
  }

  const store = getStore();
  let count = 0;
  store.ThongBao.forEach(t => {
    if (t.nguoi_nhan_id === user.id && !t.da_doc && t.deleted_at === null) {
      t.da_doc = true;
      t.updated_at = new Date();
      count++;
    }
  });

  return res.status(200).json({
    success: true,
    message: `Đã đánh dấu ${count} thông báo là đã đọc.`,
    updated_count: count
  });
}

export async function xoaThongBao(req, res) {
  const { id } = req.params;
  const user = req.user;
  const store = getStore();
  const thongBao = store.ThongBao.find(t => t.id === id && t.deleted_at === null);

  if (!thongBao) {
    return res.status(404).json({ success: false, message: 'Không tìm thấy thông báo.' });
  }

  // Người nhận hoặc Admin mới được xóa
  if (user.vai_tro !== 'ADMIN' && thongBao.nguoi_nhan_id !== user.id) {
    return res.status(403).json({ success: false, message: 'Bạn không có quyền xóa thông báo này.' });
  }

  thongBao.deleted_at = new Date();
  return res.status(200).json({ success: true, message: 'Đã xóa thông báo.' });
}

