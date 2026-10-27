import test from 'node:test';
import assert from 'node:assert/strict';
import { getStore } from '../../src/config/database.js';
import * as taiKhoanController from '../../src/controllers/taiKhoanController.js';
import * as thongBaoController from '../../src/controllers/thongBaoController.js';
import * as authController from '../../src/controllers/authController.js';

test('UNIT TEST: Quản Lý Tài Khoản (F14) & Nâng Cấp Thông Báo', async (t) => {
  const store = getStore();
  store.TaiKhoan = store.TaiKhoan.filter(u => u.ten_dang_nhap !== 'test_hr_user');

  await t.test('1. Tạo tài khoản mới thành công (ADMIN, RECRUITER, CANDIDATE)', async () => {
    const req = {
      user: { id: 'admin-1', vai_tro: 'ADMIN' },
      body: {
        ten_dang_nhap: 'test_hr_user',
        mat_khau: 'MatKhau@123',
        email: 'test_hr@company.com',
        ho_ten: 'Lê Hoàng Nhân Sự',
        so_dien_thoai: '0901234567',
        vai_tro: 'RECRUITER'
      }
    };

    let statusCode = null;
    let resData = null;
    const res = {
      status: (code) => { statusCode = code; return res; },
      json: (data) => { resData = data; return res; }
    };

    await taiKhoanController.taoTaiKhoan(req, res);
    assert.equal(statusCode, 201, 'Tạo tài khoản mới phải trả về mã 201.');
    assert.equal(resData.success, true);
    assert.equal(resData.data.vai_tro, 'RECRUITER');
    assert.equal(resData.data.ten_dang_nhap, 'test_hr_user');
  });

  await t.test('2. Phân quyền / Cung cấp quyền mới cho tài khoản (Cập nhật vai trò)', async () => {
    const targetUser = store.TaiKhoan.find(u => u.ten_dang_nhap === 'test_hr_user');
    assert.ok(targetUser, 'Tài khoản vừa tạo phải tồn tại trong cơ sở dữ liệu.');

    const req = {
      user: { id: 'admin-1', vai_tro: 'ADMIN' },
      params: { id: targetUser.id },
      body: { vai_tro: 'ADMIN' }
    };

    let statusCode = null;
    let resData = null;
    const res = {
      status: (code) => { statusCode = code; return res; },
      json: (data) => { resData = data; return res; }
    };

    await taiKhoanController.capNhatVaiTro(req, res);
    assert.equal(statusCode, 200);
    assert.equal(resData.success, true);
    assert.equal(targetUser.vai_tro, 'ADMIN', 'Vai trò của người dùng phải được nâng cấp lên ADMIN.');
  });

  await t.test('3. Khóa quyền / Khóa tài khoản và chặn đăng nhập', async () => {
    const targetUser = store.TaiKhoan.find(u => u.ten_dang_nhap === 'test_hr_user');

    // 3.1 Khóa tài khoản
    const reqLock = {
      user: { id: 'admin-1', vai_tro: 'ADMIN' },
      params: { id: targetUser.id },
      body: { trang_thai: 'KHOA' }
    };
    let statusCode = null;
    let resData = null;
    const resLock = {
      status: (code) => { statusCode = code; return resLock; },
      json: (data) => { resData = data; return resLock; }
    };
    await taiKhoanController.khoaMoKhoaTaiKhoan(reqLock, resLock);
    assert.equal(statusCode, 200);
    assert.equal(targetUser.trang_thai, 'KHOA', 'Trạng thái tài khoản phải chuyển sang KHOA.');

    // 3.2 Thử đăng nhập bằng tài khoản bị khóa -> Bị từ chối (403 Forbidden)
    const reqLogin = {
      body: {
        ten_dang_nhap: 'test_hr_user',
        mat_khau: 'MatKhau@123'
      }
    };
    let loginStatus = null;
    let loginData = null;
    const resLogin = {
      status: (code) => { loginStatus = code; return resLogin; },
      json: (data) => { loginData = data; return resLogin; }
    };
    await authController.dangNhap(reqLogin, resLogin);
    assert.equal(loginStatus, 403, 'Đăng nhập vào tài khoản bị khóa phải trả về 403.');
    assert.equal(loginData.success, false);
    assert.match(loginData.message, /bị khóa/i);
  });

  await t.test('4. Mở khóa tài khoản cho phép đăng nhập lại bình thường', async () => {
    const targetUser = store.TaiKhoan.find(u => u.ten_dang_nhap === 'test_hr_user');

    const reqUnlock = {
      user: { id: 'admin-1', vai_tro: 'ADMIN' },
      params: { id: targetUser.id },
      body: { trang_thai: 'HOAT_DONG' }
    };
    const resUnlock = {
      status: (code) => resUnlock,
      json: (data) => resUnlock
    };
    await taiKhoanController.khoaMoKhoaTaiKhoan(reqUnlock, resUnlock);
    assert.equal(targetUser.trang_thai, 'HOAT_DONG', 'Trạng thái tài khoản phải trở lại HOAT_DONG.');

    // Thử đăng nhập lại -> Thành công
    const reqLogin = {
      body: {
        ten_dang_nhap: 'test_hr_user',
        mat_khau: 'MatKhau@123'
      }
    };
    let loginStatus = null;
    const resLogin = {
      status: (code) => { loginStatus = code; return resLogin; },
      json: (data) => resLogin
    };
    await authController.dangNhap(reqLogin, resLogin);
    assert.equal(loginStatus, 200, 'Tài khoản được mở khóa phải đăng nhập thành công (200).');
  });

  await t.test('5. Đánh dấu tất cả thông báo là đã đọc (danhDauTatCaDaDoc)', async () => {
    const candidateUser = store.TaiKhoan.find(u => u.vai_tro === 'CANDIDATE');
    assert.ok(candidateUser);

    // Tạo 2 thông báo chưa đọc mẫu
    store.ThongBao.push({
      id: 'test-notif-1',
      nguoi_nhan_id: candidateUser.id,
      tieu_de: 'Thông báo 1',
      noi_dung: 'Nội dung 1',
      loai_thong_bao: 'HE_THONG',
      trang_thai_gui: 'DA_GUI',
      da_doc: false,
      deleted_at: null,
      created_at: new Date()
    });
    store.ThongBao.push({
      id: 'test-notif-2',
      nguoi_nhan_id: candidateUser.id,
      tieu_de: 'Thông báo 2',
      noi_dung: 'Nội dung 2',
      loai_thong_bao: 'LICH_PHONG_VAN',
      trang_thai_gui: 'DA_GUI',
      da_doc: false,
      deleted_at: null,
      created_at: new Date()
    });

    const req = { user: candidateUser };
    let resStatus = null;
    let resData = null;
    const res = {
      status: (code) => { resStatus = code; return res; },
      json: (data) => { resData = data; return res; }
    };

    await thongBaoController.danhDauTatCaDaDoc(req, res);
    assert.equal(resStatus, 200);
    assert.equal(resData.success, true);
    assert.ok(resData.updated_count >= 2);

    const unread = store.ThongBao.filter(t => t.nguoi_nhan_id === candidateUser.id && !t.da_doc && t.deleted_at === null);
    assert.equal(unread.length, 0, 'Toàn bộ thông báo của ứng viên phải được cập nhật sang đã đọc.');
  });
});
