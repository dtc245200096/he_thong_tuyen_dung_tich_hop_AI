import test from 'node:test';
import assert from 'node:assert/strict';
import DichVuEmail from '../../src/services/DichVuEmail.js';
import { getStore } from '../../src/config/database.js';

test('UNIT TEST: API guiEmail() cập nhật trạng thái vòng đời CHO_GUI -> DA_GUI / LOI', async (t) => {
  const store = getStore();
  const testUserId = 'a0000000-0000-0000-0000-000000000004';

  await t.test('1. Luồng gửi thành công: Tạo bản ghi CHO_GUI và cập nhật sang DA_GUI', async () => {
    const title = 'Thư mời phỏng vấn vị trí Senior Backend';
    const content = 'Chào bạn, trân trọng mời bạn tham dự phỏng vấn.';

    const result = await DichVuEmail.guiEmail(testUserId, title, content, 'LICH_PHONG_VAN');

    assert.equal(result.success, true);
    assert.equal(result.thong_bao.trang_thai_gui, 'DA_GUI', 'Trạng thái cuối cùng của email thành công phải là DA_GUI');
    assert.equal(result.thong_bao.nguoi_nhan_id, testUserId);
    assert.equal(result.thong_bao.chi_tiet_loi, null);

    // Kiểm tra bản ghi trong CSDL (store)
    const saved = store.ThongBao.find(t => t.id === result.thong_bao.id);
    assert(saved !== undefined, 'Bản ghi thông báo phải được lưu vào CSDL');
    assert.equal(saved.trang_thai_gui, 'DA_GUI');
  });

  await t.test('2. Luồng gửi thất bại: Ban đầu tạo CHO_GUI và cập nhật sang LOI khi gặp sự cố', async () => {
    const title = 'Thông báo sự cố kết nối máy chủ gửi thư';
    const content = 'Nội dung thông báo kiểm thử.';

    const result = await DichVuEmail.guiEmail(testUserId, title, content, 'EMAIL', {
      simulateError: true,
      errorMessage: 'SMTP Server Timeout: Không thể kết nối tới máy chủ gửi mail.'
    });

    assert.equal(result.success, false);
    assert.equal(result.thong_bao.trang_thai_gui, 'LOI', 'Trạng thái khi gửi lỗi phải là LOI');
    assert.match(result.thong_bao.chi_tiet_loi, /SMTP Server Timeout/);

    // Kiểm tra trong CSDL
    const saved = store.ThongBao.find(t => t.id === result.thong_bao.id);
    assert.equal(saved.trang_thai_gui, 'LOI');
    assert(saved.chi_tiet_loi !== null);
  });

  await t.test('3. Bắt lỗi khi thiếu thông tin người nhận hoặc nội dung', async () => {
    await assert.rejects(
      async () => {
        await DichVuEmail.guiEmail(null, 'Tiêu đề', 'Nội dung');
      },
      /Thiếu ID người nhận thông báo/
    );

    await assert.rejects(
      async () => {
        await DichVuEmail.guiEmail(testUserId, '', '');
      },
      /Tiêu đề và nội dung email không được để trống/
    );
  });
});
