import test from 'node:test';
import assert from 'node:assert/strict';
import DichVuAI from '../../src/services/DichVuAI.js';
import { getStore } from '../../src/config/database.js';

test('UNIT TEST: Trợ Lý AI Hỏi Đáp Cho Ứng Viên (Candidate Career Assistant)', async (t) => {
  const store = getStore();

  const mockCandidateUser = {
    id: 'user-candidate-an',
    ten_dang_nhap: 'candidate_an',
    ho_ten: 'Phạm Quốc An',
    vai_tro: 'CANDIDATE',
    ung_vien_id: 'uv-001'
  };

  await t.test('1. Phản hồi tự nhiên, định dạng thân thiện và TUYỆT ĐỐI không chứa SQL hay code', async () => {
    const res = await DichVuAI.troLyUngVien('Có những vị trí tuyển dụng nào đang mở?', mockCandidateUser);

    assert.ok(res.cau_tra_loi, 'Phải có câu trả lời từ trợ lý AI');
    assert.strictEqual(typeof res.cau_tra_loi, 'string');
    
    // Kiểm tra không chứa code/SQL như bên admin
    assert.strictEqual(res.cau_tra_loi.includes('SELECT '), false, 'Không được chứa câu lệnh SELECT');
    assert.strictEqual(res.cau_tra_loi.includes('FROM '), false, 'Không được chứa cú pháp SQL FROM');
    assert.strictEqual(res.cau_tra_loi.includes('```sql'), false, 'Không được chứa khối code sql');
    assert.strictEqual(res.cau_tra_loi.includes('database_schema'), false, 'Không được để lộ cấu trúc schema');
    
    // Kiểm tra nội dung chứa các vị trí đang mở
    assert.ok(res.cau_tra_loi.includes('vị trí') || res.cau_tra_loi.includes('cơ hội việc làm'));
  });

  await t.test('2. Trả lời tư vấn tối ưu điểm số CV cho ứng viên chuẩn phương pháp STAR', async () => {
    const res = await DichVuAI.troLyUngVien('Làm sao để viết CV đạt điểm cao và vượt qua AI?', mockCandidateUser);

    assert.ok(res.cau_tra_loi.includes('CV') || res.cau_tra_loi.includes('kỹ năng'));
    assert.ok(res.cau_tra_loi.includes('10 MiB') || res.cau_tra_loi.includes('PDF'));
  });

  await t.test('3. Tra cứu tiến độ hồ sơ ứng tuyển cá nhân của ứng viên', async () => {
    const res = await DichVuAI.troLyUngVien('Tiến độ hồ sơ ứng tuyển của tôi đến đâu rồi?', mockCandidateUser);

    assert.ok(res.cau_tra_loi.includes('Phạm Quốc An') || res.cau_tra_loi.includes('hồ sơ'));
  });

  await t.test('4. Bắt lỗi khi ứng viên không nhập câu hỏi', async () => {
    await assert.rejects(
      async () => {
        await DichVuAI.troLyUngVien('', mockCandidateUser);
      },
      { message: /Vui lòng nhập câu hỏi/ }
    );
  });
});
