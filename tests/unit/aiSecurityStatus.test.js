import test from 'node:test';
import assert from 'node:assert/strict';
import { doiSanhCV } from '../../src/controllers/aiController.js';
import { chuyenTrangThai } from '../../src/controllers/luotUngTuyenController.js';
import { getStore } from '../../src/config/database.js';

test('UNIT TEST: Luồng bảo mật - Đảm bảo AI không tự đổi trạng thái tuyển dụng', async (t) => {
  const store = getStore();

  const appId = 'app_security_test_001';
  const cvId = 'h1000000-0000-0000-0000-000000000001';
  const jobId = 'c1000000-0000-0000-0000-000000000001';

  // Khởi tạo lượt ứng tuyển ở trạng thái MOI
  store.LuotUngTuyen = store.LuotUngTuyen.filter(a => a.id !== appId);
  store.LuotUngTuyen.push({
    id: appId,
    tin_tuyen_dung_id: jobId,
    ung_vien_id: 'u1000000-0000-0000-0000-000000000001',
    ho_so_cv_id: cvId,
    trang_thai: 'MOI',
    diem_danh_gia_tong: null,
    deleted_at: null
  });

  function createMockReqRes(body, user, params = {}) {
    const req = { body, user, params };
    const res = {
      statusCode: 200,
      jsonData: null,
      status(code) {
        this.statusCode = code;
        return this;
      },
      json(data) {
        this.jsonData = data;
        return this;
      }
    };
    return { req, res };
  }

  await t.test('1. Khi AI thực thi phân tích đối sánh (Điểm cao 94/100): Trạng thái VẪN LÀ MOI', async () => {
    const { req, res } = createMockReqRes(
      {
        luot_ung_tuyen_id: appId,
        ho_so_cv_id: cvId,
        tin_tuyen_dung_id: jobId
      },
      { id: 'recruiter_1', vai_tro: 'RECRUITER' }
    );

    await doiSanhCV(req, res);

    assert.equal(res.statusCode, 200);
    assert.equal(res.jsonData.success, true);
    assert(res.jsonData.data.diem_phu_hop >= 80, 'Điểm AI đánh giá phải cao');

    // Kiểm tra trực tiếp bản ghi trong CSDL
    const currentApp = store.LuotUngTuyen.find(a => a.id === appId);
    assert.equal(
      currentApp.trang_thai,
      'MOI',
      'NGUYÊN TẮC AN TOÀN: AI chỉ có quyền chấm điểm/gợi ý, TUYỆT ĐỐI KHÔNG tự động chuyển trạng thái sang DAT hoặc DANG_PHONG_VAN.'
    );
  });

  await t.test('2. Chỉ nhân sự có thẩm quyền (Recruiter/Admin) mới có quyền đổi trạng thái qua API nghiệp vụ', async () => {
    const { req, res } = createMockReqRes(
      {
        trang_thai_moi: 'DANG_PHONG_VAN',
        ly_do: 'Nhân viên tuyển dụng phê duyệt đưa vào phỏng vấn sau khi xem điểm AI.'
      },
      { id: 'recruiter_1', vai_tro: 'RECRUITER' },
      { id: appId }
    );

    await chuyenTrangThai(req, res);

    assert.equal(res.statusCode, 200);
    const updatedApp = store.LuotUngTuyen.find(a => a.id === appId);
    assert.equal(updatedApp.trang_thai, 'DANG_PHONG_VAN', 'Trạng thái chuyển thành công khi có xác thực từ Recruiter.');

    // Kiểm tra đã ghi vết vào SuKienTrangThai
    const suKien = store.SuKienTrangThai.find(s => s.luot_ung_tuyen_id === appId && s.trang_thai_moi === 'DANG_PHONG_VAN');
    assert(suKien !== undefined, 'Hệ thống phải lưu vết kiểm toán vào SuKienTrangThai');
    assert.equal(suKien.trang_thai_cu, 'MOI');
  });
});
