import test from 'node:test';
import assert from 'node:assert/strict';
import { nopDonUngTuyen } from '../../src/controllers/luotUngTuyenController.js';
import { getStore } from '../../src/config/database.js';

test('UNIT TEST: Luồng chống nộp trùng CV (Một ứng viên chỉ có 1 lượt trên 1 tin tuyển dụng)', async (t) => {
  const store = getStore();

  // Chuẩn bị ID mẫu
  const testCandidateId = 'u_test_duplicate_001';
  const otherCandidateId = 'u_test_duplicate_002';
  const testJobId = 'c1000000-0000-0000-0000-000000000001';
  const otherJobId = 'c1000000-0000-0000-0000-000000000002';
  const testCvId = 'h1000000-0000-0000-0000-000000000001';

  // Helper giả lập Request & Response của Express
  function createMockReqRes(body, user) {
    const req = {
      body,
      user
    };
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

  await t.test('1. Lần nộp đầu tiên của ứng viên vào tin tuyển dụng: Thành công (201 Created)', async () => {
    // Đảm bảo chưa có bản ghi trùng trước đó trong store
    store.LuotUngTuyen = store.LuotUngTuyen.filter(
      a => !(a.ung_vien_id === testCandidateId && a.tin_tuyen_dung_id === testJobId)
    );

    const { req, res } = createMockReqRes(
      {
        tin_tuyen_dung_id: testJobId,
        ung_vien_id: testCandidateId,
        ho_so_cv_id: testCvId,
        ghi_chu: 'Nộp đơn thử nghiệm lần 1'
      },
      { id: 'user_cand_1', ung_vien_id: testCandidateId, vai_tro: 'CANDIDATE' }
    );

    await nopDonUngTuyen(req, res);

    assert.equal(res.statusCode, 201, 'HTTP Status phải là 201 Created');
    assert.equal(res.jsonData.success, true);
    assert.equal(res.jsonData.data.trang_thai, 'MOI', 'Trạng thái ban đầu phải là MOI');
    assert.equal(res.jsonData.data.ung_vien_id, testCandidateId);
    assert.equal(res.jsonData.data.tin_tuyen_dung_id, testJobId);
  });

  await t.test('2. Lần nộp thứ hai của CÙNG ứng viên vào CÙNG tin tuyển dụng: Bị chặn (409 Conflict)', async () => {
    const { req, res } = createMockReqRes(
      {
        tin_tuyen_dung_id: testJobId,
        ung_vien_id: testCandidateId,
        ho_so_cv_id: testCvId,
        ghi_chu: 'Cố tình nộp lại lần 2'
      },
      { id: 'user_cand_1', ung_vien_id: testCandidateId, vai_tro: 'CANDIDATE' }
    );

    await nopDonUngTuyen(req, res);

    assert.equal(res.statusCode, 409, 'Hệ thống phải từ chối với mã lỗi 409 Conflict');
    assert.equal(res.jsonData.success, false);
    assert.equal(res.jsonData.error, 'DUPLICATE_APPLICATION');
    assert.match(res.jsonData.message, /chỉ cho phép 1 lượt ứng tuyển/);
  });

  await t.test('3. Ứng viên khác nộp vào cùng tin tuyển dụng: Cho phép (201 Created)', async () => {
    const { req, res } = createMockReqRes(
      {
        tin_tuyen_dung_id: testJobId,
        ung_vien_id: otherCandidateId,
        ho_so_cv_id: testCvId,
        ghi_chu: 'Ứng viên khác nộp hồ sơ'
      },
      { id: 'user_cand_2', ung_vien_id: otherCandidateId, vai_tro: 'CANDIDATE' }
    );

    await nopDonUngTuyen(req, res);

    assert.equal(res.statusCode, 201);
    assert.equal(res.jsonData.success, true);
  });

  await t.test('4. Cùng ứng viên nộp vào tin tuyển dụng KHÁC: Cho phép (201 Created)', async () => {
    const { req, res } = createMockReqRes(
      {
        tin_tuyen_dung_id: otherJobId,
        ung_vien_id: testCandidateId,
        ho_so_cv_id: testCvId,
        ghi_chu: 'Nộp sang tin tuyển dụng khác'
      },
      { id: 'user_cand_1', ung_vien_id: testCandidateId, vai_tro: 'CANDIDATE' }
    );

    await nopDonUngTuyen(req, res);

    assert.equal(res.statusCode, 201);
    assert.equal(res.jsonData.success, true);
  });
});
