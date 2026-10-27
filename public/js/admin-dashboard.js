import { fetchWithAuth, authState, logout, showToast, formatCurrency } from './app.js';

window.closeModal = function(id) {
  document.getElementById(id).classList.remove('active');
};

document.addEventListener('DOMContentLoaded', async () => {
  // KIỂM TRA ĐĂNG NHẬP & PHÂN QUYỀN VAI TRÒ
  // Bắt buộc phải đăng nhập với vai trò ADMIN mới được vào Dashboard Quản Trị
  const token = authState.getToken();
  const user = authState.getUser();

  if (!token || !user || user.vai_tro !== 'ADMIN') {
    // Chưa đăng nhập hoặc vai trò khác -> Chuyển hướng tới trang Đăng nhập Admin
    window.location.href = '/login.html?role=ADMIN';
    return;
  }

  if (document.getElementById('currentUserName')) {
    document.getElementById('currentUserName').innerText = user.ho_ten;
  }

  // Xử lý Đăng Xuất
  const handleLogout = () => {
    if (confirm('Bạn có chắc chắn muốn đăng xuất khỏi phiên làm việc Quản trị viên?')) {
      logout();
    }
  };
  const btnTopLogout = document.getElementById('btnTopbarLogout');
  if (btnTopLogout) btnTopLogout.addEventListener('click', handleLogout);
  const btnSideLogout = document.getElementById('btnSidebarLogout');
  if (btnSideLogout) btnSideLogout.addEventListener('click', handleLogout);

  // Chuyển Tab nội bộ Dashboard
  document.querySelectorAll('.nav-link[data-tab]').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
      document.querySelectorAll('.tab-content').forEach(c => c.style.display = 'none');

      tab.classList.add('active');
      const targetId = `tab-${tab.getAttribute('data-tab')}`;
      const targetEl = document.getElementById(targetId);
      if (targetEl) targetEl.style.display = 'block';
    });
  });

  // Tải dữ liệu ban đầu
  await loadOverview();
  await loadPositions();
  await loadExpenses();
  await loadAccounts();

  // Khởi tạo Chatbot Text-to-SQL
  initChatbot();

  // Bộ lọc tài khoản
  const searchInput = document.getElementById('accSearchInput');
  const roleFilter = document.getElementById('accRoleFilter');
  const statusFilter = document.getElementById('accStatusFilter');
  if (searchInput) searchInput.addEventListener('input', () => loadAccounts());
  if (roleFilter) roleFilter.addEventListener('change', () => loadAccounts());
  if (statusFilter) statusFilter.addEventListener('change', () => loadAccounts());

  // Form Tạo Tài Khoản Mới
  const createAccForm = document.getElementById('createAccountForm');
  if (createAccForm) {
    createAccForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      try {
        const payload = {
          ho_ten: document.getElementById('newAccFullName').value.trim(),
          ten_dang_nhap: document.getElementById('newAccUsername').value.trim(),
          email: document.getElementById('newAccEmail').value.trim(),
          so_dien_thoai: document.getElementById('newAccPhone').value.trim(),
          mat_khau: document.getElementById('newAccPassword').value,
          vai_tro: document.getElementById('newAccRole').value,
          phong_ban_id: document.getElementById('newAccDept').value || null
        };

        const res = await fetchWithAuth('/tai-khoan', {
          method: 'POST',
          body: JSON.stringify(payload)
        });

        if (res.success) {
          showToast(`Tạo tài khoản '${payload.ten_dang_nhap}' thành công!`, 'success');
          window.closeModal('createAccountModal');
          createAccForm.reset();
          await loadAccounts();
        }
      } catch (err) {
        showToast(err.message, 'error');
      }
    });
  }

  // Form Cập Nhật Quyền / Phân Quyền
  const changeRoleForm = document.getElementById('changeRoleForm');
  if (changeRoleForm) {
    changeRoleForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const userId = document.getElementById('changeRoleUserId').value;
      const newRole = document.getElementById('changeRoleSelect').value;

      try {
        const res = await fetchWithAuth(`/tai-khoan/${userId}/vai-tro`, {
          method: 'PATCH',
          body: JSON.stringify({ vai_tro: newRole })
        });

        if (res.success) {
          showToast(res.message, 'success');
          window.closeModal('changeRoleModal');
          await loadAccounts();
        }
      } catch (err) {
        showToast(err.message, 'error');
      }
    });
  }

  // Sự kiện sinh báo cáo AI
  document.getElementById('btnRunAiReport').addEventListener('click', async () => {
    try {
      showToast('Đang kết nối AI sinh báo cáo phân tích...', 'info');
      const res = await fetchWithAuth('/ai/sinh-bao-cao', { method: 'POST', body: JSON.stringify({}) });
      if (res.success) {
        const out = document.getElementById('aiReportOutput');
        out.style.display = 'block';
        out.innerHTML = `
          <h4 style="color:#a5b4fc; margin-bottom:0.5rem;">📄 Báo Cáo Phân Tích AI (BAO_CAO)</h4>
          <p style="margin-bottom:0.75rem;">${res.data.ket_qua_json.summary}</p>
          <div style="font-size:0.85rem; color:var(--text-secondary);">
            <strong>Khuyến nghị từ AI:</strong>
            <ul style="margin-left:1.25rem; margin-top:0.25rem;">
              ${res.data.ket_qua_json.recommendations.map(r => `<li>${r}</li>`).join('')}
            </ul>
          </div>
        `;
        showToast('Sinh báo cáo AI thành công!', 'success');
      }
    } catch (err) {
      showToast(err.message, 'error');
    }
  });

  // Thêm vị trí mới
  const addPosBtn = document.getElementById('btnOpenAddPositionModal');
  if (addPosBtn) {
    addPosBtn.addEventListener('click', async () => {
      try {
        const res = await fetchWithAuth('/phong-ban');
        const select = document.getElementById('posDeptSelect');
        select.innerHTML = res.data.map(p => `<option value="${p.id}">${p.ten_phong_ban}</option>`).join('');
        document.getElementById('addPositionModal').classList.add('active');
      } catch (err) {
        showToast(err.message, 'error');
      }
    });
  }

  document.getElementById('addPositionForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    try {
      const payload = {
        phong_ban_id: document.getElementById('posDeptSelect').value,
        ma_vi_tri: document.getElementById('posCode').value,
        ten_vi_tri: document.getElementById('posTitle').value,
        mo_ta: document.getElementById('posTitle').value,
        yeu_cau: document.getElementById('posReq').value,
        muc_luong_min: 20000000,
        muc_luong_max: 35000000,
        so_luong_can_tuyen: 2
      };

      const res = await fetchWithAuth('/vi-tri', {
        method: 'POST',
        body: JSON.stringify(payload)
      });

      if (res.success) {
        showToast('Tạo vị trí tuyển dụng thành công.', 'success');
        window.closeModal('addPositionModal');
        await loadPositions();
      }
    } catch (err) {
      showToast(err.message, 'error');
    }
  });

  // Mở modal Thêm Khoản Chi Tuyển Dụng
  const addExpenseBtn = document.getElementById('btnOpenAddExpenseModal');
  if (addExpenseBtn) {
    addExpenseBtn.addEventListener('click', () => window.openAddExpenseModal());
  }

  // Xử lý gửi Form Thêm Khoản Chi Mới
  const addExpenseForm = document.getElementById('addExpenseForm');
  if (addExpenseForm) {
    addExpenseForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      try {
        const payload = {
          ten_khoan_chi: document.getElementById('expTitle').value.trim(),
          so_tien: parseFloat(document.getElementById('expAmount').value),
          ngay_chi: document.getElementById('expDate').value,
          tin_tuyen_dung_id: document.getElementById('expPostingSelect').value || null,
          nguon_id: document.getElementById('expSourceSelect').value || null,
          hoa_don_url: document.getElementById('expInvoiceUrl').value.trim() || '',
          ghi_chu: document.getElementById('expNotes').value.trim() || ''
        };

        const res = await fetchWithAuth('/bao-cao/khoan-chi', {
          method: 'POST',
          body: JSON.stringify(payload)
        });

        if (res.success) {
          showToast('Thêm khoản chi tuyển dụng thành công!', 'success');
          window.closeModal('addExpenseModal');
          addExpenseForm.reset();
          await loadExpenses();
          await loadOverview();
        }
      } catch (err) {
        showToast(err.message, 'error');
      }
    });
  }
});

window.openAddExpenseModal = async function() {
  try {
    const [jobsRes, srcRes] = await Promise.all([
      fetchWithAuth('/tin-tuyen-dung'),
      fetchWithAuth('/nguon-tuyen-dung')
    ]);

    const postSelect = document.getElementById('expPostingSelect');
    if (postSelect && jobsRes.data) {
      postSelect.innerHTML = '<option value="">-- Không gắn tin cụ thể --</option>' +
        jobsRes.data.map(j => `<option value="${j.id}">${j.tieu_de}</option>`).join('');
    }

    const srcSelect = document.getElementById('expSourceSelect');
    if (srcSelect && srcRes.data) {
      srcSelect.innerHTML = '<option value="">-- Không phân loại kênh --</option>' +
        srcRes.data.map(s => `<option value="${s.id}">${s.ten_nguon}</option>`).join('');
    }

    const expDateInput = document.getElementById('expDate');
    if (expDateInput && !expDateInput.value) {
      expDateInput.value = new Date().toISOString().split('T')[0];
    }

    document.getElementById('addExpenseModal').classList.add('active');
  } catch (err) {
    showToast('Lỗi tải danh mục: ' + err.message, 'error');
  }
};

window.deleteExpense = async function(id) {
  if (!confirm('Bạn có chắc chắn muốn xóa khoản chi tuyển dụng này?')) return;
  try {
    const res = await fetchWithAuth(`/bao-cao/khoan-chi/${id}`, { method: 'DELETE' });
    if (res.success) {
      showToast(res.message, 'success');
      await loadExpenses();
      await loadOverview();
    }
  } catch (err) {
    showToast(err.message, 'error');
  }
};

async function loadOverview() {
  try {
    const res = await fetchWithAuth('/bao-cao/tong-quan');
    if (res.success) {
      const d = res.data;
      document.getElementById('kpiPositions').innerText = d.tong_vi_tri;
      document.getElementById('kpiApplications').innerText = d.tong_don_ung_tuyen;
      document.getElementById('kpiConversionRate').innerText = `${d.ty_le_chuyen_doi}%`;
      document.getElementById('kpiTotalExpense').innerText = formatCurrency(d.tong_chi_phi);

      document.getElementById('funnelMoi').innerText = d.phan_bo_trang_thai.MOI;
      document.getElementById('funnelPv').innerText = d.phan_bo_trang_thai.DANG_PHONG_VAN;
      document.getElementById('funnelDat').innerText = d.phan_bo_trang_thai.DAT;
    }
  } catch (err) {
    console.error('Lỗi tải tổng quan:', err);
  }
}

async function loadPositions() {
  try {
    const [posRes, deptRes] = await Promise.all([
      fetchWithAuth('/vi-tri'),
      fetchWithAuth('/phong-ban')
    ]);

    const tbody = document.getElementById('positionsTableBody');
    if (!posRes.data.length) {
      tbody.innerHTML = `<tr><td colspan="7" style="text-align:center;">Chưa có vị trí tuyển dụng nào.</td></tr>`;
      return;
    }

    const deptMap = Object.fromEntries(deptRes.data.map(d => [d.id, d.ten_phong_ban]));

    tbody.innerHTML = posRes.data.map(v => {
      let badgeClass = 'badge-moi';
      if (v.trang_thai === 'DA_LAP_DAY') badgeClass = 'badge-dat';
      else if (v.trang_thai === 'DONG') badgeClass = 'badge-khongdat';

      return `
        <tr>
          <td><strong>${v.ma_vi_tri}</strong></td>
          <td>${v.ten_vi_tri}</td>
          <td>${deptMap[v.phong_ban_id] || 'Công nghệ'}</td>
          <td>${v.so_luong_da_tuyen}/${v.so_luong_can_tuyen}</td>
          <td>${formatCurrency(v.muc_luong_min)} - ${formatCurrency(v.muc_luong_max)}</td>
          <td><span class="badge ${badgeClass}">${v.trang_thai}</span></td>
          <td>
            <select class="form-control" style="width:130px; padding:0.25rem;" onchange="updatePosStatus('${v.id}', this.value)">
              <option value="MO" ${v.trang_thai === 'MO' ? 'selected' : ''}>MO (Mở)</option>
              <option value="DONG" ${v.trang_thai === 'DONG' ? 'selected' : ''}>DONG (Đóng)</option>
              <option value="DA_LAP_DAY" ${v.trang_thai === 'DA_LAP_DAY' ? 'selected' : ''}>DA_LAP_DAY</option>
            </select>
          </td>
        </tr>
      `;
    }).join('');
  } catch (err) {
    console.error('Lỗi tải vị trí:', err);
  }
}

window.updatePosStatus = async function(id, newStatus) {
  try {
    const res = await fetchWithAuth(`/vi-tri/${id}/trang-thai`, {
      method: 'PATCH',
      body: JSON.stringify({ trang_thai: newStatus })
    });
    if (res.success) {
      showToast(res.message, 'success');
      await loadPositions();
    }
  } catch (err) {
    showToast(err.message, 'error');
  }
};

async function loadExpenses() {
  try {
    const res = await fetchWithAuth('/bao-cao/khoan-chi');
    const tbody = document.getElementById('expensesTableBody');
    if (res.success && res.data) {
      if (!res.data.length) {
        tbody.innerHTML = `<tr><td colspan="7" style="text-align:center;">Chưa có khoản chi nào được ghi nhận.</td></tr>`;
        return;
      }
      tbody.innerHTML = res.data.map(k => {
        let kenhTin = '<span style="color:var(--text-muted);">Toàn hệ thống</span>';
        if (k.ten_tin) {
          kenhTin = `<span title="Tin tuyển dụng">📢 ${k.ten_tin}</span>`;
        } else if (k.ten_nguon) {
          kenhTin = `<span title="Kênh tuyển dụng">🌐 ${k.ten_nguon}</span>`;
        }

        const invoiceLink = k.hoa_don_url 
          ? `<br><a href="${k.hoa_don_url}" target="_blank" style="font-size:0.75rem; color:#60a5fa; text-decoration:underline;">📎 Xem chứng từ</a>` 
          : '';

        return `
          <tr>
            <td><strong>${k.ten_khoan_chi}</strong>${invoiceLink}</td>
            <td style="color:#34d399; font-weight:700;">${formatCurrency(k.so_tien)}</td>
            <td>${k.ngay_chi}</td>
            <td>${kenhTin}</td>
            <td>${k.ten_nguoi_duyet || 'Quản trị viên'}</td>
            <td>${k.ghi_chu || '--'}</td>
            <td style="text-align:right;">
              <button class="btn btn-secondary btn-sm" style="color:#f87171; padding:0.25rem 0.5rem;" onclick="deleteExpense('${k.id}')" title="Xóa khoản chi">
                🗑️ Xóa
              </button>
            </td>
          </tr>
        `;
      }).join('');
    }
  } catch (err) {
    console.error('Lỗi tải khoản chi:', err);
  }
}

function initChatbot() {
  const btn = document.getElementById('btnSendChat');
  const input = document.getElementById('chatInput');
  const chatMessages = document.getElementById('chatMessages');

  function formatChatResponse(text) {
    if (!text) return '';
    let safe = text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
    safe = safe.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    safe = safe.replace(/\*(.*?)\*/g, '<em>$1</em>');
    safe = safe.replace(/`([^`]+)`/g, '<code style="background:rgba(255,255,255,0.08); padding:0.15rem 0.35rem; border-radius:3px; color:#a5b4fc;">$1</code>');
    safe = safe.replace(/^[•\-]\s+(.*)$/gm, '<li style="margin-left:1.2rem; margin-bottom:0.25rem;">$1</li>');
    safe = safe.replace(/\n\n/g, '<div style="height:0.5rem"></div>');
    safe = safe.replace(/\n/g, '<br>');
    return safe;
  }

  async function handleSend() {
    const text = input.value.trim();
    if (!text) return;

    const userMsg = document.createElement('div');
    userMsg.className = 'chat-message user';
    userMsg.innerText = text;
    chatMessages.appendChild(userMsg);
    input.value = '';
    chatMessages.scrollTop = chatMessages.scrollHeight;

    const loadingMsg = document.createElement('div');
    loadingMsg.className = 'chat-message ai';
    loadingMsg.innerText = '⚡ AI đang phân tích câu hỏi & sinh câu truy vấn SQL an toàn...';
    chatMessages.appendChild(loadingMsg);
    chatMessages.scrollTop = chatMessages.scrollHeight;

    try {
      const res = await fetchWithAuth('/ai/hoi-dap', {
        method: 'POST',
        body: JSON.stringify({ cau_hoi: text })
      });

      loadingMsg.remove();

      if (res.success) {
        const d = res.data.ket_qua_json;
        const aiMsg = document.createElement('div');
        aiMsg.className = 'chat-message ai';
        aiMsg.innerHTML = `
          <div style="line-height:1.6;">${formatChatResponse(d.cau_tra_loi)}</div>
          <div class="sql-badge-box" style="margin-top:0.75rem;">
            <span style="color:#6ee7b7;">🛡️ SQL Executed (Read-Only Whitelist):</span><br>
            <code>${d.sql_da_thuc_thi}</code>
          </div>
        `;
        chatMessages.appendChild(aiMsg);
      }
    } catch (err) {
      loadingMsg.remove();
      const errMsg = document.createElement('div');
      errMsg.className = 'chat-message ai';
      errMsg.innerHTML = `<span style="color:#f87171;">❌ ${err.message}</span>`;
      chatMessages.appendChild(errMsg);
    }
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }

  btn.addEventListener('click', handleSend);
  input.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') handleSend();
  });
}

/**
 * =====================================================================
 * QUẢN LÝ TÀI KHOẢN (ACCOUNTS MANAGEMENT)
 * =====================================================================
 */

async function loadAccounts() {
  const tbody = document.getElementById('accountsTableBody');
  if (!tbody) return;

  const search = document.getElementById('accSearchInput') ? document.getElementById('accSearchInput').value.trim() : '';
  const role = document.getElementById('accRoleFilter') ? document.getElementById('accRoleFilter').value : '';
  const status = document.getElementById('accStatusFilter') ? document.getElementById('accStatusFilter').value : '';

  const params = new URLSearchParams();
  if (search) params.append('search', search);
  if (role) params.append('vai_tro', role);
  if (status) params.append('trang_thai', status);

  try {
    const res = await fetchWithAuth(`/tai-khoan${params.toString() ? '?' + params.toString() : ''}`);
    if (res.success && res.data.length) {
      const currentUser = authState.getUser();

      tbody.innerHTML = res.data.map(u => {
        // Role badge
        let roleBadge = '<span class="badge badge-moi">QUẢN TRỊ VIÊN</span>';
        if (u.vai_tro === 'RECRUITER') roleBadge = '<span class="badge badge-pv">TUYỂN DỤNG</span>';
        else if (u.vai_tro === 'CANDIDATE') roleBadge = '<span class="badge badge-dat">ỨNG VIÊN</span>';

        // Status badge
        const isLocked = u.trang_thai === 'KHOA';
        const statusBadge = isLocked 
          ? '<span class="badge badge-khongdat" style="background:rgba(239,68,68,0.2); border:1px solid #ef4444; color:#fca5a5;">🔒 ĐÃ KHÓA</span>'
          : '<span class="badge badge-dat" style="background:rgba(16,185,129,0.2); border:1px solid #10b981; color:#6ee7b7;">● HOẠT ĐỘNG</span>';

        const isSelf = currentUser && currentUser.id === u.id;

        return `
          <tr>
            <td>
              <div style="display:flex; align-items:center; gap:0.6rem;">
                <img src="${u.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'}" style="width:34px; height:34px; border-radius:50%; object-fit:cover; border:1px solid var(--border-glass);" />
                <div>
                  <strong style="color:#fff;">${u.ho_ten}</strong>
                  ${isSelf ? '<span style="font-size:0.7rem; color:#818cf8; margin-left:0.3rem;">(Bạn)</span>' : ''}
                </div>
              </div>
            </td>
            <td><code>${u.ten_dang_nhap}</code></td>
            <td>
              <div>${u.email}</div>
              <div style="font-size:0.75rem; color:var(--text-muted);">${u.so_dien_thoai || 'Chưa cập nhật'}</div>
            </td>
            <td>${roleBadge}</td>
            <td><span style="color:var(--text-secondary); font-size:0.85rem;">${u.ten_phong_ban}</span></td>
            <td>${statusBadge}</td>
            <td style="text-align:right;">
              <div style="display:inline-flex; gap:0.4rem;">
                <button class="btn btn-secondary btn-sm" onclick="openChangeRoleModal('${u.id}', '${u.ho_ten.replace(/'/g, "\\'")}', '${u.email}', '${u.vai_tro}')" title="Phân Quyền / Cấp Quyền">
                  ⚡ Quyền
                </button>
                ${!isSelf ? `
                  <button class="btn btn-sm ${isLocked ? 'btn-success' : 'btn-secondary'}" onclick="toggleLockAccount('${u.id}', '${u.trang_thai}', '${u.ten_dang_nhap.replace(/'/g, "\\'")}')" title="${isLocked ? 'Mở khóa tài khoản' : 'Khóa tài khoản'}">
                    ${isLocked ? '🔓 Mở' : '🔒 Khóa'}
                  </button>
                  <button class="btn btn-secondary btn-sm" style="color:#f87171;" onclick="deleteAccount('${u.id}', '${u.ten_dang_nhap.replace(/'/g, "\\'")}')" title="Xóa tài khoản">
                    🗑️
                  </button>
                ` : '<span style="font-size:0.75rem; color:var(--text-muted); line-height:2rem; padding:0 0.5rem;">—</span>'}
              </div>
            </td>
          </tr>
        `;
      }).join('');
    } else {
      tbody.innerHTML = `<tr><td colspan="7" style="text-align:center; color:var(--text-muted);">Không tìm thấy tài khoản nào phù hợp.</td></tr>`;
    }
  } catch (err) {
    console.error('Lỗi tải danh sách tài khoản:', err);
    tbody.innerHTML = `<tr><td colspan="7" style="text-align:center; color:#f87171;">Lỗi tải tài khoản: ${err.message}</td></tr>`;
  }
}

window.openCreateAccountModal = async function() {
  try {
    const res = await fetchWithAuth('/phong-ban');
    const deptSelect = document.getElementById('newAccDept');
    if (res.success && deptSelect) {
      deptSelect.innerHTML = '<option value="">-- Không phân bổ --</option>' + 
        res.data.map(p => `<option value="${p.id}">${p.ten_phong_ban}</option>`).join('');
    }
  } catch (err) {
    console.warn('Lỗi tải phòng ban cho modal tạo tài khoản:', err);
  }
  document.getElementById('createAccountForm').reset();
  document.getElementById('createAccountModal').classList.add('active');
};

window.openChangeRoleModal = function(id, name, email, currentRole) {
  document.getElementById('changeRoleUserId').value = id;
  document.getElementById('changeRoleUserName').innerText = name;
  document.getElementById('changeRoleUserMeta').innerText = `${email} | Hiện tại: ${currentRole}`;
  document.getElementById('changeRoleSelect').value = currentRole;
  document.getElementById('changeRoleModal').classList.add('active');
};

window.toggleLockAccount = async function(id, currentStatus, username) {
  const newStatus = currentStatus === 'KHOA' ? 'HOAT_DONG' : 'KHOA';
  const actionText = newStatus === 'KHOA' ? 'khóa' : 'mở khóa';

  if (!confirm(`Bạn có chắc chắn muốn ${actionText} tài khoản '${username}'?`)) {
    return;
  }

  try {
    const res = await fetchWithAuth(`/tai-khoan/${id}/trang-thai`, {
      method: 'PATCH',
      body: JSON.stringify({ trang_thai: newStatus })
    });

    if (res.success) {
      showToast(res.message, 'success');
      await loadAccounts();
    }
  } catch (err) {
    showToast(err.message, 'error');
  }
};

window.deleteAccount = async function(id, username) {
  if (!confirm(`Xác nhận xóa tài khoản '${username}'? Hành động này sẽ vô hiệu hóa tài khoản.`)) {
    return;
  }

  try {
    const res = await fetchWithAuth(`/tai-khoan/${id}`, {
      method: 'DELETE'
    });

    if (res.success) {
      showToast(res.message, 'success');
      await loadAccounts();
    }
  } catch (err) {
    showToast(err.message, 'error');
  }
};

