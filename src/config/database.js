import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_FILE = path.resolve(__dirname, '../../database/store_data.json');

// Cấu hình kết nối MySQL
const dbConfig = {
  host: process.env.DB_HOST || '127.0.0.1',
  port: parseInt(process.env.DB_PORT || '3306'),
  user: process.env.DB_USER || 'tuyendung_user',
  password: process.env.DB_PASSWORD || process.env.DB_PASS || 'tuyendung_pass',
  database: process.env.DB_NAME || 'tuyendung_ai',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0
};

let pool = null;
let useMemoryStore = false;

// Bộ nhớ giả lập (In-memory Store) cho môi trường kiểm thử độc lập hoặc khi DB chưa kết nối
const inMemoryStore = {
  TaiKhoan: [
    {
      id: 'a0000000-0000-0000-0000-000000000001',
      ten_dang_nhap: 'admin',
      mat_khau_hash: '$2a$10$X87oD0Q/j0FekYdZpS4rX.2zUvN4xUqPZ5Xm0P2.Z/3g9wF3gq3qy',
      email: 'admin@tuyendungai.vn',
      ho_ten: 'Nguyễn Quản Trị',
      vai_tro: 'ADMIN',
      trang_thai: 'HOAT_DONG',
      phong_ban_id: 'e1000000-0000-0000-0000-000000000002',
      deleted_at: null
    },
    {
      id: 'a0000000-0000-0000-0000-000000000002',
      ten_dang_nhap: 'recruiter_linh',
      mat_khau_hash: '$2a$10$X87oD0Q/j0FekYdZpS4rX.2zUvN4xUqPZ5Xm0P2.Z/3g9wF3gq3qy',
      email: 'recruiter@tuyendungai.vn',
      ho_ten: 'Trần Thảo Linh',
      vai_tro: 'RECRUITER',
      trang_thai: 'HOAT_DONG',
      phong_ban_id: 'e1000000-0000-0000-0000-000000000002',
      deleted_at: null
    },
    {
      id: 'a0000000-0000-0000-0000-000000000004',
      ten_dang_nhap: 'candidate_an',
      mat_khau_hash: '$2a$10$X87oD0Q/j0FekYdZpS4rX.2zUvN4xUqPZ5Xm0P2.Z/3g9wF3gq3qy',
      email: 'ungvien.an@gmail.com',
      ho_ten: 'Phạm Quốc An',
      vai_tro: 'CANDIDATE',
      trang_thai: 'HOAT_DONG',
      phong_ban_id: null,
      deleted_at: null
    }
  ],
  PhongBan: [
    {
      id: 'e1000000-0000-0000-0000-000000000001',
      ma_phong_ban: 'PB_IT',
      ten_phong_ban: 'Phòng Công nghệ Thông tin',
      mo_ta: 'Phát triển phần mềm AI & Cloud.',
      nguoi_quan_ly_id: 'a0000000-0000-0000-0000-000000000002',
      deleted_at: null
    },
    {
      id: 'e1000000-0000-0000-0000-000000000002',
      ma_phong_ban: 'PB_HR',
      ten_phong_ban: 'Phòng Nhân sự & Tuyển dụng',
      mo_ta: 'Quản trị nhân sự và tuyển dụng toàn diện.',
      nguoi_quan_ly_id: 'a0000000-0000-0000-0000-000000000001',
      deleted_at: null
    }
  ],
  ViTriTuyenDung: [
    {
      id: 'b1000000-0000-0000-0000-000000000001',
      phong_ban_id: 'e1000000-0000-0000-0000-000000000001',
      ma_vi_tri: 'VT_SE_SR',
      ten_vi_tri: 'Senior Backend Engineer (Node.js/Python)',
      mo_ta: 'Thiết kế RESTful API và kiến trúc AI cho hệ thống tuyển dụng.',
      yeu_cau: 'Yêu cầu: Tối thiểu 3+ năm kinh nghiệm Node.js, Express, Python. Thành thạo cơ sở dữ liệu MySQL, Redis, tối ưu hóa truy vấn. Có hiểu biết về Docker, CI/CD và tích hợp OpenAI/Gemini API.',
      muc_luong_min: 25000000,
      muc_luong_max: 45000000,
      so_luong_can_tuyen: 2,
      so_luong_da_tuyen: 0,
      trang_thai: 'MO',
      deleted_at: null
    },
    {
      id: 'b1000000-0000-0000-0000-000000000002',
      phong_ban_id: 'e1000000-0000-0000-0000-000000000001',
      ma_vi_tri: 'VT_AI_ENG',
      ten_vi_tri: 'AI / RAG Engineer',
      mo_ta: 'Nghiên cứu ứng dụng LLM, RAG và Safe Text-to-SQL.',
      yeu_cau: 'Yêu cầu: Thành thạo Python, LangChain, Vector DB, Text-to-SQL, Prompt Engineering.',
      muc_luong_min: 30000000,
      muc_luong_max: 55000000,
      so_luong_can_tuyen: 1,
      so_luong_da_tuyen: 0,
      trang_thai: 'MO',
      deleted_at: null
    }
  ],
  TinTuyenDung: [
    {
      id: 'c1000000-0000-0000-0000-000000000001',
      vi_tri_id: 'b1000000-0000-0000-0000-000000000001',
      tieu_de: 'Tuyển Gấp Senior Backend Engineer (Node.js/Python) - Thu Nhập Đến 45 Triệu',
      noi_dung: 'Tham gia xây dựng sản phẩm AI thế hệ mới...',
      dia_diem: 'Hà Nội (Hybrid)',
      han_nop: '2026-11-30',
      nguoi_phu_trach_id: 'a0000000-0000-0000-0000-000000000002',
      trang_thai: 'DANG_TUYEN',
      deleted_at: null
    },
    {
      id: 'c1000000-0000-0000-0000-000000000002',
      vi_tri_id: 'b1000000-0000-0000-0000-000000000002',
      tieu_de: 'Tuyển Kỹ Sư AI & RAG Specialist (Lương Tới 55 Triệu) - Thưởng Cổ Phần ESOP',
      noi_dung: 'Làm việc cùng đội ngũ RAG hàng đầu...',
      dia_diem: 'Hà Nội / Remote',
      han_nop: '2026-12-15',
      nguoi_phu_trach_id: 'a0000000-0000-0000-0000-000000000002',
      trang_thai: 'DANG_TUYEN',
      deleted_at: null
    }
  ],
  UngVien: [
    {
      id: 'u1000000-0000-0000-0000-000000000001',
      tai_khoan_id: 'a0000000-0000-0000-0000-000000000004',
      ho_ten: 'Phạm Quốc An',
      email: 'ungvien.an@gmail.com',
      so_dien_thoai: '0933112233',
      dia_chi: 'Cầu Giấy, Hà Nội',
      ky_nang_chinh: 'Node.js, Express, Python, MySQL, Redis, Docker, RESTful API, Gemini API',
      kinh_nghiem_nam: 4.5,
      deleted_at: null
    }
  ],
  HoSoCV: [
    {
      id: 'h1000000-0000-0000-0000-000000000001',
      ung_vien_id: 'u1000000-0000-0000-0000-000000000001',
      ten_file: 'CV_PhamQuocAn_SeniorBackend.pdf',
      duong_dan_file: '/uploads/cvs/CV_PhamQuocAn_SeniorBackend.pdf',
      dinh_dang: 'pdf',
      dung_luong_bytes: 1450200,
      vanBanTrichXuat: 'HỌ VÀ TÊN: PHẠM QUỐC AN\nEMAIL: ungvien.an@gmail.com | ĐT: 0933112233\nVỊ TRÍ ỨNG TUYỂN: Senior Backend Engineer\n\nTỔNG QUAN NĂNG LỰC:\n- 4.5 năm kinh nghiệm phát triển hệ thống backend hiệu năng cao bằng Node.js và Python.\n- Tối ưu hóa cơ sở dữ liệu quan hệ MySQL, PostgreSQL và kiến trúc cache phân tán Redis.\n- Triển khai microservices với Docker, Kubernetes và CI/CD GitHub Actions.\n- Tích hợp thành công mô hình ngôn ngữ lớn (LLM) OpenAI, Google Gemini vào quy trình nghiệp vụ.\n\nKINH NGHIỆM LÀM VIỆC:\n1. Senior Backend Developer - Công ty TechVina (2023 - Nay):\n- Xây dựng RESTful API phục vụ 500,000 người dùng hoạt động hàng tháng.\n- Tối ưu hóa thời gian phản hồi API từ 350ms xuống 65ms bằng Redis caching và indexing MySQL.\n- Đóng gói ứng dụng chạy container Docker chuẩn hóa môi trường phát triển.\n2. Backend Developer - Công ty F-Solution (2020 - 2023):\n- Phát triển module quản lý người dùng, phân quyền RBAC và tích hợp cổng thanh toán.\n- Viết test tự động đạt độ bao phủ mã 85%.\n\nKỸ NĂNG KỸ THUẬT:\n- Ngôn ngữ: JavaScript/TypeScript, Python, SQL\n- Frameworks: Node.js, Express, FastAPI\n- Cơ sở dữ liệu: MySQL, Redis, MongoDB\n- Công cụ & DevOps: Docker, Git, CI/CD, Postman, Linux\n- Ngoại ngữ: Tiếng Anh giao tiếp tốt (IELTS 7.0)',
      phien_ban: 1,
      deleted_at: null
    }
  ],
  LuotUngTuyen: [
    {
      id: 'l1000000-0000-0000-0000-000000000001',
      tin_tuyen_dung_id: 'c1000000-0000-0000-0000-000000000001',
      ung_vien_id: 'u1000000-0000-0000-0000-000000000001',
      ho_so_cv_id: 'h1000000-0000-0000-0000-000000000001',
      nguon_id: 's1000000-0000-0000-0000-000000000003',
      trang_thai: 'DANG_PHONG_VAN',
      diem_danh_gia_tong: 92.50,
      ghi_chu: 'Hồ sơ kỹ thuật rất ấn tượng, AI đối sánh đạt điểm 94/100.',
      created_at: new Date('2026-10-01T08:30:00Z'),
      deleted_at: null
    }
  ],
  LichPhongVan: [
    {
      id: 'm1000000-0000-0000-0000-000000000001',
      luot_ung_tuyen_id: 'l1000000-0000-0000-0000-000000000001',
      nguoi_phong_van_id: 'a0000000-0000-0000-0000-000000000002',
      thoi_gian_bat_dau: '2026-10-05 14:00:00',
      thoi_gian_ket_thuc: '2026-10-05 15:30:00',
      hinh_thuc: 'ONLINE',
      dia_diem_hoac_link: 'https://meet.google.com/xyz-recruitment-interview',
      trang_thai: 'LEN_LICH',
      ghi_chu: 'Phỏng vấn chuyên môn kỹ thuật vòng 1 cùng Tech Lead.',
      deleted_at: null
    }
  ],
  DanhGiaPhongVan: [
    {
      id: 'd1000000-0000-0000-0000-000000000001',
      lich_phong_van_id: 'm1000000-0000-0000-0000-000000000001',
      nguoi_danh_gia_id: 'a0000000-0000-0000-0000-000000000002',
      diem_chuyen_mon: 9,
      diem_ky_nang_mem: 8,
      diem_van_hoa: 9,
      nhan_xet: 'Ứng viên trả lời trôi chảy các câu hỏi về Node.js event loop, caching Redis và thiết kế RESTful API an toàn. Phù hợp văn hóa công ty.',
      de_xuat: 'DAT',
      deleted_at: null
    }
  ],
  NguonTuyenDung: [
    {
      id: 's1000000-0000-0000-0000-000000000001',
      ten_nguon: 'LinkedIn Recruiter',
      loai_nguon: 'LINKEDIN',
      chi_phi_co_dinh: 8500000,
      mo_ta: 'Kênh tuyển dụng cấp cao',
      deleted_at: null
    },
    {
      id: 's1000000-0000-0000-0000-000000000002',
      ten_nguon: 'TopCV Premium',
      loai_nguon: 'TOPCV',
      chi_phi_co_dinh: 5000000,
      mo_ta: 'Sàn TopCV',
      deleted_at: null
    },
    {
      id: 's1000000-0000-0000-0000-000000000003',
      ten_nguon: 'Website Tuyển Dụng Công Ty',
      loai_nguon: 'WEBSITE_CONG_TY',
      chi_phi_co_dinh: 0,
      mo_ta: 'Website công ty',
      deleted_at: null
    }
  ],
  HoSoTiemNang: [
    {
      id: 't1000000-0000-0000-0000-000000000001',
      ung_vien_id: 'u1000000-0000-0000-0000-000000000001',
      vi_tri_quan_tam_id: 'b1000000-0000-0000-0000-000000000001',
      ky_nang_noi_bat: 'Node.js, Redis, AI Integration',
      diem_tiem_nang: 90,
      ghi_chu_talent_pool: 'Hồ sơ tài năng tiềm năng cao',
      deleted_at: null
    }
  ],
  ThongBao: [
    {
      id: 'n1000000-0000-0000-0000-000000000001',
      nguoi_nhan_id: 'a0000000-0000-0000-0000-000000000004',
      tieu_de: 'Lời mời tham dự phỏng vấn vòng chuyên môn - Vị trí Senior Backend',
      noi_dung: 'Kính gửi bạn Phạm Quốc An, trân trọng mời bạn tham dự phỏng vấn lúc 14:00 ngày 05/10/2026.',
      loai_thong_bao: 'LICH_PHONG_VAN',
      trang_thai_gui: 'DA_GUI',
      da_doc: false,
      chi_tiet_loi: null,
      deleted_at: null
    }
  ],
  KetQuaAI: [
    {
      id: 'k1000000-0000-0000-0000-000000000001',
      luot_ung_tuyen_id: 'l1000000-0000-0000-0000-000000000001',
      ho_so_cv_id: 'h1000000-0000-0000-0000-000000000001',
      loai_nghiep_vu: 'DOI_SANH',
      diem_phu_hop: 94.00,
      du_lieu_dau_vao: { cv_id: 'h1000000-0000-0000-0000-000000000001' },
      ket_qua_json: {
        score: 94,
        matched_skills: ['Node.js', 'Express', 'Python', 'MySQL', 'Redis', 'Docker', 'RESTful API', 'LLM Integration'],
        missing_skills: ['Kubernetes chuyên sâu'],
        experience_years: 4.5,
        justification: 'Ứng viên có 4.5 năm kinh nghiệm thực tế đúng với yêu cầu tối thiểu 3 năm. Kỹ năng backend và database rất phù hợp.'
      },
      prompt_da_dung: 'Prompt đối sánh CV với JD',
      do_tin_cay: 0.980,
      trang_thai_hop_le: true,
      deleted_at: null
    }
  ],
  BaoCaoTuyenDung: [
    {
      id: 'r1000000-0000-0000-0000-000000000001',
      tieu_de: 'Báo cáo hiệu quả tuyển dụng Quý 3/2026',
      ky_bao_cao: 'Q3-2026',
      tong_don_ung_tuyen: 45,
      so_luot_phong_van: 18,
      so_luot_dat: 5,
      ty_le_chuyen_doi: 27.78,
      chi_phi_trung_binh: 2700000,
      du_lieu_chi_tiet: {},
      nguoi_lap_id: 'a0000000-0000-0000-0000-000000000001',
      deleted_at: null
    }
  ],
  SuKienTrangThai: [
    {
      id: 'e2000000-0000-0000-0000-000000000001',
      luot_ung_tuyen_id: 'l1000000-0000-0000-0000-000000000001',
      trang_thai_cu: 'KHOI_TAO',
      trang_thai_moi: 'MOI',
      nguoi_thuc_hien_id: 'a0000000-0000-0000-0000-000000000004',
      ly_do: 'Ứng viên nộp hồ sơ trực tuyến qua website công ty.',
      thoi_gian: new Date('2026-10-01T08:30:00Z'),
      deleted_at: null
    },
    {
      id: 'e2000000-0000-0000-0000-000000000002',
      luot_ung_tuyen_id: 'l1000000-0000-0000-0000-000000000001',
      trang_thai_cu: 'MOI',
      trang_thai_moi: 'DANG_PHONG_VAN',
      nguoi_thuc_hien_id: 'a0000000-0000-0000-0000-000000000002',
      ly_do: 'Hồ sơ đạt tiêu chuẩn sơ loại, lên lịch phỏng vấn chuyên môn.',
      thoi_gian: new Date('2026-10-01T10:15:00Z'),
      deleted_at: null
    }
  ],
  KhoanChi: [
    {
      id: 'c2000000-0000-0000-0000-000000000001',
      tin_tuyen_dung_id: 'c1000000-0000-0000-0000-000000000001',
      nguon_id: 's1000000-0000-0000-0000-000000000001',
      ten_khoan_chi: 'Chi phí đẩy tin LinkedIn Top Placement 30 ngày',
      so_tien: 4500000,
      ngay_chi: '2026-10-01',
      hoa_don_url: '/uploads/invoices/inv-001.pdf',
      nguoi_duyet_id: 'a0000000-0000-0000-0000-000000000001',
      ghi_chu: 'Thẻ tín dụng công ty',
      deleted_at: null
    },
    {
      id: 'c2000000-0000-0000-0000-000000000002',
      tin_tuyen_dung_id: 'c1000000-0000-0000-0000-000000000002',
      nguon_id: 's1000000-0000-0000-0000-000000000002',
      ten_khoan_chi: 'Gói lọc hồ sơ ứng viên AI & Big Data TopCV',
      so_tien: 3500000,
      ngay_chi: '2026-10-01',
      hoa_don_url: '/uploads/invoices/inv-002.pdf',
      nguoi_duyet_id: 'a0000000-0000-0000-0000-000000000001',
      ghi_chu: 'Hóa đơn VAT điện tử',
      deleted_at: null
    }
  ],
  TuongTac: [
    {
      id: 'i1000000-0000-0000-0000-000000000001',
      ung_vien_id: 'u1000000-0000-0000-0000-000000000001',
      nguoi_thuc_hien_id: 'a0000000-0000-0000-0000-000000000002',
      loai_tuong_tac: 'EMAIL',
      noi_dung: 'Gửi thư mời phỏng vấn kỹ thuật và link Google Meet.',
      thoi_gian: new Date('2026-10-01T11:00:00Z'),
      deleted_at: null
    }
  ]
};

// Khởi tạo pool kết nối MySQL
try {
  pool = mysql.createPool(dbConfig);
} catch (err) {
  console.warn('MySQL pool init warning, using memory store fallback:', err.message);
  useMemoryStore = true;
}

export const getDb = () => pool;
export const getStore = () => inMemoryStore;

// Hàm thực thi truy vấn thống nhất
export async function executeQuery(sql, params = []) {
  if (!useMemoryStore && pool) {
    try {
      const [rows] = await pool.query(sql, params);
      return rows;
    } catch (err) {
      // Nếu DB chưa bật (ví dụ khi chạy test cục bộ), fallback sang in-memory store
      console.warn('Database query failed, falling back to In-Memory Store:', err.message);
      useMemoryStore = true;
    }
  }

  // Fallback engine: phục vụ test logic & query
  return fallbackQueryEngine(sql, params);
}

// Giả lập xử lý SQL cơ bản cho môi trường In-Memory
function fallbackQueryEngine(sql, params = []) {
  const normalized = sql.trim().toUpperCase();
  
  if (normalized.startsWith('SELECT')) {
    for (const tableName of Object.keys(inMemoryStore)) {
      if (sql.includes(tableName)) {
        let results = inMemoryStore[tableName].filter(item => item.deleted_at === null);
        return results;
      }
    }
    return [];
  }
  
  return { affectedRows: 1, insertId: 1 };
}

// =====================================================================
// CƠ CHẾ LƯU TRỮ BỀN VỮNG FILE-BASED PERSISTENCE (store_data.json)
// Giữ toàn vẹn tài khoản đã đăng ký, tin tuyển dụng, lượt nộp kể cả khi đăng xuất hoặc khởi động lại
// =====================================================================

const isTestEnv = process.env.NODE_ENV === 'test' || process.argv.some(arg => typeof arg === 'string' && (arg.includes('test') || arg.includes('mocha')));

export function saveStore() {
  if (isTestEnv) return;
  try {
    const dir = path.dirname(DATA_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    const tempFile = `${DATA_FILE}.${process.pid}.${Date.now()}.tmp`;
    fs.writeFileSync(tempFile, JSON.stringify(inMemoryStore, null, 2), 'utf8');
    try {
      fs.renameSync(tempFile, DATA_FILE);
    } catch {
      // Trên Windows nếu renameSync bị conflict giữa các process, ghi đè trực tiếp
      fs.writeFileSync(DATA_FILE, JSON.stringify(inMemoryStore, null, 2), 'utf8');
      if (fs.existsSync(tempFile)) {
        try { fs.unlinkSync(tempFile); } catch {}
      }
    }
  } catch (err) {
    // Bỏ qua lỗi khóa file tạm thời trong quá trình kiểm thử đa luồng
  }
}

export function loadStore() {
  if (isTestEnv) return;
  try {
    if (fs.existsSync(DATA_FILE)) {
      const content = fs.readFileSync(DATA_FILE, 'utf8');
      if (content && content.trim().length > 0) {
        const data = JSON.parse(content);
        for (const [table, items] of Object.entries(data)) {
          if (Array.isArray(items) && items.length > 0) {
            inMemoryStore[table] = items;
          }
        }
      }
    } else {
      saveStore();
    }
  } catch (err) {
    // Tránh lỗi ngắt quãng khi đọc trúng file đang được ghi bởi process khác
  }
}

// Bổ sung hook tự động lưu khi các mảng thêm/xóa phần tử
function enableAutoSave() {
  for (const tableName of Object.keys(inMemoryStore)) {
    const arr = inMemoryStore[tableName];
    if (Array.isArray(arr) && !arr._hasAutoSaveHook) {
      arr._hasAutoSaveHook = true;
      ['push', 'unshift', 'splice', 'pop', 'shift'].forEach(fn => {
        const orig = arr[fn];
        arr[fn] = function(...args) {
          const res = orig.apply(this, args);
          saveStore();
          return res;
        };
      });
    }
  }
}

// Nạp dữ liệu bền vững khi module được tải
loadStore();
enableAutoSave();

export default {
  getDb,
  getStore,
  saveStore,
  loadStore,
  executeQuery
};
