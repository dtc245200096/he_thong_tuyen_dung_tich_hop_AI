import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { getStore, saveStore } from '../config/database.js';

/**
 * QUẢN LÝ TÀI KHOẢN (DÀNH CHO QUẢN TRỊ VIÊN - ADMIN)
 * Chức năng:
 *   1. Danh sách tài khoản
 *   2. Tạo tài khoản mới (Admin, Recruiter, Candidate)
 *   3. Phân quyền / Cung cấp quyền (Cập nhật vai trò)
 *   4. Khóa quyền / Mở khóa tài khoản (Cập nhật trạng thái HOAT_DONG / KHOA)
 *   5. Xóa mềm tài khoản
 */

export async function layDanhSachTaiKhoan(req, res) {
  try {
    const store = getStore();
    const { search, vai_tro, trang_thai } = req.query;

    let list = store.TaiKhoan.filter(u => u.deleted_at === null);

    if (vai_tro) {
      list = list.filter(u => u.vai_tro === vai_tro);
    }

    if (trang_thai) {
      list = list.filter(u => u.trang_thai === trang_thai);
    }

    if (search) {
      const q = search.toLowerCase().trim();
      list = list.filter(u => 
        (u.ten_dang_nhap && u.ten_dang_nhap.toLowerCase().includes(q)) ||
        (u.ho_ten && u.ho_ten.toLowerCase().includes(q)) ||
        (u.email && u.email.toLowerCase().includes(q))
      );
    }

    // Kết hợp thông tin tên phòng ban nếu có
    const result = list.map(u => {
      const phongBan = u.phong_ban_id ? store.PhongBan.find(p => p.id === u.phong_ban_id) : null;
      return {
        id: u.id,
        ten_dang_nhap: u.ten_dang_nhap,
        email: u.email,
        ho_ten: u.ho_ten,
        so_dien_thoai: u.so_dien_thoai || '',
        vai_tro: u.vai_tro,
        trang_thai: u.trang_thai,
        phong_ban_id: u.phong_ban_id,
        ten_phong_ban: phongBan ? phongBan.ten_phong_ban : 'Chưa phân bổ',
        avatar_url: u.avatar_url || '',
        created_at: u.created_at,
        updated_at: u.updated_at
      };
    });

    return res.status(200).json({ success: true, data: result });
  } catch (error) {
    console.error('Lỗi lấy danh sách tài khoản:', error);
    return res.status(500).json({ success: false, message: 'Lỗi máy chủ nội bộ.' });
  }
}

export async function taoTaiKhoan(req, res) {
  try {
    const { ten_dang_nhap, mat_khau, email, ho_ten, so_dien_thoai, vai_tro, phong_ban_id } = req.body;

    if (!ten_dang_nhap || !mat_khau || !email || !ho_ten) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng điền đầy đủ các thông tin bắt buộc: tên đăng nhập, mật khẩu, email và họ tên.'
      });
    }

    const validRoles = ['ADMIN', 'RECRUITER', 'CANDIDATE'];
    const targetRole = vai_tro || 'RECRUITER';
    if (!validRoles.includes(targetRole)) {
      return res.status(400).json({
        success: false,
        message: `Vai trò không hợp lệ. Chỉ chấp nhận: ${validRoles.join(', ')}.`
      });
    }

    const store = getStore();
    const existing = store.TaiKhoan.find(
      u => (u.ten_dang_nhap === ten_dang_nhap || u.email === email) && u.deleted_at === null
    );

    if (existing) {
      return res.status(409).json({
        success: false,
        message: 'Tên đăng nhập hoặc email này đã tồn tại trong hệ thống.'
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(mat_khau, salt);

    const userId = uuidv4();
    const newUser = {
      id: userId,
      ten_dang_nhap,
      mat_khau_hash: hash,
      email,
      so_dien_thoai: so_dien_thoai || '',
      ho_ten,
      vai_tro: targetRole,
      trang_thai: 'HOAT_DONG',
      phong_ban_id: phong_ban_id || null,
      avatar_url: targetRole === 'ADMIN'
        ? 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150'
        : (targetRole === 'RECRUITER' 
            ? 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150' 
            : 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150'),
      created_at: new Date(),
      updated_at: new Date(),
      deleted_at: null
    };

    store.TaiKhoan.push(newUser);

    // Nếu tạo tài khoản là Ứng viên (CANDIDATE), tạo thêm bản ghi UngVien
    if (targetRole === 'CANDIDATE') {
      const ungVien = {
        id: uuidv4(),
        tai_khoan_id: userId,
        ho_ten,
        email,
        so_dien_thoai: so_dien_thoai || '',
        dia_chi: '',
        ky_nang_chinh: '',
        kinh_nghiem_nam: 0,
        created_at: new Date(),
        updated_at: new Date(),
        deleted_at: null
      };
      store.UngVien.push(ungVien);
    }

    saveStore();

    return res.status(201).json({
      success: true,
      message: `Tạo tài khoản thành công với vai trò ${targetRole}.`,
      data: {
        id: newUser.id,
        ten_dang_nhap: newUser.ten_dang_nhap,
        email: newUser.email,
        ho_ten: newUser.ho_ten,
        vai_tro: newUser.vai_tro,
        trang_thai: newUser.trang_thai
      }
    });
  } catch (error) {
    console.error('Lỗi tạo tài khoản:', error);
    return res.status(500).json({ success: false, message: 'Lỗi máy chủ nội bộ.' });
  }
}

export async function capNhatVaiTro(req, res) {
  try {
    const { id } = req.params;
    const { vai_tro } = req.body;

    const validRoles = ['ADMIN', 'RECRUITER', 'CANDIDATE'];
    if (!validRoles.includes(vai_tro)) {
      return res.status(400).json({
        success: false,
        message: `Vai trò không hợp lệ. Chỉ chấp nhận: ${validRoles.join(', ')}.`
      });
    }

    const store = getStore();
    const user = store.TaiKhoan.find(u => u.id === id && u.deleted_at === null);

    if (!user) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy tài khoản.' });
    }

    // Nếu tài khoản chuyển sang CANDIDATE và chưa có bản ghi UngVien
    if (vai_tro === 'CANDIDATE') {
      const hasUngVien = store.UngVien.find(uv => uv.tai_khoan_id === user.id && uv.deleted_at === null);
      if (!hasUngVien) {
        store.UngVien.push({
          id: uuidv4(),
          tai_khoan_id: user.id,
          ho_ten: user.ho_ten,
          email: user.email,
          so_dien_thoai: user.so_dien_thoai || '',
          dia_chi: '',
          ky_nang_chinh: '',
          kinh_nghiem_nam: 0,
          created_at: new Date(),
          updated_at: new Date(),
          deleted_at: null
        });
      }
    }

    const oldRole = user.vai_tro;
    user.vai_tro = vai_tro;
    user.updated_at = new Date();
    saveStore();

    return res.status(200).json({
      success: true,
      message: `Đã cập nhật quyền thành công: ${oldRole} -> ${vai_tro}.`,
      data: {
        id: user.id,
        ten_dang_nhap: user.ten_dang_nhap,
        vai_tro: user.vai_tro
      }
    });
  } catch (error) {
    console.error('Lỗi cập nhật vai trò:', error);
    return res.status(500).json({ success: false, message: 'Lỗi máy chủ nội bộ.' });
  }
}

export async function khoaMoKhoaTaiKhoan(req, res) {
  try {
    const { id } = req.params;
    const { trang_thai } = req.body;
    const currentUser = req.user;

    const validStatus = ['HOAT_DONG', 'KHOA'];
    if (!validStatus.includes(trang_thai)) {
      return res.status(400).json({
        success: false,
        message: `Trạng thái không hợp lệ. Chỉ chấp nhận: ${validStatus.join(', ')}.`
      });
    }

    if (currentUser && currentUser.id === id && trang_thai === 'KHOA') {
      return res.status(400).json({
        success: false,
        message: 'Bạn không thể tự khóa tài khoản của chính mình.'
      });
    }

    const store = getStore();
    const user = store.TaiKhoan.find(u => u.id === id && u.deleted_at === null);

    if (!user) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy tài khoản.' });
    }

    user.trang_thai = trang_thai;
    user.updated_at = new Date();
    saveStore();

    const actionText = trang_thai === 'KHOA' ? 'Khóa tài khoản' : 'Mở khóa tài khoản';
    return res.status(200).json({
      success: true,
      message: `Đã ${actionText.toLowerCase()} thành công.`,
      data: {
        id: user.id,
        ten_dang_nhap: user.ten_dang_nhap,
        trang_thai: user.trang_thai
      }
    });
  } catch (error) {
    console.error('Lỗi khóa/mở khóa tài khoản:', error);
    return res.status(500).json({ success: false, message: 'Lỗi máy chủ nội bộ.' });
  }
}

export async function xoaTaiKhoan(req, res) {
  try {
    const { id } = req.params;
    const currentUser = req.user;

    if (currentUser && currentUser.id === id) {
      return res.status(400).json({
        success: false,
        message: 'Bạn không thể tự xóa tài khoản của chính mình.'
      });
    }

    const store = getStore();
    const user = store.TaiKhoan.find(u => u.id === id && u.deleted_at === null);

    if (!user) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy tài khoản.' });
    }

    user.deleted_at = new Date();
    saveStore();

    return res.status(200).json({
      success: true,
      message: 'Đã xóa tài khoản thành công.'
    });
  } catch (error) {
    console.error('Lỗi xóa tài khoản:', error);
    return res.status(500).json({ success: false, message: 'Lỗi máy chủ nội bộ.' });
  }
}
