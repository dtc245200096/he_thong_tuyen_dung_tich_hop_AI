import { v4 as uuidv4 } from 'uuid';
import { getStore } from '../config/database.js';
import DichVuEmail from '../services/DichVuEmail.js';

/**
 * F05 & F06: NỘP ĐƠN ỨNG TUYỂN & QUY TRÌNH CHUYỂN TRẠNG THÁI TUẦN TỰ
 * Yêu cầu:
 *   1. Chống nộp trùng CV (Một ứng viên chỉ có 1 lượt trên 1 tin tuyển dụng)
 *   2. Chuyển trạng thái tuần tự: MOI -> DANG_PHONG_VAN -> DAT / KHONG_DAT
 *   3. Ghi vết toàn bộ biến động trạng thái vào SuKienTrangThai
 *   4. Phân quyền: Ứng viên chỉ xem được trạng thái của chính mình
 */

// Bảng ma trận chuyển trạng thái tuần tự hợp lệ
const VALID_STATUS_TRANSITIONS = {
  'MOI': ['DANG_PHONG_VAN', 'KHONG_DAT'],
  'DANG_PHONG_VAN': ['DAT', 'KHONG_DAT'],
  'DAT': ['DANG_PHONG_VAN', 'KHONG_DAT'], // Cho phép mở lại phỏng vấn bổ sung hoặc hủy trúng tuyển
  'KHONG_DAT': ['MOI', 'DANG_PHONG_VAN'] // Cho phép xem xét lại hồ sơ hoặc tái phỏng vấn
};

/**
 * F05: Nộp đơn ứng tuyển (Có cơ chế chống nộp trùng nghiêm ngặt)
 */
export async function nopDonUngTuyen(req, res) {
  try {
    const { tin_tuyen_dung_id, ung_vien_id, ho_so_cv_id, nguon_id, ghi_chu } = req.body;
    const user = req.user;

    const store = getStore();
    let targetUngVienId = ung_vien_id || (user ? user.ung_vien_id : null);
    if (!targetUngVienId && user) {
      const foundUv = store.UngVien.find(uv => (uv.tai_khoan_id === user.id || uv.email === user.email) && uv.deleted_at === null);
      if (foundUv) targetUngVienId = foundUv.id;
    }

    if (!tin_tuyen_dung_id || !targetUngVienId || !ho_so_cv_id) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng cung cấp đầy đủ: tin_tuyen_dung_id, ung_vien_id và ho_so_cv_id.'
      });
    }

    // 1. Kiểm tra tin tuyển dụng còn mở không
    const tin = store.TinTuyenDung.find(t => t.id === tin_tuyen_dung_id && t.deleted_at === null);
    if (!tin) {
      return res.status(404).json({ success: false, message: 'Tin tuyển dụng không tồn tại.' });
    }
    if (tin.trang_thai === 'DONG' || tin.trang_thai === 'TAM_DUNG') {
      return res.status(400).json({ success: false, message: 'Tin tuyển dụng hiện đã đóng hoặc tạm dừng nhận hồ sơ.' });
    }

    // 2. CƠ CHẾ CHỐNG NỘP TRÙNG (Anti-Duplicate Submission)
    // Một ứng viên chỉ có 1 lượt ứng tuyển trên 1 tin tuyển dụng
    const duplicateApp = store.LuotUngTuyen.find(
      app => app.tin_tuyen_dung_id === tin_tuyen_dung_id &&
             app.ung_vien_id === targetUngVienId &&
             app.deleted_at === null
    );

    if (duplicateApp) {
      return res.status(409).json({
        success: false,
        error: 'DUPLICATE_APPLICATION',
        message: 'Bạn đã nộp hồ sơ ứng tuyển cho tin tuyển dụng này rồi. Hệ thống chỉ cho phép 1 lượt ứng tuyển trên mỗi tin.',
        existing_application_id: duplicateApp.id,
        current_status: duplicateApp.trang_thai
      });
    }

    // 3. Khởi tạo lượt ứng tuyển mới với trạng thái khởi đầu MOI
    const luotUngTuyenId = uuidv4();
    const newApplication = {
      id: luotUngTuyenId,
      tin_tuyen_dung_id,
      ung_vien_id: targetUngVienId,
      ho_so_cv_id,
      nguon_id: nguon_id || 's1000000-0000-0000-0000-000000000003',
      trang_thai: 'MOI', // Bắt đầu từ trạng thái MOI
      diem_danh_gia_tong: null,
      ghi_chu: ghi_chu || 'Ứng tuyển trực tuyến qua cổng tuyển dụng.',
      created_at: new Date(),
      updated_at: new Date(),
      deleted_at: null
    };

    store.LuotUngTuyen.push(newApplication);

    // 4. Ghi nhận sự kiện trạng thái ban đầu vào SuKienTrangThai
    const suKienId = uuidv4();
    const suKien = {
      id: suKienId,
      luot_ung_tuyen_id: luotUngTuyenId,
      trang_thai_cu: 'KHOI_TAO',
      trang_thai_moi: 'MOI',
      nguoi_thuc_hien_id: user ? user.id : null,
      ly_do: 'Ứng viên nộp hồ sơ ứng tuyển trực tuyến.',
      thoi_gian: new Date(),
      created_at: new Date(),
      updated_at: new Date(),
      deleted_at: null
    };
    store.SuKienTrangThai.push(suKien);

    // Gửi thông báo xác nhận đã nhận hồ sơ
    if (user && user.id) {
      DichVuEmail.guiEmail(
        user.id,
        `Xác nhận tiếp nhận hồ sơ: ${tin.tieu_de}`,
        `Cảm ơn bạn đã nộp hồ sơ ứng tuyển. Chúng tôi đã nhận được CV và đang tiến hành sàng lọc. Trạng thái hiện tại: MỚI (MOI).`,
        'KET_QUA_UNG_TUYEN'
      ).catch(err => console.error('Lỗi gửi email xác nhận:', err));
    }

    return res.status(201).json({
      success: true,
      message: 'Nộp hồ sơ ứng tuyển thành công.',
      data: newApplication
    });
  } catch (error) {
    console.error('Lỗi nộp đơn ứng tuyển:', error);
    return res.status(500).json({ success: false, message: 'Lỗi máy chủ nội bộ.' });
  }
}

/**
 * F06: API Xử lý trạng thái ứng tuyển tuần tự
 * Quy trình: MOI -> DANG_PHONG_VAN -> DAT / KHONG_DAT
 * Chặn nhảy cóc trạng thái (VD: từ MOI không được nhảy thẳng lên DAT)
 */
export async function chuyenTrangThai(req, res) {
  try {
    const { id } = req.params;
    const { trang_thai_moi, ly_do } = req.body;
    const user = req.user;

    const validAll = ['MOI', 'DANG_PHONG_VAN', 'DAT', 'KHONG_DAT'];
    if (!validAll.includes(trang_thai_moi)) {
      return res.status(400).json({
        success: false,
        message: `Trạng thái mới không hợp lệ. Chỉ chấp nhận: ${validAll.join(', ')}.`
      });
    }

    const store = getStore();
    const app = store.LuotUngTuyen.find(a => a.id === id && a.deleted_at === null);

    if (!app) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy lượt ứng tuyển.' });
    }

    const currentStatus = app.trang_thai;

    // Không chuyển nếu trạng thái không đổi
    if (currentStatus === trang_thai_moi) {
      return res.status(200).json({
        success: true,
        message: `Lượt ứng tuyển hiện đã ở trạng thái '${trang_thai_moi}'.`,
        data: app
      });
    }

    // KIỂM TRA QUY TRÌNH TUẦN TỰ (Sequential State Validation)
    const allowedNext = VALID_STATUS_TRANSITIONS[currentStatus] || [];
    if (!allowedNext.includes(trang_thai_moi)) {
      return res.status(400).json({
        success: false,
        error: 'INVALID_STATUS_TRANSITION',
        message: `Chuyển trạng thái không hợp lệ: Không thể chuyển từ '${currentStatus}' sang '${trang_thai_moi}'. Quy trình tuần tự bắt buộc: MOI -> DANG_PHONG_VAN -> DAT / KHONG_DAT.`,
        current_status: currentStatus,
        allowed_transitions: allowedNext
      });
    }

    // Cập nhật trạng thái
    app.trang_thai = trang_thai_moi;
    app.updated_at = new Date();

    // Ghi nhận biến động vào SuKienTrangThai
    const suKien = {
      id: uuidv4(),
      luot_ung_tuyen_id: app.id,
      trang_thai_cu: currentStatus,
      trang_thai_moi: trang_thai_moi,
      nguoi_thuc_hien_id: user ? user.id : null,
      ly_do: ly_do || `Cập nhật trạng thái sang ${trang_thai_moi} theo quy trình tuyển dụng.`,
      thoi_gian: new Date(),
      created_at: new Date(),
      updated_at: new Date(),
      deleted_at: null
    };
    store.SuKienTrangThai.push(suKien);

    // Gửi email thông báo cho ứng viên khi có cập nhật trạng thái
    const ungVien = store.UngVien.find(u => u.id === app.ung_vien_id);
    if (ungVien && ungVien.tai_khoan_id) {
      const emailTitle = `Cập nhật kết quả tuyển dụng - Trạng thái: ${trang_thai_moi}`;
      const emailContent = `Hồ sơ ứng tuyển của bạn đã được cập nhật sang trạng thái: ${trang_thai_moi}. Ghi chú/Lý do: ${suKien.ly_do}`;
      DichVuEmail.guiEmail(ungVien.tai_khoan_id, emailTitle, emailContent, 'KET_QUA_UNG_TUYEN')
        .catch(err => console.error('Lỗi gửi email cập nhật trạng thái:', err));
    }

    return res.status(200).json({
      success: true,
      message: `Cập nhật trạng thái ứng tuyển thành công: ${currentStatus} -> ${trang_thai_moi}`,
      data: app,
      su_kien: suKien
    });
  } catch (error) {
    console.error('Lỗi chuyển trạng thái ứng tuyển:', error);
    return res.status(500).json({ success: false, message: 'Lỗi máy chủ nội bộ.' });
  }
}

/**
 * Lấy danh sách lượt ứng tuyển (Có phân quyền theo vai trò)
 * - CANDIDATE: Chỉ xem lượt ứng tuyển của chính mình
 * - RECRUITER: Xem trong phạm vi các tin tuyển dụng phụ trách
 * - ADMIN: Xem toàn bộ
 */
export async function layDanhSachUngTuyen(req, res) {
  const store = getStore();
  const user = req.user;
  const { tin_tuyen_dung_id, trang_thai } = req.query;

  let list = store.LuotUngTuyen.filter(a => a.deleted_at === null);

  // 1. Phân quyền ứng viên & nhà tuyển dụng
  if (user && user.vai_tro === 'CANDIDATE') {
    const targetUvId = user.ung_vien_id || (store.UngVien.find(uv => uv.tai_khoan_id === user.id)?.id);
    list = list.filter(a => a.ung_vien_id === targetUvId);
  } else if (user && user.vai_tro === 'RECRUITER') {
    // Chỉ lọc theo tin phụ trách nếu client chỉ định rõ ràng scope_only === 'true'
    // Mặc định cho phép Recruiter xem đầy đủ các lượt nộp đơn của ứng viên vào các tin tuyển dụng của công ty
    if (req.query.scope_only === 'true') {
      const myTinIds = store.TinTuyenDung
        .filter(t => t.nguoi_phu_trach_id === user.id)
        .map(t => t.id);
      list = list.filter(a => myTinIds.includes(a.tin_tuyen_dung_id));
    }
  }

  // 2. Bộ lọc theo query params
  if (tin_tuyen_dung_id) {
    list = list.filter(a => a.tin_tuyen_dung_id === tin_tuyen_dung_id);
  }
  if (trang_thai) {
    list = list.filter(a => a.trang_thai === trang_thai);
  }

  // Bổ sung thông tin chi tiết ứng viên, tin tuyển dụng, CV và kết quả AI
  const enrichedList = list.map(app => {
    const ungVien = store.UngVien.find(u => u.id === app.ung_vien_id);
    const tin = store.TinTuyenDung.find(t => t.id === app.tin_tuyen_dung_id);
    const cv = store.HoSoCV.find(c => c.id === app.ho_so_cv_id);
    const aiResult = store.KetQuaAI.find(k => k.luot_ung_tuyen_id === app.id && k.loai_nghiep_vu === 'DOI_SANH');
    const lichPv = store.LichPhongVan.find(m => m.luot_ung_tuyen_id === app.id && m.deleted_at === null);

    return {
      ...app,
      ho_ten_ung_vien: ungVien ? ungVien.ho_ten : 'N/A',
      email_ung_vien: ungVien ? ungVien.email : 'N/A',
      so_dien_thoai: ungVien ? ungVien.so_dien_thoai : 'N/A',
      tieu_de_tin: tin ? tin.tieu_de : 'N/A',
      ten_file_cv: cv ? cv.ten_file : 'N/A',
      duong_dan_cv: cv ? cv.duong_dan_file : '',
      van_ban_trich_xuat: cv ? cv.vanBanTrichXuat : '',
      diem_ai_doi_sanh: aiResult ? aiResult.diem_phu_hop : null,
      chi_tiet_ai: aiResult ? aiResult.ket_qua_json : null,
      lich_phong_van: lichPv || null
    };
  });

  return res.status(200).json({
    success: true,
    data: enrichedList
  });
}
