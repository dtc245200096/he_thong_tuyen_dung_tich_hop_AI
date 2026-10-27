import { v4 as uuidv4 } from 'uuid';
import { getStore } from '../config/database.js';

/**
 * F03: QUẢN LÝ TIN TUYỂN DỤNG
 * Kiểm soát phân quyền: Nhân viên tuyển dụng chỉ thao tác trong phạm vi được giao phụ trách
 */

export async function layDanhSachTin(req, res) {
  const store = getStore();
  const { trang_thai, scope_only } = req.query;
  const user = req.user;

  let list = store.TinTuyenDung.filter(t => t.deleted_at === null);

  // Nếu người dùng yêu cầu lọc theo phạm vi phụ trách của Recruiter
  if (user && user.vai_tro === 'RECRUITER' && scope_only === 'true') {
    list = list.filter(t => t.nguoi_phu_trach_id === user.id);
  }

  if (trang_thai) {
    list = list.filter(t => t.trang_thai === trang_thai);
  }

  // Kết hợp thông tin tên vị trí cho giao diện
  const result = list.map(t => {
    const viTri = store.ViTriTuyenDung.find(v => v.id === t.vi_tri_id);
    const recruiter = store.TaiKhoan.find(u => u.id === t.nguoi_phu_trach_id);
    return {
      ...t,
      ten_vi_tri: viTri ? viTri.ten_vi_tri : 'Chưa xác định',
      yeu_cau_vi_tri: viTri ? viTri.yeu_cau : '',
      ten_nguoi_phu_trach: recruiter ? recruiter.ho_ten : 'Chưa phân công'
    };
  });

  return res.status(200).json({ success: true, data: result });
}

export async function layChiTietTin(req, res) {
  const { id } = req.params;
  const store = getStore();
  const tin = store.TinTuyenDung.find(t => t.id === id && t.deleted_at === null);

  if (!tin) {
    return res.status(404).json({ success: false, message: 'Không tìm thấy tin tuyển dụng.' });
  }

  const viTri = store.ViTriTuyenDung.find(v => v.id === tin.vi_tri_id);
  const recruiter = store.TaiKhoan.find(u => u.id === tin.nguoi_phu_trach_id);

  return res.status(200).json({
    success: true,
    data: {
      ...tin,
      ten_vi_tri: viTri ? viTri.ten_vi_tri : '',
      yeu_cau_vi_tri: viTri ? viTri.yeu_cau : '',
      muc_luong_min: viTri ? viTri.muc_luong_min : 0,
      muc_luong_max: viTri ? viTri.muc_luong_max : 0,
      ten_nguoi_phu_trach: recruiter ? recruiter.ho_ten : ''
    }
  });
}

export async function taoTin(req, res) {
  const { vi_tri_id, ten_vi_tri, tieu_de, noi_dung, dia_diem, han_nop, nguoi_phu_trach_id } = req.body;
  const user = req.user;

  // Hỗ trợ cả ten_vi_tri (người dùng tự gõ) lẫn vi_tri_id
  const positionInput = (ten_vi_tri || vi_tri_id || '').trim();

  if (!positionInput || !tieu_de || !noi_dung || !han_nop) {
    return res.status(400).json({ success: false, message: 'Vui lòng cung cấp đầy đủ thông tin: vị trí tuyển dụng, tiêu đề, nội dung và hạn nộp.' });
  }

  const store = getStore();

  // Tìm vị trí theo ID hoặc theo tên vị trí (không phân biệt hoa/thường)
  let viTri = store.ViTriTuyenDung.find(v => 
    (v.id === positionInput || v.ten_vi_tri.toLowerCase() === positionInput.toLowerCase()) && 
    v.deleted_at === null
  );

  // Nếu vị trí nhập vào chưa có trong hệ thống, tự động khởi tạo vị trí mới
  if (!viTri) {
    const defaultDept = store.PhongBan.find(p => p.deleted_at === null) || { id: uuidv4() };
    const randomCode = 'VT_' + Math.random().toString(36).substring(2, 7).toUpperCase();

    viTri = {
      id: uuidv4(),
      phong_ban_id: defaultDept.id,
      ma_vi_tri: randomCode,
      ten_vi_tri: positionInput,
      yeu_cau: noi_dung.substring(0, 500) || `Yêu cầu kỹ năng cho vị trí ${positionInput}`,
      muc_luong_min: 15000000,
      muc_luong_max: 35000000,
      so_luong_can_tuyen: 1,
      so_luong_da_tuyen: 0,
      trang_thai: 'MO',
      created_at: new Date(),
      updated_at: new Date(),
      deleted_at: null
    };

    store.ViTriTuyenDung.push(viTri);
  }

  // Nếu người tạo là Recruiter, tự động gán mình là người phụ trách hoặc theo chỉ định của Admin
  const phuTrachId = user.vai_tro === 'ADMIN' ? (nguoi_phu_trach_id || user.id) : user.id;

  const tin = {
    id: uuidv4(),
    vi_tri_id: viTri.id,
    tieu_de,
    noi_dung,
    dia_diem: dia_diem || 'Hà Nội',
    han_nop,
    nguoi_phu_trach_id: phuTrachId,
    trang_thai: 'DANG_TUYEN',
    created_at: new Date(),
    updated_at: new Date(),
    deleted_at: null
  };

  store.TinTuyenDung.push(tin);
  return res.status(201).json({ 
    success: true, 
    message: 'Tạo tin tuyển dụng thành công.', 
    data: {
      ...tin,
      ten_vi_tri: viTri.ten_vi_tri
    } 
  });
}

export async function suaTin(req, res) {
  const { id } = req.params;
  const { tieu_de, noi_dung, dia_diem, han_nop, trang_thai } = req.body;
  const store = getStore();
  const tin = store.TinTuyenDung.find(t => t.id === id && t.deleted_at === null);

  if (!tin) {
    return res.status(404).json({ success: false, message: 'Không tìm thấy tin tuyển dụng.' });
  }

  // Đã qua middleware checkRecruiterScope kiểm tra quyền phụ trách
  if (tieu_de) tin.tieu_de = tieu_de;
  if (noi_dung) tin.noi_dung = noi_dung;
  if (dia_diem) tin.dia_diem = dia_diem;
  if (han_nop) tin.han_nop = han_nop;
  if (trang_thai) tin.trang_thai = trang_thai;
  tin.updated_at = new Date();

  return res.status(200).json({ success: true, message: 'Cập nhật tin tuyển dụng thành công.', data: tin });
}

export async function dongTin(req, res) {
  const { id } = req.params;
  const store = getStore();
  const tin = store.TinTuyenDung.find(t => t.id === id && t.deleted_at === null);

  if (!tin) {
    return res.status(404).json({ success: false, message: 'Không tìm thấy tin tuyển dụng.' });
  }

  tin.trang_thai = 'DONG';
  tin.updated_at = new Date();

  return res.status(200).json({
    success: true,
    message: 'Đã đóng tin tuyển dụng thành công.',
    data: tin
  });
}
