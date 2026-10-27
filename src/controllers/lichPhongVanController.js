import { v4 as uuidv4 } from 'uuid';
import { getStore } from '../config/database.js';
import DichVuEmail from '../services/DichVuEmail.js';

/**
 * F07: QUẢN LÝ LỊCH PHỎNG VẤN & ĐÁNH GIÁ PHỎNG VẤN
 * Ứng viên chỉ xem được lịch phỏng vấn của chính mình
 */

export async function layDanhSachLichPhongVan(req, res) {
  const store = getStore();
  const user = req.user;

  let list = store.LichPhongVan.filter(l => l.deleted_at === null);

  // Phân quyền: Ứng viên chỉ xem lịch của chính mình
  if (user && user.vai_tro === 'CANDIDATE') {
    const myAppIds = store.LuotUngTuyen
      .filter(a => a.ung_vien_id === user.ung_vien_id)
      .map(a => a.id);
    list = list.filter(l => myAppIds.includes(l.luot_ung_tuyen_id));
  } else if (user && user.vai_tro === 'RECRUITER') {
    // Recruiter chỉ xem lịch của các ứng viên nộp vào tin mình phụ trách
    const myTinIds = store.TinTuyenDung
      .filter(t => t.nguoi_phu_trach_id === user.id)
      .map(t => t.id);
    const myAppIds = store.LuotUngTuyen
      .filter(a => myTinIds.includes(a.tin_tuyen_dung_id))
      .map(a => a.id);
    list = list.filter(l => myAppIds.includes(l.luot_ung_tuyen_id) || l.nguoi_phong_van_id === user.id);
  }

  // Kết hợp thông tin ứng viên và tin tuyển dụng
  const result = list.map(lich => {
    const app = store.LuotUngTuyen.find(a => a.id === lich.luot_ung_tuyen_id);
    const ungVien = app ? store.UngVien.find(u => u.id === app.ung_vien_id) : null;
    const tin = app ? store.TinTuyenDung.find(t => t.id === app.tin_tuyen_dung_id) : null;
    const danhGia = store.DanhGiaPhongVan.find(d => d.lich_phong_van_id === lich.id && d.deleted_at === null);

    return {
      ...lich,
      ho_ten_ung_vien: ungVien ? ungVien.ho_ten : 'N/A',
      email_ung_vien: ungVien ? ungVien.email : 'N/A',
      tieu_de_tin: tin ? tin.tieu_de : 'N/A',
      danh_gia: danhGia || null
    };
  });

  return res.status(200).json({ success: true, data: result });
}

export async function taoLichPhongVan(req, res) {
  try {
    const { luot_ung_tuyen_id, nguoi_phong_van_id, thoi_gian_bat_dau, thoi_gian_ket_thuc, hinh_thuc, dia_diem_hoac_link, ghi_chu } = req.body;
    const user = req.user;

    if (!luot_ung_tuyen_id || !thoi_gian_bat_dau || !dia_diem_hoac_link) {
      return res.status(400).json({ success: false, message: 'Vui lòng cung cấp đầy đủ thông tin lịch phỏng vấn.' });
    }

    const store = getStore();
    const app = store.LuotUngTuyen.find(a => a.id === luot_ung_tuyen_id && a.deleted_at === null);
    if (!app) {
      return res.status(404).json({ success: false, message: 'Lượt ứng tuyển không tồn tại.' });
    }

    // Tự động chuyển trạng thái ứng tuyển sang DANG_PHONG_VAN nếu đang ở MOI
    if (app.trang_thai === 'MOI') {
      app.trang_thai = 'DANG_PHONG_VAN';
      app.updated_at = new Date();
      store.SuKienTrangThai.push({
        id: uuidv4(),
        luot_ung_tuyen_id: app.id,
        trang_thai_cu: 'MOI',
        trang_thai_moi: 'DANG_PHONG_VAN',
        nguoi_thuc_hien_id: user ? user.id : null,
        ly_do: 'Lên lịch phỏng vấn thành công, chuyển hồ sơ sang vòng phỏng vấn.',
        thoi_gian: new Date(),
        created_at: new Date(),
        updated_at: new Date(),
        deleted_at: null
      });
    }

    const lichId = uuidv4();
    const newLich = {
      id: lichId,
      luot_ung_tuyen_id,
      nguoi_phong_van_id: nguoi_phong_van_id || (user ? user.id : 'a0000000-0000-0000-0000-000000000002'),
      thoi_gian_bat_dau,
      thoi_gian_ket_thuc: thoi_gian_ket_thuc || thoi_gian_bat_dau,
      hinh_thuc: hinh_thuc || 'ONLINE',
      dia_diem_hoac_link,
      trang_thai: 'LEN_LICH',
      ghi_chu: ghi_chu || '',
      created_at: new Date(),
      updated_at: new Date(),
      deleted_at: null
    };

    store.LichPhongVan.push(newLich);

    // Gửi email thông báo lịch phỏng vấn cho ứng viên
    const ungVien = store.UngVien.find(u => u.id === app.ung_vien_id);
    if (ungVien && ungVien.tai_khoan_id) {
      const title = 'Thư mời phỏng vấn - Tuyển dụng AI';
      const content = `Trân trọng kính mời bạn tham gia buổi phỏng vấn vào lúc ${thoi_gian_bat_dau}. ` +
                      `Hình thức: ${hinh_thuc || 'ONLINE'}. Địa điểm / Đường dẫn: ${dia_diem_hoac_link}.`;
      DichVuEmail.guiEmail(ungVien.tai_khoan_id, title, content, 'LICH_PHONG_VAN')
        .catch(err => console.error('Lỗi gửi email lịch PV:', err));
    }

    return res.status(201).json({
      success: true,
      message: 'Tạo lịch phỏng vấn thành công và đã chuyển trạng thái sang DANG_PHONG_VAN.',
      data: newLich
    });
  } catch (error) {
    console.error('Lỗi tạo lịch phỏng vấn:', error);
    return res.status(500).json({ success: false, message: 'Lỗi máy chủ nội bộ.' });
  }
}

export async function danhGiaPhongVan(req, res) {
  try {
    const { lich_phong_van_id, diem_chuyen_mon, diem_ky_nang_mem, diem_van_hoa, nhan_xet, de_xuat } = req.body;
    const user = req.user;

    if (!lich_phong_van_id || diem_chuyen_mon === undefined || !nhan_xet) {
      return res.status(400).json({ success: false, message: 'Vui lòng cung cấp đầy đủ điểm đánh giá và nhận xét.' });
    }

    const store = getStore();
    const lich = store.LichPhongVan.find(l => l.id === lich_phong_van_id && l.deleted_at === null);
    if (!lich) {
      return res.status(404).json({ success: false, message: 'Lịch phỏng vấn không tồn tại.' });
    }

    const danhGiaId = uuidv4();
    const newDanhGia = {
      id: danhGiaId,
      lich_phong_van_id,
      nguoi_danh_gia_id: user ? user.id : 'a0000000-0000-0000-0000-000000000002',
      diem_chuyen_mon: parseInt(diem_chuyen_mon),
      diem_ky_nang_mem: parseInt(diem_ky_nang_mem || 8),
      diem_van_hoa: parseInt(diem_van_hoa || 8),
      nhan_xet,
      de_xuat: de_xuat || 'XEM_XET_THEM',
      created_at: new Date(),
      updated_at: new Date(),
      deleted_at: null
    };

    store.DanhGiaPhongVan.push(newDanhGia);
    lich.trang_thai = 'HOAN_THANH';
    lich.updated_at = new Date();

    return res.status(201).json({
      success: true,
      message: 'Lưu kết quả đánh giá phỏng vấn thành công.',
      data: newDanhGia
    });
  } catch (error) {
    console.error('Lỗi lưu đánh giá phỏng vấn:', error);
    return res.status(500).json({ success: false, message: 'Lỗi máy chủ nội bộ.' });
  }
}
