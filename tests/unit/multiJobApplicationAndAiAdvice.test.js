import test from 'node:test';
import assert from 'node:assert/strict';
import { nopDonUngTuyen, layDanhSachUngTuyen } from '../../src/controllers/luotUngTuyenController.js';
import DichVuAI from '../../src/services/DichVuAI.js';
import { getStore } from '../../src/config/database.js';

test('UNIT TEST: Ứng viên nộp nhiều CV vào nhiều tin tuyển dụng & AI tư vấn phỏng vấn Online/Offline riêng biệt', async (t) => {
  const store = getStore();

  const testCandidateId = 'u_test_multi_jobs_001';
  const job1Id = 'c1000000-0000-0000-0000-000000000001';
  const job2Id = 'c1000000-0000-0000-0000-000000000002';
  const cv1Id = 'h_test_cv_01';
  const cv2Id = 'h_test_cv_02';

  // Thêm 2 hồ sơ CV mẫu vào store nếu chưa có
  if (!store.HoSoCV.some(c => c.id === cv1Id)) {
    store.HoSoCV.push({
      id: cv1Id,
      ung_vien_id: testCandidateId,
      ten_file: 'CV_Backend_NodeJS.pdf',
      duong_dan_file: '/uploads/cvs/CV_Backend_NodeJS.pdf',
      dinh_dang: 'pdf',
      dung_luong_bytes: 120000,
      vanBanTrichXuat: 'Backend Node.js, Express, MySQL',
      phien_ban: 1,
      deleted_at: null
    });
  }

  if (!store.HoSoCV.some(c => c.id === cv2Id)) {
    store.HoSoCV.push({
      id: cv2Id,
      ung_vien_id: testCandidateId,
      ten_file: 'CV_AI_Engineer.docx',
      duong_dan_file: '/uploads/cvs/CV_AI_Engineer.docx',
      dinh_dang: 'docx',
      dung_luong_bytes: 150000,
      vanBanTrichXuat: 'AI Engineer, Python, LangChain, RAG',
      phien_ban: 2,
      deleted_at: null
    });
  }

  // Thêm thông tin ứng viên mẫu
  if (!store.UngVien.some(u => u.id === testCandidateId)) {
    store.UngVien.push({
      id: testCandidateId,
      tai_khoan_id: 'acc_multi_candidate',
      ho_ten: 'Đặng Tuấn Minh',
      email: 'tuanminh.test@example.com',
      so_dien_thoai: '0912345678',
      deleted_at: null
    });
  }

  function createMockReqRes(body, user, query = {}) {
    const req = { body, user, query };
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

  await t.test('1. Ứng viên nộp CV 1 vào Tin tuyển dụng 1: Thành công (201 Created)', async () => {
    // Xóa lượt ứng tuyển cũ nếu có
    store.LuotUngTuyen = store.LuotUngTuyen.filter(a => !(a.ung_vien_id === testCandidateId));

    const { req, res } = createMockReqRes(
      {
        tin_tuyen_dung_id: job1Id,
        ung_vien_id: testCandidateId,
        ho_so_cv_id: cv1Id,
        ghi_chu: 'Nộp vị trí Backend'
      },
      { id: 'acc_multi_candidate', ung_vien_id: testCandidateId, vai_tro: 'CANDIDATE' }
    );

    await nopDonUngTuyen(req, res);
    assert.equal(res.statusCode, 201);
    assert.equal(res.jsonData.success, true);
    assert.equal(res.jsonData.data.ho_so_cv_id, cv1Id);
    assert.equal(res.jsonData.data.tin_tuyen_dung_id, job1Id);
  });

  await t.test('2. Cùng ứng viên nộp CV 2 vào Tin tuyển dụng 2: Thành công (201 Created)', async () => {
    const { req, res } = createMockReqRes(
      {
        tin_tuyen_dung_id: job2Id,
        ung_vien_id: testCandidateId,
        ho_so_cv_id: cv2Id,
        ghi_chu: 'Nộp vị trí AI Engineer'
      },
      { id: 'acc_multi_candidate', ung_vien_id: testCandidateId, vai_tro: 'CANDIDATE' }
    );

    await nopDonUngTuyen(req, res);
    assert.equal(res.statusCode, 201);
    assert.equal(res.jsonData.success, true);
    assert.equal(res.jsonData.data.ho_so_cv_id, cv2Id);
    assert.equal(res.jsonData.data.tin_tuyen_dung_id, job2Id);
  });

  await t.test('3. Phía Recruiter tải danh sách ứng viên: PHẢI HIỆN ĐẦY ĐỦ CẢ 2 CV ĐÃ NỘP VÀO 2 TIN', async () => {
    const { req, res } = createMockReqRes(
      {},
      { id: 'a0000000-0000-0000-0000-000000000002', vai_tro: 'RECRUITER' }
    );

    await layDanhSachUngTuyen(req, res);
    assert.equal(res.statusCode, 200);
    assert.equal(res.jsonData.success, true);

    const candApps = res.jsonData.data.filter(a => a.ung_vien_id === testCandidateId);
    assert.equal(candApps.length, 2, 'Recruiter phải nhìn thấy đầy đủ cả 2 hồ sơ ứng tuyển của ứng viên');

    const app1 = candApps.find(a => a.tin_tuyen_dung_id === job1Id);
    const app2 = candApps.find(a => a.tin_tuyen_dung_id === job2Id);
    assert.ok(app1, 'Phải có lượt ứng tuyển tin 1');
    assert.ok(app2, 'Phải có lượt ứng tuyển tin 2');
    assert.equal(app1.ten_file_cv, 'CV_Backend_NodeJS.pdf');
    assert.equal(app2.ten_file_cv, 'CV_AI_Engineer.docx');
  });

  await t.test('4. Lọc danh sách theo tin_tuyen_dung_id cụ thể: Chỉ trả về CV của tin tuyển dụng đó', async () => {
    const { req, res } = createMockReqRes(
      {},
      { id: 'a0000000-0000-0000-0000-000000000002', vai_tro: 'RECRUITER' },
      { tin_tuyen_dung_id: job2Id }
    );

    await layDanhSachUngTuyen(req, res);
    assert.equal(res.statusCode, 200);

    const candApps = res.jsonData.data.filter(a => a.ung_vien_id === testCandidateId);
    assert.equal(candApps.length, 1, 'Chỉ hiện đúng 1 đơn của tin 2');
    assert.equal(candApps[0].tin_tuyen_dung_id, job2Id);
    assert.equal(candApps[0].ten_file_cv, 'CV_AI_Engineer.docx');
  });

  await t.test('5. AI Hỏi Đáp Ứng Viên: Tư vấn chuẩn bị phỏng vấn phải tách biệt rõ ràng Online và Offline', async () => {
    const user = {
      id: 'acc_multi_candidate',
      ho_ten: 'Đặng Tuấn Minh',
      vai_tro: 'CANDIDATE',
      ung_vien_id: testCandidateId
    };

    const res = await DichVuAI.troLyUngVien('Tôi cần chuẩn bị những gì cho buổi phỏng vấn sắp tới?', user);
    assert.ok(res.cau_tra_loi, 'Phải có phản hồi từ AI');

    // Kiểm tra có lưu ý riêng cho Online
    assert.ok(
      res.cau_tra_loi.includes('ONLINE') || res.cau_tra_loi.includes('Trực tuyến') || res.cau_tra_loi.includes('Online'),
      'Phải có phần hướng dẫn riêng cho phỏng vấn Online'
    );
    assert.ok(
      res.cau_tra_loi.includes('đường truyền mạng') || res.cau_tra_loi.includes('Internet') || res.cau_tra_loi.includes('webcam') || res.cau_tra_loi.includes('micro'),
      'Phải nhắc nhở kiểm tra mạng/webcam/micro cho phỏng vấn Online'
    );

    // Kiểm tra có lưu ý riêng cho Offline
    assert.ok(
      res.cau_tra_loi.includes('OFFLINE') || res.cau_tra_loi.includes('Offline') || res.cau_tra_loi.includes('trực tiếp'),
      'Phải có phần hướng dẫn riêng cho phỏng vấn Offline'
    );
    assert.ok(
      res.cau_tra_loi.includes('giấy tờ') || res.cau_tra_loi.includes('CV in') || res.cau_tra_loi.includes('bằng cấp') || res.cau_tra_loi.includes('CCCD'),
      'Phải nhắc nhở chuẩn bị giấy tờ/CV in/CCCD cho phỏng vấn Offline'
    );
    assert.ok(
      res.cau_tra_loi.includes('thời gian') || res.cau_tra_loi.includes('10 - 15 phút') || res.cau_tra_loi.includes('10-15 phút') || res.cau_tra_loi.includes('sớm'),
      'Phải nhắc nhở sắp xếp thời gian đến sớm cho phỏng vấn Offline'
    );
  });

  await t.test('6. AI Hỏi Đáp Ứng Viên: Khi tra cứu lịch hẹn có lịch Online hoặc Offline thì nhắc nhở tương ứng', async () => {
    const user = {
      id: 'a0000000-0000-0000-0000-000000000004',
      ho_ten: 'Phạm Quốc An',
      vai_tro: 'CANDIDATE',
      ung_vien_id: 'u1000000-0000-0000-0000-000000000001'
    };

    const res = await DichVuAI.troLyUngVien('Kiểm tra lịch phỏng vấn sắp tới của tôi', user);
    assert.ok(res.cau_tra_loi);
    assert.ok(res.cau_tra_loi.includes('lịch hẹn phỏng vấn'));
    // Lịch của Phạm Quốc An trong database là ONLINE -> Phải có nhắc nhở riêng Online
    assert.ok(res.cau_tra_loi.includes('đường truyền mạng') || res.cau_tra_loi.includes('Online'));
  });
});
