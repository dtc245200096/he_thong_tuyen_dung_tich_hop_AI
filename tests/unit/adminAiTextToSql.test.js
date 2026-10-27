import test from 'node:test';
import assert from 'node:assert/strict';
import DichVuAI from '../../src/services/DichVuAI.js';
import { getStore } from '../../src/config/database.js';

test('UNIT TEST: Safe Text-to-SQL - Hỏi đáp chính xác theo từng thực thể (Recruiter, Nhân viên, Ứng viên)', async (t) => {
  const store = getStore();

  await t.test('1. Hỏi về Recruiter: Phải trả lời đúng chuyên viên tuyển dụng, KHÔNG hiển thị ứng viên', async () => {
    const res = await DichVuAI.hoiDap('Hệ thống có bao nhiêu recruiter?');

    assert.ok(res.ket_qua_json, 'Phải có kết quả JSON');
    assert.strictEqual(res.loai_nghiep_vu, 'HOI_DAP');
    
    // Câu trả lời phải chứa thông tin chuyên viên tuyển dụng
    assert.ok(
      res.ket_qua_json.cau_tra_loi.includes('chuyên viên tuyển dụng') ||
      res.ket_qua_json.cau_tra_loi.includes('RECRUITER'),
      'Câu trả lời phải đề cập đến RECRUITER'
    );
    assert.ok(res.ket_qua_json.cau_tra_loi.includes('recruiter_linh') || res.ket_qua_json.cau_tra_loi.includes('Trần Thảo Linh'));

    // SQL thực thi phải truy vấn bảng TaiKhoan với vai_tro = RECRUITER
    assert.ok(res.ket_qua_json.sql_da_thuc_thi.includes('TaiKhoan'));
    assert.ok(res.ket_qua_json.sql_da_thuc_thi.includes('RECRUITER'));

    // Tuyệt đối không được lẫn lộn sang thống kê các giai đoạn ứng viên
    assert.strictEqual(
      res.ket_qua_json.cau_tra_loi.includes('tổng số ứng viên theo các giai đoạn: [{"trang_thai"'),
      false,
      'Không được hiển thị danh sách giai đoạn ứng viên khi hỏi recruiter'
    );
  });

  await t.test('2. Hỏi về Nhân viên: Phải trả lời đúng nhân sự nội bộ (Admin & Recruiter)', async () => {
    const res = await DichVuAI.hoiDap('Công ty có bao nhiêu nhân viên?');

    assert.ok(res.ket_qua_json.cau_tra_loi.includes('nhân sự nội bộ') || res.ket_qua_json.cau_tra_loi.includes('nhân sự'));
    assert.ok(res.ket_qua_json.sql_da_thuc_thi.includes('TaiKhoan'));
    assert.ok(res.ket_qua_json.sql_da_thuc_thi.includes('ADMIN'));
  });

  await t.test('3. Hỏi về Ứng viên: Phải trả lời số lượng và tình trạng ứng viên', async () => {
    const res = await DichVuAI.hoiDap('Hiện có bao nhiêu ứng viên nộp hồ sơ?');

    assert.ok(res.ket_qua_json.cau_tra_loi.includes('ứng viên') || res.ket_qua_json.cau_tra_loi.includes('hồ sơ'));
    assert.ok(res.ket_qua_json.sql_da_thuc_thi.includes('UngVien'));
  });

  await t.test('4. Hỏi về Quản trị viên (Admin): Phải trả lời danh sách Admin', async () => {
    const res = await DichVuAI.hoiDap('Có bao nhiêu admin trong hệ thống?');

    assert.ok(res.ket_qua_json.cau_tra_loi.includes('ADMIN') || res.ket_qua_json.cau_tra_loi.includes('Quản trị viên'));
    assert.ok(res.ket_qua_json.cau_tra_loi.includes('admin') || res.ket_qua_json.cau_tra_loi.includes('Nguyễn Quản Trị'));
    assert.ok(res.ket_qua_json.sql_da_thuc_thi.includes('TaiKhoan'));
  });

  await t.test('5. Bảo mật: SQL thực thi luôn vượt qua kiểm tra an toàn kiemTraAnToanSQL', () => {
    const sqlRecruiter = 'SELECT id, ho_ten FROM TaiKhoan WHERE vai_tro = \'RECRUITER\';';
    assert.doesNotThrow(() => {
      DichVuAI.kiemTraAnToanSQL(sqlRecruiter);
    });
  });

  await t.test('6. Chuyển nhân viên sang Admin (ADMIN đăng nhập): Xác nhận có quyền và hướng dẫn quy trình 6 bước', async () => {
    const adminUser = {
      id: 'admin-001',
      ho_ten: 'Nguyễn Quản Trị',
      ten_dang_nhap: 'admin',
      email: 'admin@tuyendungai.vn',
      vai_tro: 'ADMIN'
    };

    const res = await DichVuAI.hoiDap(
      'Tôi muốn chuyển một nhân viên sang quyền Admin. Hãy kiểm tra quyền hạn của tôi và hướng dẫn quy trình thực hiện.',
      adminUser
    );

    assert.ok(res.ket_qua_json, 'Phải có kết quả JSON');
    assert.strictEqual(res.loai_nghiep_vu, 'HOI_DAP');

    const answer = res.ket_qua_json.cau_tra_loi;
    // Kiểm tra quyền hạn
    assert.ok(answer.includes('KẾT QUẢ KIỂM TRA QUYỀN HẠN'), 'Phải có phần kiểm tra quyền hạn');
    assert.ok(answer.includes('Nguyễn Quản Trị'), 'Phải đề cập đúng tên người dùng đăng nhập');
    assert.ok(answer.includes('ADMIN (Quản trị viên hệ thống)'), 'Phải xác nhận đúng vai trò ADMIN');
    assert.ok(answer.includes('CÓ ĐẦY ĐỦ QUYỀN HẠN'), 'Phải xác nhận có thẩm quyền phân quyền Admin');

    // Hướng dẫn quy trình
    assert.ok(answer.includes('QUY TRÌNH THỰC HIỆN CHUYỂN NHÂN VIÊN SANG QUYỀN ADMIN'), 'Phải có tiêu đề quy trình');
    assert.ok(answer.includes('Bước 1'), 'Phải có Bước 1');
    assert.ok(answer.includes('Bước 2') && answer.includes('Quản Lý Tài Khoản'), 'Phải hướng dẫn vào Quản lý tài khoản');
    assert.ok(answer.includes('Bước 3') && answer.includes('Tìm kiếm'), 'Phải hướng dẫn tìm kiếm nhân viên');
    assert.ok(answer.includes('Bước 4') && answer.includes('Phân quyền vai trò'), 'Phải có thao tác Phân quyền vai trò');
    assert.ok(answer.includes('Bước 5') && answer.includes('ADMIN'), 'Phải hướng dẫn chọn vai trò ADMIN');
    assert.ok(answer.includes('Bước 6') && answer.includes('Lưu thay đổi'), 'Phải hướng dẫn lưu thay đổi');

    // SQL whitelist an toàn
    assert.ok(res.ket_qua_json.sql_da_thuc_thi.includes('TaiKhoan'));
    assert.doesNotThrow(() => DichVuAI.kiemTraAnToanSQL(res.ket_qua_json.sql_da_thuc_thi));
  });

  await t.test('7. Chuyển nhân viên sang Admin (RECRUITER đăng nhập): Chặn quyền hạn và cảnh báo bảo mật', async () => {
    const recruiterUser = {
      id: 'recruiter-001',
      ho_ten: 'Trần Thảo Linh',
      ten_dang_nhap: 'recruiter_linh',
      email: 'linh.tran@tuyendungai.vn',
      vai_tro: 'RECRUITER'
    };

    const res = await DichVuAI.hoiDap(
      'Tôi muốn chuyển một nhân viên sang quyền Admin. Hãy kiểm tra quyền hạn của tôi và hướng dẫn quy trình thực hiện.',
      recruiterUser
    );

    const answer = res.ket_qua_json.cau_tra_loi;
    assert.ok(answer.includes('KHÔNG CÓ QUYỀN'), 'Phải thông báo người dùng không có quyền');
    assert.ok(answer.includes('RECRUITER'), 'Phải nêu rõ vai trò hiện tại là RECRUITER');
    assert.ok(answer.includes('ADMIN (Quản trị viên)'), 'Phải nêu rõ chính sách RBAC chỉ Admin mới có quyền');
  });

  await t.test('8. 5 Biến thể câu hỏi về phân quyền/cấp quyền Admin đều được nhận diện chính xác', async () => {
    const adminUser = { id: 'admin-001', ho_ten: 'Nguyễn Quản Trị', vai_tro: 'ADMIN' };
    const variations = [
      'Làm thế nào để chuyển nhân viên thành Admin?',
      'Hướng dẫn quy trình cấp quyền Quản trị viên (ADMIN) cho nhân sự',
      'Tôi có quyền chuyển nhân viên thành Admin không? Hướng dẫn cách làm',
      'Quy trình phân quyền vai trò ADMIN cho tài khoản nhân viên',
      'Cách đổi vai trò từ Recruiter sang Admin trong hệ thống'
    ];

    for (const q of variations) {
      const res = await DichVuAI.hoiDap(q, adminUser);
      assert.ok(
        res.ket_qua_json.cau_tra_loi.includes('QUY TRÌNH THỰC HIỆN CHUYỂN NHÂN VIÊN SANG QUYỀN ADMIN'),
        `Biến thể câu hỏi "${q}" phải được nhận diện và hướng dẫn quy trình chính xác`
      );
    }
  });

  await t.test('9. Trợ lý AI ứng viên (troLyUngVien): Chặn phân quyền và nhắc nhở vai trò ứng viên', async () => {
    const candidateUser = { ho_ten: 'Phạm Minh Ứng Viên', ung_vien_id: 'uv-001' };
    const res = await DichVuAI.troLyUngVien(
      'Tôi muốn chuyển một nhân viên sang quyền Admin. Hãy kiểm tra quyền hạn của tôi và hướng dẫn quy trình thực hiện.',
      candidateUser
    );

    assert.ok(res.cau_tra_loi.includes('không có quyền'), 'Phải từ chối quyền của ứng viên');
    assert.ok(res.cau_tra_loi.includes('Ứng viên (CANDIDATE)'), 'Phải nhắc nhở vai trò hiện tại là Ứng viên');
  });
});
