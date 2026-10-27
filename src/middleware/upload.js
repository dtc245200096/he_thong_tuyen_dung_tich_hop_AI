import multer from 'multer';
import path from 'path';
import fs from 'fs';

const UPLOAD_DIR = process.env.UPLOAD_DIR || './uploads';
const CVS_DIR = path.join(UPLOAD_DIR, 'cvs');

// Đảm bảo thư mục upload tồn tại
if (!fs.existsSync(CVS_DIR)) {
  fs.mkdirSync(CVS_DIR, { recursive: true });
}

// Cấu hình lưu trữ
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, CVS_DIR);
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname).toLowerCase();
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, `CV_${uniqueSuffix}${ext}`);
  }
});

// Kiểm tra định dạng tệp: Chỉ chấp nhận PDF và DOCX
const fileFilter = (req, file, cb) => {
  const allowedExtensions = ['.pdf', '.docx'];
  const ext = path.extname(file.originalname).toLowerCase();

  const allowedMimeTypes = [
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/msword'
  ];

  if (allowedExtensions.includes(ext) || allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    const error = new Error('Định dạng tệp không hợp lệ. Hệ thống chỉ chấp nhận tệp định dạng PDF hoặc DOCX.');
    error.code = 'INVALID_FILE_TYPE';
    cb(error, false);
  }
};

// Giới hạn dung lượng: 10 MiB (10 * 1024 * 1024 = 10.485.760 bytes)
export const MAX_FILE_SIZE_BYTES = 10485760;

export const uploadCV = multer({
  storage: storage,
  limits: {
    fileSize: MAX_FILE_SIZE_BYTES
  },
  fileFilter: fileFilter
}).single('file_cv');

/**
 * Middleware bọc multer để bắt lỗi kích thước và định dạng tệp gọn gàng
 */
export function handleUploadCV(req, res, next) {
  uploadCV(req, res, function (err) {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({
          success: false,
          error: 'LIMIT_FILE_SIZE',
          message: 'Dung lượng tệp CV vượt quá giới hạn cho phép (Tối đa 10 MiB).'
        });
      }
      return res.status(400).json({
        success: false,
        error: err.code,
        message: `Lỗi tải tệp: ${err.message}`
      });
    } else if (err) {
      return res.status(400).json({
        success: false,
        error: err.code || 'UPLOAD_ERROR',
        message: err.message
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng đính kèm tệp tin CV (PDF hoặc DOCX).'
      });
    }

    next();
  });
}
