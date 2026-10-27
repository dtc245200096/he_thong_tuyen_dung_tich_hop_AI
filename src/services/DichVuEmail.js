import { v4 as uuidv4 } from 'uuid';
import { getStore } from '../config/database.js';

/**
 * DỊCH VỤ EMAIL & THÔNG BÁO (F09)
 * Quy trình xử lý trạng thái chuẩn 3 bước:
 *   Bước 1: Khởi tạo thông báo với trạng thái `CHO_GUI`
 *   Bước 2: Tiến hành gửi email qua cổng truyền dẫn
 *   Bước 3: Cập nhật thành `DA_GUI` (nếu thành công) hoặc `LOI` (nếu có sự cố)
 */
export class DichVuEmail {
  /**
   * Hàm gửi email và cập nhật trạng thái vòng đời
   * @param {string} nguoiNhanId UUID của tài khoản nhận
   * @param {string} tieuDe Tiêu đề email
   * @param {string} noiDung Nội dung email
   * @param {string} loaiThongBao Loại thông báo (HE_THONG, LICH_PHONG_VAN, KET_QUA_UNG_TUYEN, EMAIL)
   * @param {object} options Tùy chọn kiểm thử (ví dụ ép lỗi simulateError)
   */
  async guiEmail(nguoiNhanId, tieuDe, noiDung, loaiThongBao = 'EMAIL', options = {}) {
    if (!nguoiNhanId) {
      throw new Error('Thiếu ID người nhận thông báo.');
    }
    if (!tieuDe || !noiDung) {
      throw new Error('Tiêu đề và nội dung email không được để trống.');
    }

    const store = getStore();

    // BƯỚC 1: Tạo bản ghi ThongBao với trạng thái ban đầu là CHO_GUI
    const thongBaoId = uuidv4();
    const thongBao = {
      id: thongBaoId,
      nguoi_nhan_id: nguoiNhanId,
      tieu_de: tieuDe,
      noi_dung: noiDung,
      loai_thong_bao: loaiThongBao,
      trang_thai_gui: 'CHO_GUI',
      da_doc: false,
      chi_tiet_loi: null,
      created_at: new Date(),
      updated_at: new Date(),
      deleted_at: null
    };

    store.ThongBao.push(thongBao);

    // BƯỚC 2 & 3: Thực hiện gửi và cập nhật trạng thái kết quả
    try {
      // Giả lập hoặc gọi SMTP transport thực tế
      if (options.simulateError) {
        throw new Error(options.errorMessage || 'Lỗi kết nối máy chủ SMTP hoặc địa chỉ email không tồn tại.');
      }

      // Giả lập thời gian truyền mạng nhỏ
      await new Promise(resolve => setTimeout(resolve, 50));

      // Gửi thành công -> Cập nhật sang DA_GUI
      thongBao.trang_thai_gui = 'DA_GUI';
      thongBao.updated_at = new Date();

      return {
        success: true,
        thong_bao: thongBao,
        message: 'Email đã được gửi thành công.'
      };
    } catch (error) {
      // Gửi thất bại -> Cập nhật sang LOI
      thongBao.trang_thai_gui = 'LOI';
      thongBao.chi_tiet_loi = error.message;
      thongBao.updated_at = new Date();

      return {
        success: false,
        thong_bao: thongBao,
        error: error.message,
        message: 'Gửi email thất bại, đã cập nhật trạng thái lỗi để gửi lại sau.'
      };
    }
  }

  /**
   * Lấy danh sách thông báo của một người dùng (Hỗ trợ phân quyền ứng viên F09)
   */
  async layThongBaoNguoiDung(nguoiNhanId) {
    const store = getStore();
    return store.ThongBao
      .filter(t => t.nguoi_nhan_id === nguoiNhanId && t.deleted_at === null)
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  }
}

export default new DichVuEmail();
