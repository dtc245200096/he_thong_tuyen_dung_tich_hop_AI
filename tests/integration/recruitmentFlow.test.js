import test from 'node:test';
import assert from 'node:assert/strict';
import { nopDonUngTuyen, chuyenTrangThai } from '../../src/controllers/luotUngTuyenController.js';
import { doiSanhCV } from '../../src/controllers/aiController.js';
import { taoLichPhongVan, danhGiaPhongVan } from '../../src/controllers/lichPhongVanController.js';
import { getStore } from '../../src/config/database.js';

test('INTEGRATION TEST: Toàn trình quy trình tuyển dụng tuần tự MOI -> DANG_PHONG_VAN -> DAT', async (t) => {
  const store = getStore();

  const candidateId = 'u_integration_flow_01';
  const jobId = 'c1000000-0000-0000-0000-000000000001';
  const cvId = 'h1000000-0000-0000-0000-000000000001';

  let applicationId = '';

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

  await t.test('Giai đoạn 1: Ứng viên nộp hồ sơ ứng tuyển (Khởi tạo trạng thái MOI)', async () => {
    // Làm sạch trước khi test
    store.LuotUngTuyen = store.LuotUngTuyen.filter(a => !(a.ung_vien_id === candidateId && a.tin_tuyen_dung_id === jobId));

    const { req, res } = createMockReqRes(
      {
        tin_tuyen_dung_id: jobId,
        ung_vien_id: candidateId,
        ho_so_cv_id: cvId,
        ghi_chu: 'Nộp hồ sơ tích hợp'
      },
      { id: 'user_flow_01', ung_vien_id: candidateId, vai_tro: 'CANDIDATE' }
    );

    await nopDonUngTuyen(req, res);

    assert.equal(res.statusCode, 201);
    assert.equal(res.jsonData.data.trang_thai, 'MOI');
    applicationId = res.jsonData.data.id;
  });

  await t.test('Giai đoạn 2: AI thực hiện đối sánh kỹ năng và chấm điểm', async () => {
    const { req, res } = createMockReqRes(
      {
        luot_ung_tuyen_id: applicationId,
        ho_so_cv_id: cvId,
        tin_tuyen_dung_id: jobId
      },
      { id: 'recruiter_flow', vai_tro: 'RECRUITER' }
    );

    await doiSanhCV(req, res);

    assert.equal(res.statusCode, 200);
    assert(res.jsonData.data.diem_phu_hop > 80);

    // Kiểm tra bảo mật: Trạng thái VẪN LÀ MOI
    const app = store.LuotUngTuyen.find(a => a.id === applicationId);
    assert.equal(app.trang_thai, 'MOI');
  });

  await t.test('Giai đoạn 3: Chặn hành vi nhảy cóc quy trình (Từ MOI không được nhảy thẳng lên DAT)', async () => {
    const { req, res } = createMockReqRes(
      {
        trang_thai_moi: 'DAT',
        ly_do: 'Cố tình nhảy cóc bỏ qua phỏng vấn'
      },
      { id: 'recruiter_flow', vai_tro: 'RECRUITER' },
      { id: applicationId }
    );

    await chuyenTrangThai(req, res);

    assert.equal(res.statusCode, 400);
    assert.equal(res.jsonData.error, 'INVALID_STATUS_TRANSITION');
    assert.match(res.jsonData.message, /Không thể chuyển từ 'MOI' sang 'DAT'/);
  });

  await t.test('Giai đoạn 4: Lên lịch phỏng vấn -> Trạng thái tự động chuyển sang DANG_PHONG_VAN', async () => {
    const { req, res } = createMockReqRes(
      {
        luot_ung_tuyen_id: applicationId,
        thoi_gian_bat_dau: '2026-10-10 10:00:00',
        dia_diem_hoac_link: 'https://meet.google.com/interview-test-flow',
        ghi_chu: 'Phỏng vấn chuyên môn'
      },
      { id: 'recruiter_flow', vai_tro: 'RECRUITER' }
    );

    await taoLichPhongVan(req, res);

    assert.equal(res.statusCode, 201);
    const app = store.LuotUngTuyen.find(a => a.id === applicationId);
    assert.equal(app.trang_thai, 'DANG_PHONG_VAN', 'Phải chuyển sang DANG_PHONG_VAN');
  });

  await t.test('Giai đoạn 5: Đánh giá phỏng vấn và Chuyển trạng thái sang DAT', async () => {
    const lich = store.LichPhongVan.find(l => l.luot_ung_tuyen_id === applicationId);
    assert(lich !== undefined);

    // Đánh giá phỏng vấn
    const evalResult = createMockReqRes(
      {
        lich_phong_van_id: lich.id,
        diem_chuyen_mon: 9,
        diem_ky_nang_mem: 9,
        diem_van_hoa: 10,
        nhan_xet: 'Ứng viên xuất sắc',
        de_xuat: 'DAT'
      },
      { id: 'recruiter_flow', vai_tro: 'RECRUITER' }
    );
    await danhGiaPhongVan(evalResult.req, evalResult.res);
    assert.equal(evalResult.res.statusCode, 201);

    // Chuyển trạng thái sang DAT
    const { req, res } = createMockReqRes(
      {
        trang_thai_moi: 'DAT',
        ly_do: 'Hoàn thành phỏng vấn đạt điểm cao, tuyển dụng chính thức.'
      },
      { id: 'recruiter_flow', vai_tro: 'RECRUITER' },
      { id: applicationId }
    );

    await chuyenTrangThai(req, res);

    assert.equal(res.statusCode, 200);
    const app = store.LuotUngTuyen.find(a => a.id === applicationId);
    assert.equal(app.trang_thai, 'DAT');

    // Kiểm tra lịch sử biến động trong SuKienTrangThai
    const events = store.SuKienTrangThai.filter(s => s.luot_ung_tuyen_id === applicationId);
    assert(events.length >= 3, 'Phải có ít nhất 3 sự kiện: KHOI_TAO->MOI, MOI->DANG_PHONG_VAN, DANG_PHONG_VAN->DAT');
  });
});
