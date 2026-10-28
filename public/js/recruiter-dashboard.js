import { fetchWithAuth, authState, logout, showToast, formatDate } from './app.js';

window.closeModal = function(id) {
  document.getElementById(id).classList.remove('active');
};

let currentApplications = [];

document.addEventListener('DOMContentLoaded', async () => {
  // KIỂM TRA ĐĂNG NHẬP & PHÂN QUYỀN VAI TRÒ RECRUITER
  const token = authState.getToken();
  const user = authState.getUser();

  if (!token || !user || (user.vai_tro !== 'RECRUITER' && user.vai_tro !== 'ADMIN')) {
    window.location.href = '/login.html?role=RECRUITER';
    return;
  }

  if (document.getElementById('recruiterUserName')) {
    document.getElementById('recruiterUserName').innerText = user.ho_ten;
  }

  // Nếu người dùng đăng nhập là ADMIN (Quản trị viên có toàn quyền tuyển dụng)
  if (user.vai_tro === 'ADMIN') {
    const roleBadge = document.getElementById('recruiterRoleBadge');
    if (roleBadge) {
      roleBadge.className = 'badge badge-moi';
      roleBadge.innerText = 'QUYỀN HẠN: ADMIN (TOÀN QUYỀN TUYỂN DỤNG)';
    }
    const roleText = document.getElementById('recruiterUserRole');
    if (roleText) roleText.innerText = 'Quản Trị Viên (Toàn Quyền)';
    const btnBackAdmin = document.getElementById('btnBackAdmin');
    if (btnBackAdmin) btnBackAdmin.style.display = 'inline-flex';
    const menuAdmin = document.getElementById('menuItemAdminPortal');
    if (menuAdmin) menuAdmin.style.display = 'block';
  }

  // Xử lý Đăng Xuất
  const handleLogout = () => {
    if (confirm('Bạn có chắc chắn muốn đăng xuất khỏi phiên làm việc Tuyển dụng?')) {
      logout();
    }
  };
  const btnTopLogout = document.getElementById('btnTopbarLogout');
  if (btnTopLogout) btnTopLogout.addEventListener('click', handleLogout);
  const btnSideLogout = document.getElementById('btnSidebarLogout');
  if (btnSideLogout) btnSideLogout.addEventListener('click', handleLogout);

  // Navigation tab switcher
  document.querySelectorAll('.nav-link[data-tab]').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
      document.querySelectorAll('.tab-content').forEach(c => c.style.display = 'none');

      tab.classList.add('active');
      const targetId = `tab-${tab.getAttribute('data-tab')}`;
      const el = document.getElementById(targetId);
      if (el) el.style.display = 'block';
    });
  });

  // Tải dữ liệu
  await loadApplications();
  await loadMyJobs();
  await loadInterviews();

  // Bộ lọc danh sách ứng viên (Trạng thái, Tin tuyển dụng, Tìm kiếm từ khóa)
  const filterStatus = document.getElementById('filterStatus');
  if (filterStatus) filterStatus.addEventListener('change', () => renderApplicationsTable());

  const filterJob = document.getElementById('filterJob');
  if (filterJob) filterJob.addEventListener('change', () => renderApplicationsTable());

  const searchInput = document.getElementById('searchCandidateInput');
  if (searchInput) searchInput.addEventListener('input', () => renderApplicationsTable());

  // Xử lý Form Chuyển Trạng Thái Tuần Tự
  document.getElementById('changeStatusForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const appId = document.getElementById('changeStatusAppId').value;
    const nextStatus = document.getElementById('newStatusSelect').value;
    const reason = document.getElementById('statusReason').value;

    try {
      const res = await fetchWithAuth(`/luot-ung-tuyen/${appId}/chuyen-trang-thai`, {
        method: 'PATCH',
        body: JSON.stringify({
          trang_thai_moi: nextStatus,
          ly_do: reason
        })
      });

      if (res.success) {
        showToast(res.message, 'success');
        window.closeModal('changeStatusModal');
        await loadApplications();
      }
    } catch (err) {
      showToast(err.message, 'error');
    }
  });

  // Xử lý Form Lên Lịch Phỏng Vấn
  document.getElementById('scheduleForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const appId = document.getElementById('scheduleAppId').value;
    const payload = {
      luot_ung_tuyen_id: appId,
      thoi_gian_bat_dau: document.getElementById('schedStartTime').value,
      hinh_thuc: document.getElementById('schedMode').value,
      dia_diem_hoac_link: document.getElementById('schedLocation').value,
      ghi_chu: document.getElementById('schedNotes').value
    };

    try {
      const res = await fetchWithAuth('/lich-phong-van', {
        method: 'POST',
        body: JSON.stringify(payload)
      });
      if (res.success) {
        showToast('Lên lịch phỏng vấn thành công!', 'success');
        window.closeModal('scheduleModal');
        await loadApplications();
        await loadInterviews();
      }
    } catch (err) {
      showToast(err.message, 'error');
    }
  });

  // Xử lý Form Đánh Giá Phỏng Vấn
  document.getElementById('evalForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const payload = {
      lich_phong_van_id: document.getElementById('evalLichId').value,
      diem_chuyen_mon: document.getElementById('evalTech').value,
      diem_ky_nang_mem: document.getElementById('evalSoft').value,
      diem_van_hoa: document.getElementById('evalCulture').value,
      de_xuat: document.getElementById('evalRecommendation').value,
      nhan_xet: document.getElementById('evalNotes').value
    };

    try {
      const res = await fetchWithAuth('/lich-phong-van/danh-gia', {
        method: 'POST',
        body: JSON.stringify(payload)
      });
      if (res.success) {
        showToast('Lưu đánh giá phỏng vấn thành công.', 'success');
        window.closeModal('evalModal');
        await loadInterviews();
      }
    } catch (err) {
      showToast(err.message, 'error');
    }
  });

  // Mở modal Đăng tin tuyển dụng mới
  const btnOpenJob = document.getElementById('btnOpenCreateJobModal');
  if (btnOpenJob) {
    btnOpenJob.addEventListener('click', openCreateJobModal);
  }

  // Xử lý nộp Form Đăng Tin Tuyển Dụng (Nhập trực tiếp vị trí)
  const createJobForm = document.getElementById('createJobForm');
  if (createJobForm) {
    createJobForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      try {
        const payload = {
          ten_vi_tri: document.getElementById('createJobViTri').value.trim(),
          tieu_de: document.getElementById('createJobTitle').value.trim(),
          dia_diem: document.getElementById('createJobLocation').value.trim(),
          han_nop: document.getElementById('createJobDeadline').value,
          noi_dung: document.getElementById('createJobContent').value.trim()
        };

        if (!payload.ten_vi_tri) {
          showToast('Vui lòng nhập tên vị trí tuyển dụng.', 'error');
          return;
        }

        const res = await fetchWithAuth('/tin-tuyen-dung', {
          method: 'POST',
          body: JSON.stringify(payload)
        });

        if (res.success) {
          showToast('Đăng tin tuyển dụng mới thành công!', 'success');
          window.closeModal('createJobModal');
          createJobForm.reset();
          await loadMyJobs();
        }
      } catch (err) {
        showToast(err.message, 'error');
      }
    });
  }
});

window.openCreateJobModal = function() {
  const form = document.getElementById('createJobForm');
  if (form) form.reset();

  const deadlineInput = document.getElementById('createJobDeadline');
  if (deadlineInput) {
    // Mặc định hạn nộp là 30 ngày tới
    const nextMonth = new Date();
    nextMonth.setDate(nextMonth.getDate() + 30);
    deadlineInput.value = nextMonth.toISOString().split('T')[0];
  }

  document.getElementById('createJobModal').classList.add('active');
};

async function populateJobFilter() {
  const filterJob = document.getElementById('filterJob');
  if (!filterJob) return;

  try {
    const res = await fetchWithAuth('/tin-tuyen-dung');
    if (res.success && Array.isArray(res.data)) {
      const currentVal = filterJob.value;
      let optionsHtml = '<option value="">-- Tất cả tin tuyển dụng --</option>';
      res.data.forEach(j => {
        optionsHtml += `<option value="${j.id}">${j.tieu_de}</option>`;
      });
      filterJob.innerHTML = optionsHtml;
      if (currentVal) filterJob.value = currentVal;
    }
  } catch (err) {
    console.error('Lỗi nạp danh sách tin tuyển dụng cho bộ lọc:', err);
  }
}

async function loadApplications() {
  try {
    const res = await fetchWithAuth('/luot-ung-tuyen');
    if (res.success) {
      currentApplications = res.data;
      await populateJobFilter();
      renderApplicationsTable();
    }
  } catch (err) {
    console.error('Lỗi tải lượt ứng tuyển:', err);
  }
}

function renderApplicationsTable() {
  const tbody = document.getElementById('applicationsTableBody');
  const statusFilter = document.getElementById('filterStatus')?.value || '';
  const jobFilter = document.getElementById('filterJob')?.value || '';
  const keyword = (document.getElementById('searchCandidateInput')?.value || '').toLowerCase().trim();

  let list = currentApplications;

  if (statusFilter) {
    list = list.filter(a => a.trang_thai === statusFilter);
  }

  if (jobFilter) {
    list = list.filter(a => a.tin_tuyen_dung_id === jobFilter);
  }

  if (keyword) {
    list = list.filter(a => 
      (a.ho_ten_ung_vien && a.ho_ten_ung_vien.toLowerCase().includes(keyword)) ||
      (a.email_ung_vien && a.email_ung_vien.toLowerCase().includes(keyword)) ||
      (a.tieu_de_tin && a.tieu_de_tin.toLowerCase().includes(keyword)) ||
      (a.ten_file_cv && a.ten_file_cv.toLowerCase().includes(keyword)) ||
      (a.so_dien_thoai && a.so_dien_thoai.includes(keyword))
    );
  }

  if (!list.length) {
    tbody.innerHTML = `<tr><td colspan="6" style="text-align:center; padding:1.5rem; color:var(--text-muted);">Không tìm thấy hồ sơ ứng viên nào phù hợp.</td></tr>`;
    return;
  }

  tbody.innerHTML = list.map(app => {
    let badgeClass = 'badge-moi';
    if (app.trang_thai === 'DANG_PHONG_VAN') badgeClass = 'badge-pv';
    else if (app.trang_thai === 'DAT') badgeClass = 'badge-dat';
    else if (app.trang_thai === 'KHONG_DAT') badgeClass = 'badge-khongdat';

    const aiScore = app.diem_ai_doi_sanh !== null 
      ? `<span style="font-weight:700; color:#a5b4fc;">${app.diem_ai_doi_sanh}/100</span>` 
      : '<span style="color:var(--text-muted);">Chưa phân tích</span>';

    return `
      <tr>
        <td>
          <div style="font-weight:700; color:#f3f4f6;">${app.ho_ten_ung_vien}</div>
          <div style="font-size:0.8rem; color:var(--text-muted);">${app.email_ung_vien} | ${app.so_dien_thoai}</div>
        </td>
        <td>
          <div style="font-weight:600; color:#c7d2fe;">${app.tieu_de_tin}</div>
          <div style="font-size:0.75rem; color:var(--text-muted);">Ngày nộp: ${app.created_at ? formatDate(app.created_at) : 'N/A'}</div>
        </td>
        <td>${aiScore}</td>
        <td><span class="badge ${badgeClass}">${app.trang_thai}</span></td>
        <td>
          <a href="${app.duong_dan_cv || '#'}" target="_blank" style="color:#818cf8; text-decoration:none; font-size:0.85rem; display:inline-flex; align-items:center; gap:0.25rem;">
            📄 <span>${app.ten_file_cv}</span>
          </a>
        </td>
        <td>
          <div style="display:flex; flex-wrap:wrap; gap:0.35rem;">
            <button class="btn btn-ai btn-sm" onclick="openAiMatching('${app.id}')">✨ AI Đối Sánh</button>
            <button class="btn btn-secondary btn-sm" onclick="openAiQuestions('${app.ho_so_cv_id}', '${app.tin_tuyen_dung_id}')">❓ Gợi Ý Câu Hỏi</button>
            <button class="btn btn-primary btn-sm" onclick="openScheduleModal('${app.id}')">📅 Lên Lịch</button>
            <button class="btn btn-sm btn-secondary" onclick="openChangeStatusModal('${app.id}')">🔄 Trạng Thái</button>
          </div>
        </td>
      </tr>
    `;
  }).join('');
}

window.openAiMatching = async function(appId) {
  const modal = document.getElementById('aiMatchingModal');
  const body = document.getElementById('aiMatchingBody');
  modal.classList.add('active');
  body.innerHTML = `<div style="text-align:center; padding:2rem;">⚡ Đang thực thi phân tích đối sánh AI chống ảo giác...</div>`;

  try {
    const res = await fetchWithAuth('/ai/doi-sanh', {
      method: 'POST',
      body: JSON.stringify({ luot_ung_tuyen_id: appId })
    });

    if (res.success) {
      const d = res.data.ket_qua_json;
      body.innerHTML = `
        <div class="ai-score-box">
          <div class="ai-score-number">${d.score}</div>
          <div>
            <div style="font-weight:700; color:#fff;">ĐIỂM PHÙ HỢP NĂNG LỰC (0 - 100)</div>
            <div style="font-size:0.8rem; color:#a5b4fc;">Độ tin cậy: ${(res.data.do_tin_cay * 100).toFixed(1)}% | Xác thực văn bản gốc</div>
          </div>
        </div>

        <div style="margin-bottom:1rem;">
          <strong style="color:#34d399; font-size:0.9rem;">✅ Kỹ năng khớp với yêu cầu (${d.matched_skills.length}):</strong>
          <div class="ai-tag-group">
            ${d.matched_skills.map(s => `<span class="ai-tag matched">${s}</span>`).join('')}
          </div>
        </div>

        <div style="margin-bottom:1rem;">
          <strong style="color:#f87171; font-size:0.9rem;">⚠️ Kỹ năng còn thiếu hoặc cần kiểm chứng:</strong>
          <div class="ai-tag-group">
            ${d.missing_skills.length ? d.missing_skills.map(s => `<span class="ai-tag missing">${s}</span>`).join('') : '<span style="color:var(--text-muted); font-size:0.85rem;">Không phát hiện thiếu sót lớn.</span>'}
          </div>
        </div>

        <div style="background:rgba(255,255,255,0.03); border:1px solid var(--border-subtle); padding:1rem; border-radius:8px; font-size:0.88rem;">
          <strong style="color:#e0e7ff;">Nhận xét minh bạch từ AI:</strong>
          <p style="margin-top:0.4rem; color:var(--text-secondary);">${d.justification}</p>
        </div>
      `;
      await loadApplications();
    }
  } catch (err) {
    body.innerHTML = `<div style="color:#f87171; padding:1.5rem;">Lỗi AI: ${err.message}</div>`;
  }
};

window.openAiQuestions = async function(cvId, tinId) {
  const modal = document.getElementById('aiQuestionsModal');
  const body = document.getElementById('aiQuestionsBody');
  modal.classList.add('active');
  body.innerHTML = `<div style="text-align:center; padding:2rem;">⚡ Đang phân tích hồ sơ và sinh câu hỏi phỏng vấn...</div>`;

  try {
    const res = await fetchWithAuth('/ai/goi-y-cau-hoi', {
      method: 'POST',
      body: JSON.stringify({ ho_so_cv_id: cvId, tin_tuyen_dung_id: tinId })
    });

    if (res.success) {
      const questions = res.data.ket_qua_json.questions;
      body.innerHTML = `
        <p style="font-size:0.85rem; color:var(--text-muted); margin-bottom:1rem;">
          Bộ câu hỏi phỏng vấn được sinh tự động bám sát các kinh nghiệm thực tế và rà soát khoảng trống kỹ năng trong CV:
        </p>
        <div style="display:flex; flex-direction:column; gap:1rem;">
          ${questions.map((q, idx) => `
            <div style="background:rgba(255,255,255,0.03); border-left:3px solid var(--brand-primary); padding:1rem; border-radius:4px;">
              <div style="font-size:0.75rem; color:#818cf8; text-transform:uppercase; font-weight:700;">${q.category}</div>
              <div style="font-weight:600; margin-top:0.35rem; color:#f3f4f6;">${idx + 1}. ${q.question}</div>
            </div>
          `).join('')}
        </div>
      `;
    }
  } catch (err) {
    body.innerHTML = `<div style="color:#f87171; padding:1.5rem;">Lỗi: ${err.message}</div>`;
  }
};

window.openChangeStatusModal = function(appId) {
  const app = currentApplications.find(a => a.id === appId);
  if (!app) return;

  document.getElementById('changeStatusAppId').value = appId;
  document.getElementById('currentStatusDisplay').innerText = app.trang_thai;
  
  const select = document.getElementById('newStatusSelect');
  select.innerHTML = '';

  if (app.trang_thai === 'MOI') {
    select.innerHTML = `
      <option value="DANG_PHONG_VAN">Chuyển sang: ĐANG PHỎNG VẤN (DANG_PHONG_VAN)</option>
      <option value="KHONG_DAT">Chuyển sang: KHÔNG ĐẠT (Loại hồ sơ)</option>
    `;
  } else if (app.trang_thai === 'DANG_PHONG_VAN') {
    select.innerHTML = `
      <option value="DAT">Chuyển sang: ĐẠT TUYỂN DỤNG (DAT)</option>
      <option value="KHONG_DAT">Chuyển sang: KHÔNG ĐẠT (KHONG_DAT)</option>
    `;
  } else {
    select.innerHTML = `<option value="">(Hồ sơ đã ở trạng thái kết thúc)</option>`;
  }

  document.getElementById('changeStatusModal').classList.add('active');
};

window.openScheduleModal = function(appId) {
  document.getElementById('scheduleAppId').value = appId;
  document.getElementById('scheduleModal').classList.add('active');
};

async function loadMyJobs() {
  try {
    const res = await fetchWithAuth('/tin-tuyen-dung?scope_only=true');
    const tbody = document.getElementById('myJobsTableBody');
    if (res.success && res.data.length) {
      tbody.innerHTML = res.data.map(job => `
        <tr>
          <td><strong>${job.tieu_de}</strong></td>
          <td>${job.ten_vi_tri}</td>
          <td>${job.han_nop}</td>
          <td>${job.dia_diem}</td>
          <td><span class="badge ${job.trang_thai === 'DANG_TUYEN' ? 'badge-dat' : 'badge-khongdat'}">${job.trang_thai}</span></td>
          <td>
            <div style="display:flex; gap:0.4rem; flex-wrap:wrap;">
              <button class="btn btn-secondary btn-sm" onclick="viewJobApplications('${job.id}')">📋 Xem Ứng Viên</button>
              ${job.trang_thai === 'DANG_TUYEN' 
                ? `<button class="btn btn-danger btn-sm" onclick="closeJob('${job.id}')">Đóng Tin</button>` 
                : '<span style="color:var(--text-muted); font-size:0.85rem; align-self:center;">Đã đóng</span>'}
            </div>
          </td>
        </tr>
      `).join('');
    } else {
      tbody.innerHTML = `<tr><td colspan="6" style="text-align:center;">Không có tin tuyển dụng nào phụ trách.</td></tr>`;
    }
  } catch (err) {
    console.error('Lỗi tải tin tuyển dụng:', err);
  }
}

window.viewJobApplications = function(jobId) {
  // Chuyển sang Tab Danh Sách Ứng Viên
  const appTab = document.querySelector('.nav-link[data-tab="applications"]');
  if (appTab) appTab.click();

  const filterJob = document.getElementById('filterJob');
  if (filterJob) {
    filterJob.value = jobId;
    renderApplicationsTable();
  }
};

window.closeJob = async function(jobId) {
  if (!confirm('Bạn có chắc chắn muốn đóng tin tuyển dụng này?')) return;
  try {
    const res = await fetchWithAuth(`/tin-tuyen-dung/${jobId}/dong-tin`, { method: 'POST' });
    if (res.success) {
      showToast(res.message, 'success');
      await loadMyJobs();
    }
  } catch (err) {
    showToast(err.message, 'error');
  }
};

async function loadInterviews() {
  try {
    const res = await fetchWithAuth('/lich-phong-van');
    const tbody = document.getElementById('interviewsTableBody');
    if (res.success && res.data.length) {
      tbody.innerHTML = res.data.map(lich => {
        const rawLoc = lich.dia_diem_hoac_link || '';
        const isUrl = rawLoc.startsWith('http://') || rawLoc.startsWith('https://') || rawLoc.startsWith('meet.google.com') || rawLoc.startsWith('zoom.us') || rawLoc.includes('.com/') || rawLoc.includes('.vn/');
        const targetHref = isUrl && !rawLoc.startsWith('http') ? `https://${rawLoc}` : rawLoc;
        const locationCell = isUrl
          ? `<a href="${targetHref}" target="_blank" style="color:#818cf8; text-decoration:underline;">🔗 Tham gia</a>`
          : `<span title="${rawLoc}">📍 ${rawLoc}</span>`;

        return `
          <tr>
            <td><strong>${lich.ho_ten_ung_vien}</strong></td>
            <td>${formatDate(lich.thoi_gian_bat_dau)}</td>
            <td><span class="badge badge-moi">${lich.hinh_thuc}</span></td>
            <td>${locationCell}</td>
            <td><span class="badge ${lich.trang_thai === 'HOAN_THANH' ? 'badge-dat' : 'badge-pv'}">${lich.trang_thai}</span></td>
            <td>
              ${lich.danh_gia 
                ? `<span style="color:#34d399; font-weight:700;">Đã chấm: ${lich.danh_gia.diem_chuyen_mon}/10 (${lich.danh_gia.de_xuat})</span>`
                : `<button class="btn btn-sm btn-primary" onclick="openEvalModal('${lich.id}')">⭐ Chấm Điểm</button>`}
            </td>
          </tr>
        `;
      }).join('');
    } else {
      tbody.innerHTML = `<tr><td colspan="6" style="text-align:center;">Chưa có lịch phỏng vấn nào.</td></tr>`;
    }
  } catch (err) {
    console.error('Lỗi tải lịch phỏng vấn:', err);
  }
}

window.openEvalModal = function(lichId) {
  document.getElementById('evalLichId').value = lichId;
  document.getElementById('evalModal').classList.add('active');
};
