import { v4 as uuidv4 } from 'uuid';
import { getStore } from '../config/database.js';

/**
 * F02: QUẢN LÝ PHÒNG BAN & VỊ TRÍ TUYỂN DỤNG
 * Bảng ViTriTuyenDung quản lý các trạng thái: MO, DONG, DA_LAP_DAY
 */

export async function layDanhSachPhongBan(req, res) {
  const store = getStore();
  const list = store.PhongBan.filter(p => p.deleted_at === null);
  return res.status(200).json({ success: true, data: list });
}

export async function taoPhongBan(req, res) {
  const { ma_phong_ban, ten_phong_ban, mo_ta, nguoi_quan_ly_id } = req.body;
  if (!ma_phong_ban || !ten_phong_ban) {
    return res.status(400).json({ success: false, message: 'Thiếu mã hoặc tên phòng ban.' });
  }

  const store = getStore();
  const existing = store.PhongBan.find(p => p.ma_phong_ban === ma_phong_ban && p.deleted_at === null);
  if (existing) {
    return res.status(409).json({ success: false, message: 'Mã phòng ban đã tồn tại.' });
  }

  const pb = {
    id: uuidv4(),
    ma_phong_ban,
    ten_phong_ban,
    mo_ta: mo_ta || '',
    nguoi_quan_ly_id: nguoi_quan_ly_id || null,
    created_at: new Date(),
    updated_at: new Date(),
    deleted_at: null
  };

  store.PhongBan.push(pb);
  return res.status(201).json({ success: true, message: 'Tạo phòng ban thành công.', data: pb });
}

export async function layDanhSachViTri(req, res) {
  const store = getStore();
  const { trang_thai, phong_ban_id } = req.query;

  let list = store.ViTriTuyenDung.filter(v => v.deleted_at === null);

  if (trang_thai) {
    list = list.filter(v => v.trang_thai === trang_thai);
  }
  if (phong_ban_id) {
    list = list.filter(v => v.phong_ban_id === phong_ban_id);
  }

  return res.status(200).json({ success: true, data: list });
}

export async function taoViTri(req, res) {
  const { phong_ban_id, ma_vi_tri, ten_vi_tri, mo_ta, yeu_cau, muc_luong_min, muc_luong_max, so_luong_can_tuyen } = req.body;
  
  if (!phong_ban_id || !ma_vi_tri || !ten_vi_tri || !yeu_cau) {
    return res.status(400).json({ success: false, message: 'Vui lòng cung cấp đầy đủ thông tin vị trí và yêu cầu tuyển dụng.' });
  }

  const store = getStore();
  const existing = store.ViTriTuyenDung.find(v => v.ma_vi_tri === ma_vi_tri && v.deleted_at === null);
  if (existing) {
    return res.status(409).json({ success: false, message: 'Mã vị trí đã tồn tại.' });
  }

  const viTri = {
    id: uuidv4(),
    phong_ban_id,
    ma_vi_tri,
    ten_vi_tri,
    mo_ta: mo_ta || '',
    yeu_cau,
    muc_luong_min: muc_luong_min || 0,
    muc_luong_max: muc_luong_max || 0,
    so_luong_can_tuyen: so_luong_can_tuyen || 1,
    so_luong_da_tuyen: 0,
    trang_thai: 'MO', // Mặc định là MO
    created_at: new Date(),
    updated_at: new Date(),
    deleted_at: null
  };

  store.ViTriTuyenDung.push(viTri);
  return res.status(201).json({ success: true, message: 'Tạo vị trí tuyển dụng thành công.', data: viTri });
}

export async function capNhatTrangThaiViTri(req, res) {
  const { id } = req.params;
  const { trang_thai } = req.body;

  const validStatuses = ['MO', 'DONG', 'DA_LAP_DAY'];
  if (!validStatuses.includes(trang_thai)) {
    return res.status(400).json({
      success: false,
      message: `Trạng thái không hợp lệ. Chỉ chấp nhận một trong các giá trị: ${validStatuses.join(', ')}.`
    });
  }

  const store = getStore();
  const viTri = store.ViTriTuyenDung.find(v => v.id === id && v.deleted_at === null);
  if (!viTri) {
    return res.status(404).json({ success: false, message: 'Không tìm thấy vị trí tuyển dụng.' });
  }

  viTri.trang_thai = trang_thai;
  viTri.updated_at = new Date();

  return res.status(200).json({
    success: true,
    message: `Đã cập nhật trạng thái vị trí tuyển dụng thành '${trang_thai}'.`,
    data: viTri
  });
}
