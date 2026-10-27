import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import { getStore } from '../config/database.js';
import { extractTextFromCV } from '../services/ocrParser.js';

/**
 * F04: TẢI CV, TRÍCH XUẤT TEXT (OCR) VÀ LƯU VÀO CƠ SỞ DỮ LIỆU
 * Đáp ứng các yêu cầu:
 *   - Giới hạn dung lượng: <= 10 MiB (10.485.760 bytes)
 *   - Định dạng: PDF hoặc DOCX
 *   - Trường vanBanTrichXuat lưu trữ đầy đủ nội dung (hỗ trợ tới 100.000 ký tự)
 */

export async function taiLenCV(req, res) {
  try {
    const file = req.file;
    const user = req.user;
    const { ung_vien_id, ho_ten, email, so_dien_thoai } = req.body;

    if (!file) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng đính kèm tệp tin CV (PDF hoặc DOCX).'
      });
    }

    const store = getStore();
    let targetUngVienId = ung_vien_id || (user ? user.ung_vien_id : null);

    // Nếu ứng viên chưa có hồ sơ trong bảng UngVien, tự động tạo mới
    if (!targetUngVienId) {
      targetUngVienId = uuidv4();
      const newUngVien = {
        id: targetUngVienId,
        tai_khoan_id: user ? user.id : null,
        ho_ten: ho_ten || (user ? user.ho_ten : 'Ứng viên mới'),
        email: email || (user ? user.email : 'ungvien@example.com'),
        so_dien_thoai: so_dien_thoai || '0900000000',
        dia_chi: '',
        ky_nang_chinh: '',
        kinh_nghiem_nam: 0,
        created_at: new Date(),
        updated_at: new Date(),
        deleted_at: null
      };
      store.UngVien.push(newUngVien);
    }

    // Xác định định dạng tệp chuẩn ('pdf' hoặc 'docx')
    const ext = path.extname(file.originalname).toLowerCase().replace('.', '');
    const dinhDang = ext === 'pdf' ? 'pdf' : 'docx';

    // Trích xuất văn bản qua OCR Parser (Giới hạn tối đa 100.000 ký tự)
    const vanBanTrichXuat = await extractTextFromCV(file.path, file.originalname);

    // Tính phiên bản CV của ứng viên
    const currentCvs = store.HoSoCV.filter(c => c.ung_vien_id === targetUngVienId && c.deleted_at === null);
    const phienBan = currentCvs.length + 1;

    const hoSoCv = {
      id: uuidv4(),
      ung_vien_id: targetUngVienId,
      ten_file: file.originalname,
      duong_dan_file: `/uploads/cvs/${path.basename(file.path)}`,
      dinh_dang: dinhDang,
      dung_luong_bytes: file.size,
      vanBanTrichXuat: vanBanTrichXuat,
      phien_ban: phienBan,
      created_at: new Date(),
      updated_at: new Date(),
      deleted_at: null
    };

    store.HoSoCV.push(hoSoCv);

    return res.status(201).json({
      success: true,
      message: 'Tải lên CV và trích xuất nội dung văn bản thành công.',
      data: {
        id: hoSoCv.id,
        ung_vien_id: hoSoCv.ung_vien_id,
        ten_file: hoSoCv.ten_file,
        dinh_dang: hoSoCv.dinh_dang,
        dung_luong_bytes: hoSoCv.dung_luong_bytes,
        phien_ban: hoSoCv.phien_ban,
        do_dai_van_ban: vanBanTrichXuat.length,
        trich_doan_van_ban: vanBanTrichXuat.substring(0, 300) + '...'
      }
    });
  } catch (error) {
    console.error('Lỗi tải CV:', error);
    return res.status(500).json({ success: false, message: 'Lỗi trong quá trình xử lý CV.' });
  }
}

export async function layDanhSachCV(req, res) {
  const store = getStore();
  const { ung_vien_id } = req.query;
  const user = req.user;

  let list = store.HoSoCV.filter(c => c.deleted_at === null);

  // Phân quyền: Ứng viên chỉ xem CV của chính mình
  if (user && user.vai_tro === 'CANDIDATE') {
    list = list.filter(c => c.ung_vien_id === user.ung_vien_id);
  } else if (ung_vien_id) {
    list = list.filter(c => c.ung_vien_id === ung_vien_id);
  }

  return res.status(200).json({ success: true, data: list });
}
