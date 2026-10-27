import jwt from 'jsonwebtoken';
import { getStore } from '../config/database.js';

const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_jwt_key_recruitment_ai_2026_secure';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

/**
 * Ký tạo JWT Token cho người dùng
 */
export function generateToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

/**
 * Middleware xác thực Bearer Token
 */
export function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Chưa cung cấp token xác thực (Bearer Token).'
    });
  }

  jwt.verify(token, JWT_SECRET, (err, decodedUser) => {
    if (err) {
      return res.status(403).json({
        success: false,
        message: 'Token không hợp lệ hoặc đã hết hạn.'
      });
    }

    req.user = decodedUser;
    next();
  });
}

/**
 * Middleware kiểm tra vai trò (RBAC)
 * @param  {...string} allowedRoles Các vai trò được phép (ADMIN, RECRUITER, CANDIDATE)
 */
export function requireRoles(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user || !req.user.vai_tro) {
      return res.status(401).json({
        success: false,
        message: 'Yêu cầu đăng nhập để truy cập tài nguyên.'
      });
    }

    const userRole = req.user.vai_tro;
    // ADMIN được trao toàn bộ thẩm quyền của cả ADMIN và RECRUITER
    const hasRole = allowedRoles.includes(userRole) || (userRole === 'ADMIN' && allowedRoles.includes('RECRUITER'));

    if (!hasRole) {
      return res.status(403).json({
        success: false,
        message: `Từ chối truy cập: Vai trò '${req.user.vai_tro}' không có quyền thực hiện hành động này.`
      });
    }

    next();
  };
}

/**
 * Middleware phân quyền phạm vi của Nhân viên tuyển dụng (Recruiter Scope)
 * Nhân viên chỉ được sửa, đóng tin, xem thống kê của các tin tuyển dụng do chính mình phụ trách
 */
export function checkRecruiterScope(req, res, next) {
  const user = req.user;
  if (!user) {
    return res.status(401).json({ success: false, message: 'Chưa xác thực người dùng.' });
  }

  // Quản lý/Admin có quyền toàn hệ thống
  if (user.vai_tro === 'ADMIN') {
    return next();
  }

  // Nếu là Recruiter, kiểm tra phạm vi phụ trách của tin tuyển dụng
  const tinId = req.params.tinId || req.params.id || req.body.tin_tuyen_dung_id;
  if (!tinId) {
    return next();
  }

  const store = getStore();
  const tin = store.TinTuyenDung.find(t => t.id === tinId && t.deleted_at === null);

  if (!tin) {
    return res.status(404).json({ success: false, message: 'Không tìm thấy tin tuyển dụng.' });
  }

  if (tin.nguoi_phu_trach_id !== user.id) {
    return res.status(403).json({
      success: false,
      message: 'Từ chối truy cập: Bạn không có quyền thao tác trên tin tuyển dụng ngoài phạm vi phụ trách.'
    });
  }

  req.targetTin = tin;
  next();
}

/**
 * Middleware phân quyền ứng viên (Candidate Ownership)
 * Ứng viên chỉ được xem trạng thái ứng tuyển, lịch phỏng vấn, thông báo của chính mình
 */
export function checkCandidateOwnership(req, res, next) {
  const user = req.user;
  if (!user) {
    return res.status(401).json({ success: false, message: 'Chưa xác thực người dùng.' });
  }

  // Admin và Recruiter được phép xem để xử lý nghiệp vụ
  if (user.vai_tro === 'ADMIN' || user.vai_tro === 'RECRUITER') {
    return next();
  }

  // Nếu là Ứng viên (CANDIDATE)
  const targetUngVienId = req.params.ungVienId || req.query.ung_vien_id || req.body.ung_vien_id;
  
  if (targetUngVienId && user.ung_vien_id && targetUngVienId !== user.ung_vien_id) {
    return res.status(403).json({
      success: false,
      message: 'Từ chối truy cập: Ứng viên chỉ được phép xem thông tin và lịch trình của chính mình.'
    });
  }

  next();
}
