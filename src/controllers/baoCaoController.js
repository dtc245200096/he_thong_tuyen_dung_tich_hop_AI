import { v4 as uuidv4 } from 'uuid';
import { getStore } from '../config/database.js';

/**
 * F10: BÁO CÁO TUYỂN DỤNG & QUẢN LÝ KHOẢN CHI
 */

export async function layThongKeTongQuan(req, res) {
  const store = getStore();

  const activeApps = store.LuotUngTuyen.filter(a => a.deleted_at === null);
  const activePostings = store.TinTuyenDung.filter(t => t.deleted_at === null);
  const activePositions = store.ViTriTuyenDung.filter(v => v.deleted_at === null);
  const activeExpenses = store.KhoanChi.filter(k => k.deleted_at === null);

  const tongDon = activeApps.length;
  const soMoi = activeApps.filter(a => a.trang_thai === 'MOI').length;
  const soDangPv = activeApps.filter(a => a.trang_thai === 'DANG_PHONG_VAN').length;
  const soDat = activeApps.filter(a => a.trang_thai === 'DAT').length;
  const soKhongDat = activeApps.filter(a => a.trang_thai === 'KHONG_DAT').length;

  const tongChiPhi = activeExpenses.reduce((acc, curr) => acc + (parseFloat(curr.so_tien) || 0), 0);
  const tyLeChuyenDoi = tongDon > 0 ? parseFloat(((soDat / tongDon) * 100).toFixed(2)) : 0;
  const chiPhiTrungBinh = soDat > 0 ? Math.round(tongChiPhi / soDat) : 0;

  return res.status(200).json({
    success: true,
    data: {
      tong_vi_tri: activePositions.length,
      tong_tin_dang_tuyen: activePostings.filter(t => t.trang_thai === 'DANG_TUYEN').length,
      tong_don_ung_tuyen: tongDon,
      phan_bo_trang_thai: {
        MOI: soMoi,
        DANG_PHONG_VAN: soDangPv,
        DAT: soDat,
        KHONG_DAT: soKhongDat
      },
      tong_chi_phi: tongChiPhi,
      ty_le_chuyen_doi: tyLeChuyenDoi,
      chi_phi_trung_binh_ung_vien: chiPhiTrungBinh,
      khoan_chi_gan_day: activeExpenses.slice(-5)
    }
  });
}

export async function layDanhSachKhoanChi(req, res) {
  const store = getStore();
  const activeExpenses = store.KhoanChi.filter(k => k.deleted_at === null);
  const tinMap = Object.fromEntries(store.TinTuyenDung.map(t => [t.id, t.tieu_de]));
  const nguonMap = Object.fromEntries(store.NguonTuyenDung.map(n => [n.id, n.ten_nguon]));
  const userMap = Object.fromEntries(store.TaiKhoan.map(u => [u.id, u.ho_ten]));

  const data = activeExpenses.map(k => ({
    ...k,
    ten_tin: tinMap[k.tin_tuyen_dung_id] || null,
    ten_nguon: nguonMap[k.nguon_id] || null,
    ten_nguoi_duyet: userMap[k.nguoi_duyet_id] || 'Quản trị viên'
  })).sort((a, b) => new Date(b.ngay_chi || b.created_at) - new Date(a.ngay_chi || a.created_at));

  return res.status(200).json({
    success: true,
    data
  });
}

export async function taoKhoanChi(req, res) {
  const { tin_tuyen_dung_id, nguon_id, ten_khoan_chi, so_tien, ngay_chi, hoa_don_url, ghi_chu } = req.body;
  const user = req.user;

  if (!ten_khoan_chi || !so_tien || !ngay_chi) {
    return res.status(400).json({ success: false, message: 'Vui lòng cung cấp tên khoản chi, số tiền và ngày chi.' });
  }

  const store = getStore();
  const khoanChi = {
    id: uuidv4(),
    tin_tuyen_dung_id: tin_tuyen_dung_id || null,
    nguon_id: nguon_id || null,
    ten_khoan_chi,
    so_tien: parseFloat(so_tien),
    ngay_chi,
    hoa_don_url: hoa_don_url || '',
    nguoi_duyet_id: user ? user.id : 'a0000000-0000-0000-0000-000000000001',
    ghi_chu: ghi_chu || '',
    created_at: new Date(),
    updated_at: new Date(),
    deleted_at: null
  };

  store.KhoanChi.push(khoanChi);

  return res.status(201).json({
    success: true,
    message: 'Tạo khoản chi tuyển dụng thành công.',
    data: khoanChi
  });
}

export async function xoaKhoanChi(req, res) {
  const { id } = req.params;
  const store = getStore();
  const expense = store.KhoanChi.find(k => k.id === id && k.deleted_at === null);
  if (!expense) {
    return res.status(404).json({ success: false, message: 'Không tìm thấy khoản chi cần xóa.' });
  }

  expense.deleted_at = new Date();
  expense.updated_at = new Date();

  return res.status(200).json({
    success: true,
    message: 'Xóa khoản chi tuyển dụng thành công.'
  });
}
