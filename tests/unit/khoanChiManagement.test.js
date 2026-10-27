import test from 'node:test';
import assert from 'node:assert/strict';
import { getStore } from '../../src/config/database.js';
import {
  taoKhoanChi,
  layDanhSachKhoanChi,
  xoaKhoanChi,
  layThongKeTongQuan
} from '../../src/controllers/baoCaoController.js';

test('UNIT TEST: Quản Lý Khoản Chi Tuyển Dụng (F10 - KhoanChi)', async (t) => {
  const store = getStore();
  let createdExpenseId = null;

  await t.test('1. Tạo khoản chi tuyển dụng mới thành công', async () => {
    const req = {
      body: {
        ten_khoan_chi: 'Chi phí gói VIP tuyển dụng IT TopCV tháng 10',
        so_tien: 6000000,
        ngay_chi: '2026-10-04',
        tin_tuyen_dung_id: 'c1000000-0000-0000-0000-000000000001',
        nguon_id: 's1000000-0000-0000-0000-000000000002',
        hoa_don_url: '/uploads/invoices/test-inv.pdf',
        ghi_chu: 'Thanh toán thẻ tín dụng công ty'
      },
      user: {
        id: 'a0000000-0000-0000-0000-000000000001',
        vai_tro: 'ADMIN'
      }
    };

    let statusCode = null;
    let responseData = null;
    const res = {
      status: (code) => {
        statusCode = code;
        return res;
      },
      json: (data) => {
        responseData = data;
        return data;
      }
    };

    await taoKhoanChi(req, res);

    assert.equal(statusCode, 201);
    assert.equal(responseData.success, true);
    assert.equal(responseData.data.ten_khoan_chi, 'Chi phí gói VIP tuyển dụng IT TopCV tháng 10');
    assert.equal(responseData.data.so_tien, 6000000);
    assert.equal(responseData.data.ngay_chi, '2026-10-04');
    assert.equal(responseData.data.nguoi_duyet_id, 'a0000000-0000-0000-0000-000000000001');

    createdExpenseId = responseData.data.id;
    assert(createdExpenseId !== null);
  });

  await t.test('2. Bắt lỗi khi thiếu thông tin bắt buộc (tên, số tiền, ngày chi)', async () => {
    const req = {
      body: {
        ten_khoan_chi: '',
        so_tien: null,
        ngay_chi: ''
      },
      user: { id: 'admin-id' }
    };

    let statusCode = null;
    let responseData = null;
    const res = {
      status: (code) => {
        statusCode = code;
        return res;
      },
      json: (data) => {
        responseData = data;
        return data;
      }
    };

    await taoKhoanChi(req, res);
    assert.equal(statusCode, 400);
    assert.equal(responseData.success, false);
  });

  await t.test('3. Lấy danh sách khoản chi và hiển thị thông tin tên tin, tên nguồn', async () => {
    const req = {};
    let statusCode = null;
    let responseData = null;
    const res = {
      status: (code) => {
        statusCode = code;
        return res;
      },
      json: (data) => {
        responseData = data;
        return data;
      }
    };

    await layDanhSachKhoanChi(req, res);
    assert.equal(statusCode, 200);
    assert.equal(responseData.success, true);
    assert(Array.isArray(responseData.data));

    const found = responseData.data.find(k => k.id === createdExpenseId);
    assert(found !== undefined, 'Khoản chi vừa tạo phải có trong danh sách');
    assert.equal(found.ten_khoan_chi, 'Chi phí gói VIP tuyển dụng IT TopCV tháng 10');
    assert.equal(found.so_tien, 6000000);
  });

  await t.test('4. Xóa khoản chi tuyển dụng (soft delete)', async () => {
    const req = {
      params: { id: createdExpenseId },
      user: { id: 'admin-id', vai_tro: 'ADMIN' }
    };

    let statusCode = null;
    let responseData = null;
    const res = {
      status: (code) => {
        statusCode = code;
        return res;
      },
      json: (data) => {
        responseData = data;
        return data;
      }
    };

    await xoaKhoanChi(req, res);
    assert.equal(statusCode, 200);
    assert.equal(responseData.success, true);

    // Kiểm tra bản ghi đã được đánh dấu deleted_at
    const itemInStore = store.KhoanChi.find(k => k.id === createdExpenseId);
    assert(itemInStore.deleted_at !== null, 'deleted_at phải khác null sau khi xóa');

    // Không còn xuất hiện trong danh sách khoản chi đang hoạt động
    await layDanhSachKhoanChi({}, res);
    const stillActive = responseData.data.find(k => k.id === createdExpenseId);
    assert.equal(stillActive, undefined, 'Khoản chi đã xóa không được xuất hiện trong danh sách active');
  });
});
