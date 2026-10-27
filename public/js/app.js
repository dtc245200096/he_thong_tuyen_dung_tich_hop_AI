/**
 * APP.JS - CORE CLIENT APPLICATION & AUTH UTILITIES
 */

const API_BASE = '/api';

// Quản lý Token & Thông tin phiên đăng nhập
export const authState = {
  getToken() {
    return localStorage.getItem('tuyendung_jwt_token') || '';
  },
  setToken(token) {
    localStorage.setItem('tuyendung_jwt_token', token);
  },
  getUser() {
    try {
      return JSON.parse(localStorage.getItem('tuyendung_user') || 'null');
    } catch {
      return null;
    }
  },
  setUser(user) {
    localStorage.setItem('tuyendung_user', JSON.stringify(user));
  },
  clear() {
    localStorage.removeItem('tuyendung_jwt_token');
    localStorage.removeItem('tuyendung_user');
  }
};

// Đăng xuất và điều hướng về trang chủ (Ghi nhớ tên tài khoản gần nhất)
export function logout() {
  const user = authState.getUser();
  if (user && user.ten_dang_nhap) {
    localStorage.setItem('tuyendung_last_username', user.ten_dang_nhap);
  }
  authState.clear();
  window.location.href = '/index.html';
}

// Hàm gửi request kèm Bearer JWT Token
export async function fetchWithAuth(endpoint, options = {}) {
  const token = authState.getToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {})
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers
  });

  const data = await response.json();
  if (response.status === 401 || response.status === 403) {
    // Nếu token hết hạn hoặc không có quyền
    if (data.message && data.message.includes('Token')) {
      authState.clear();
      window.location.href = '/index.html';
    }
  }

  if (!response.ok) {
    throw new Error(data.message || `Lỗi yêu cầu: ${response.status}`);
  }
  return data;
}

// Thông báo Toast góc màn hình
export function showToast(message, type = 'info') {
  let container = document.getElementById('toastContainer');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toastContainer';
    container.className = 'toast-container';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  const icon = type === 'success' ? '✅' : type === 'error' ? '❌' : 'ℹ️';
  toast.innerHTML = `<span>${icon}</span><span>${message}</span>`;
  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(100%)';
    toast.style.transition = 'all 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 4000);
}

// Định dạng tiền tệ VNĐ
export function formatCurrency(amount) {
  if (amount === null || amount === undefined) return '0 ₫';
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
}

// Định dạng ngày giờ
export function formatDate(dateString) {
  if (!dateString) return 'N/A';
  const d = new Date(dateString);
  return d.toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}
