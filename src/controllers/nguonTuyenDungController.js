import { v4 as uuidv4 } from 'uuid';
import { getStore } from '../config/database.js';

/**
 * F08: QUẢN LÝ NGUỒN TUYỂN DỤNG & HỒ SƠ TIỀM NĂNG (TALENT POOL)
 */

export async function layDanhSachNguon(req, res) {
  const store = getStore();
  const list = store.NguonTuyenDung.filter(n => n.deleted_at === null);
  return res.status(200).json({ success: true, data: list });
}

export async function taoNguon(req, res) {
  const { ten_nguon, loai_nguon, chi_phi_co_dinh, mo_ta } = req.body;
  if (!ten_nguon) {
    return res.status(400).json({ success: false, message: 'Tên nguồn tuyển dụng không được để trống.' });
  }

  const store = getStore();
  const nguon = {
    id: uuidv4(),
    ten_nguon,
    loai_nguon: loai_nguon || 'WEBSITE_CONG_TY',
    chi_phi_co_dinh: parseFloat(chi_phi_co_dinh) || 0,
    mo_ta: mo_ta || '',
    created_at: new Date(),
    updated_at: new Date(),
    deleted_at: null
  };

  store.NguonTuyenDung.push(nguon);
  return res.status(201).json({ success: true, message: 'Tạo nguồn tuyển dụng thành công.', data: nguon });
}

export async function layTalentPool(req, res) {
  const store = getStore();
  const list = store.HoSoTiemNang.filter(t => t.deleted_at === null);

  const result = list.map(item => {
    const ungVien = store.UngVien.find(u => u.id === item.ung_vien_id);
    const viTri = store.ViTriTuyenDung.find(v => v.id === item.vi_tri_quan_tam_id);
    return {
      ...item,
      ho_ten: ungVien ? ungVien.ho_ten : 'N/A',
      email: ungVien ? ungVien.email : 'N/A',
      so_dien_thoai: ungVien ? ungVien.so_dien_thoai : 'N/A',
      ten_vi_tri: viTri ? viTri.ten_vi_tri : 'Chung'
    };
  });

  return res.status(200).json({ success: true, data: result });
}

export async function luuVaoTalentPool(req, res) {
  const { ung_vien_id, vi_tri_quan_tam_id, ky_nang_noi_bat, diem_tiem_nang, ghi_chu_talent_pool } = req.body;
  if (!ung_vien_id || !ky_nang_noi_bat) {
    return res.status(400).json({ success: false, message: 'Vui lòng cung cấp ung_vien_id và ky_nang_noi_bat.' });
  }

  const store = getStore();
  const hoSo = {
    id: uuidv4(),
    ung_vien_id,
    vi_tri_quan_tam_id: vi_tri_quan_tam_id || null,
    ky_nang_noi_bat,
    diem_tiem_nang: parseFloat(diem_tiem_nang) || 85.00,
    ghi_chu_talent_pool: ghi_chu_talent_pool || '',
    created_at: new Date(),
    updated_at: new Date(),
    deleted_at: null
  };

  store.HoSoTiemNang.push(hoSo);
  return res.status(201).json({ success: true, message: 'Đã lưu ứng viên vào Talent Pool thành công.', data: hoSo });
}
