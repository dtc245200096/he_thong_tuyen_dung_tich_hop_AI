import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import apiRoutes from './routes/api.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware cơ bản
app.use(cors());
app.use(express.json({ limit: '15mb' }));
app.use(express.urlencoded({ extended: true, limit: '15mb' }));

// Static files (Uploads & Frontend Web UI)
app.use('/uploads', express.static(path.join(rootDir, 'uploads')));
app.use(express.static(path.join(rootDir, 'public')));

// Gắn API Routes
app.use('/api', apiRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'UP',
    timestamp: new Date().toISOString(),
    service: 'Hệ thống Quản lý Tuyển dụng AI (Smart Recruitment System)'
  });
});

// Xử lý lỗi toàn cục (Global Error Handler)
app.use((err, req, res, next) => {
  console.error('Unhandled Server Error:', err);
  res.status(err.status || 500).json({
    success: false,
    error: err.name || 'INTERNAL_SERVER_ERROR',
    message: err.message || 'Đã có lỗi xảy ra trên hệ thống.'
  });
});

// Khởi chạy server nếu được gọi trực tiếp
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`=======================================================`);
    console.log(`🚀 HỆ THỐNG QUẢN LÝ TUYỂN DỤNG AI ĐANG CHẠY TẠI CỔNG ${PORT}`);
    console.log(`👉 Web Portal: http://localhost:${PORT}`);
    console.log(`👉 Quản lý / Admin: http://localhost:${PORT}/admin.html`);
    console.log(`👉 Tuyển dụng / Recruiter: http://localhost:${PORT}/recruiter.html`);
    console.log(`👉 Ứng viên / Candidate: http://localhost:${PORT}/candidate.html`);
    console.log(`👉 API Endpoint: http://localhost:${PORT}/api`);
    console.log(`=======================================================`);
  });
}

export default app;
