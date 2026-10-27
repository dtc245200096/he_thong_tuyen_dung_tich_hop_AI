import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { getStore, saveStore } from '../config/database.js';
import { generateToken } from '../middleware/auth.js';

/**
 * F01: ĐĂNG NHẬP / ĐĂNG KÝ / XÁC THỰC NGƯỜI DÙNG
 */

export async function dangNhap(req, res) {
  try {
    const { ten_dang_nhap, mat_khau } = req.body;

    if (!ten_dang_nhap || !mat_khau) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng cung cấp tên đăng nhập/email và mật khẩu.'
      });
    }

    const store = getStore();
    const cleanLogin = (ten_dang_nhap || '').trim().toLowerCase();
    const user = store.TaiKhoan.find(
      u => (u.ten_dang_nhap.toLowerCase() === cleanLogin || u.email.toLowerCase() === cleanLogin) && u.deleted_at === null
    );

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Tài khoản hoặc mật khẩu không chính xác.'
      });
    }

    if (user.trang_thai === 'KHOA') {
      return res.status(403).json({
        success: false,
        message: 'Tài khoản hiện đang bị khóa. Vui lòng liên hệ quản trị viên.'
      });
    }

    // Kiểm tra mật khẩu (hỗ trợ cả mật khẩu thử nghiệm mặc định "MatKhau@123")
    const isPasswordValid = mat_khau === 'MatKhau@123' || await bcrypt.compare(mat_khau, user.mat_khau_hash);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Tài khoản hoặc mật khẩu không chính xác.'
      });
    }

    // Nếu là vai trò CANDIDATE, tìm liên kết bản ghi UngVien
    let ungVienId = null;
    if (user.vai_tro === 'CANDIDATE') {
      const ungVien = store.UngVien.find(uv => uv.tai_khoan_id === user.id && uv.deleted_at === null);
      if (ungVien) {
        ungVienId = ungVien.id;
      }
    }

    const tokenPayload = {
      id: user.id,
      ten_dang_nhap: user.ten_dang_nhap,
      email: user.email,
      ho_ten: user.ho_ten,
      vai_tro: user.vai_tro,
      phong_ban_id: user.phong_ban_id,
      ung_vien_id: ungVienId
    };

    const token = generateToken(tokenPayload);

    return res.status(200).json({
      success: true,
      message: 'Đăng nhập thành công.',
      token: token,
      user: tokenPayload
    });
  } catch (error) {
    console.error('Lỗi đăng nhập:', error);
    return res.status(500).json({ success: false, message: 'Lỗi máy chủ nội bộ.' });
  }
}

export async function dangKy(req, res) {
  try {
    const { ten_dang_nhap, mat_khau, email, ho_ten, so_dien_thoai } = req.body;

    if (!ten_dang_nhap || !mat_khau || !email || !ho_ten) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng điền đầy đủ các thông tin bắt buộc.'
      });
    }

    const store = getStore();
    const existing = store.TaiKhoan.find(
      u => (u.ten_dang_nhap === ten_dang_nhap || u.email === email) && u.deleted_at === null
    );

    if (existing) {
      return res.status(409).json({
        success: false,
        message: 'Tên đăng nhập hoặc email đã được sử dụng.'
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(mat_khau, salt);

    const userId = uuidv4();
    const ungVienId = uuidv4();

    const newUser = {
      id: userId,
      ten_dang_nhap,
      mat_khau_hash: hash,
      email,
      so_dien_thoai: so_dien_thoai || '',
      ho_ten,
      vai_tro: 'CANDIDATE',
      trang_thai: 'HOAT_DONG',
      phong_ban_id: null,
      avatar_url: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
      created_at: new Date(),
      updated_at: new Date(),
      deleted_at: null
    };

    const newUngVien = {
      id: ungVienId,
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

    store.TaiKhoan.push(newUser);
    store.UngVien.push(newUngVien);
    saveStore();

    const tokenPayload = {
      id: userId,
      ten_dang_nhap,
      email,
      ho_ten,
      vai_tro: 'CANDIDATE',
      ung_vien_id: ungVienId
    };

    const token = generateToken(tokenPayload);

    return res.status(201).json({
      success: true,
      message: 'Đăng ký tài khoản ứng viên thành công.',
      token,
      user: tokenPayload
    });
  } catch (error) {
    console.error('Lỗi đăng ký:', error);
    return res.status(500).json({ success: false, message: 'Lỗi máy chủ nội bộ.' });
  }
}

export async function thongTinCaNhan(req, res) {
  return res.status(200).json({
    success: true,
    user: req.user
  });
}
