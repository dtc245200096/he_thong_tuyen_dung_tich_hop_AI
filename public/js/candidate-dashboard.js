import { fetchWithAuth, authState, logout, showToast, formatDate } from './app.js';

window.closeModal = function(id) {
  document.getElementById(id).classList.remove('active');
};

let uploadedCvId = null;
let myNotificationsList = [];
let activeNotifFilter = 'all';

document.addEventListener('DOMContentLoaded', async () => {
  // KIỂM TRA ĐĂNG NHẬP & PHÂN QUYỀN VAI TRÒ
  // Bắt buộc phải đăng nhập với vai trò CANDIDATE mới được vào Cổng Ứng Viên
  const token = authState.getToken();
  const user = authState.getUser();

  if (!token || !user || user.vai_tro !== 'CANDIDATE') {
    window.location.href = '/login.html?role=CANDIDATE';
    return;
  }

  if (user && document.getElementById('candidateUserName')) {
    document.getElementById('candidateUserName').innerText = user.ho_ten;
  }

  // Xử lý Đăng Xuất
  const handleLogout = () => {
    if (confirm('Bạn có chắc chắn muốn đăng xuất khỏi Cổng ứng viên?')) {
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

  // Sự kiện bộ lọc thông báo (Tất cả / Chưa đọc / Đã đọc)
  document.querySelectorAll('.notif-filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.notif-filter-btn').forEach(b => {
        b.className = 'btn btn-sm btn-secondary notif-filter-btn';
      });
      btn.className = 'btn btn-sm btn-primary notif-filter-btn';
      activeNotifFilter = btn.getAttribute('data-filter');
      renderNotifications();
    });
  });

  // Đánh dấu tất cả thông báo là đã đọc
  const btnMarkAll = document.getElementById('btnMarkAllRead');
  if (btnMarkAll) {
    btnMarkAll.addEventListener('click', async () => {
      try {
        const res = await fetchWithAuth('/thong-bao/danh-dau-tat-ca-da-doc', { method: 'PATCH' });
        if (res.success) {
          showToast(res.message, 'success');
          await loadMyNotifications();
        }
      } catch (err) {
        showToast(err.message, 'error');
      }
    });
  }

  // Tải dữ liệu ban đầu
  await loadJobListings();
  await loadMyApplications();
  await loadMyInterviews();
  await loadMyNotifications();

  // Khởi tạo vùng kéo thả CV (Dropzone)
  initCvDropzone();

  // Khởi tạo Trợ lý AI Hỏi Đáp cho Ứng viên
  initCandidateAiChat(user);

  // Xử lý nộp đơn
  document.getElementById('applyForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const jobId = document.getElementById('applyJobId').value;
    const notes = document.getElementById('applyNotes').value;

    if (!uploadedCvId) {
      showToast('Vui lòng tải lên tệp tin CV trước khi nộp.', 'error');
      return;
    }

    try {
      const res = await fetchWithAuth('/luot-ung-tuyen', {
        method: 'POST',
        body: JSON.stringify({
          tin_tuyen_dung_id: jobId,
          ho_so_cv_id: uploadedCvId,
          ghi_chu: notes
        })
      });

      if (res.success) {
        showToast('Nộp hồ sơ ứng tuyển thành công! Hệ thống đang rà soát hồ sơ của bạn.', 'success');
        window.closeModal('applyModal');
        await loadMyApplications();
        // Chuyển sang tab hồ sơ của tôi
        document.querySelector('.nav-link[data-tab="my-applications"]').click();
      }
    } catch (err) {
      // Bắt lỗi chống nộp trùng (409 Conflict)
      showToast(err.message, 'error');
    }
  });
});

async function loadJobListings() {
  try {
    const res = await fetchWithAuth('/tin-tuyen-dung?trang_thai=DANG_TUYEN');
    const grid = document.getElementById('jobListingsGrid');

    if (res.success && res.data.length) {
      grid.innerHTML = res.data.map(job => `
        <div class="card" style="margin-bottom:0; display:flex; flex-direction:column; justify-content:space-between;">
          <div>
            <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:0.75rem;">
              <span class="badge badge-moi">${job.dia_diem}</span>
              <span style="font-size:0.8rem; color:var(--text-muted);">Hạn nộp: ${job.han_nop}</span>
            </div>
            <h3 style="font-size:1.15rem; font-weight:700; color:#f3f4f6; margin-bottom:0.4rem;">${job.tieu_de}</h3>
            <div style="font-size:0.85rem; color:#818cf8; font-weight:600; margin-bottom:0.75rem;">Vị trí: ${job.ten_vi_tri}</div>
            <p style="font-size:0.875rem; color:var(--text-secondary); margin-bottom:1rem; line-height:1.5;">
              ${job.noi_dung.substring(0, 140)}...
            </p>
          </div>
          <button class="btn btn-primary" style="width:100%;" onclick="openApplyModal('${job.id}', '${job.tieu_de.replace(/'/g, "\\'")}', '${job.ten_vi_tri.replace(/'/g, "\\'")}')">
            ⚡ Ứng Tuyển Ngay
          </button>
        </div>
      `).join('');
    } else {
      grid.innerHTML = `<div style="color:var(--text-muted);">Hiện chưa có tin tuyển dụng nào đang mở.</div>`;
    }
  } catch (err) {
    console.error('Lỗi tải tin tuyển dụng:', err);
  }
}

window.openApplyModal = function(jobId, jobTitle, jobPos) {
  uploadedCvId = null;
  document.getElementById('applyJobId').value = jobId;
  document.getElementById('applyJobTitle').innerText = jobTitle;
  document.getElementById('applyJobDetails').innerText = `Vị trí chuyên môn: ${jobPos}`;
  document.getElementById('dropzoneText').innerText = 'Kéo thả file CV vào đây hoặc bấm để chọn tệp';
  document.getElementById('fileUploadStatus').innerHTML = '';
  document.getElementById('btnSubmitApply').disabled = true;
  document.getElementById('applyNotes').value = '';

  document.getElementById('applyModal').classList.add('active');
};

function initCvDropzone() {
  const dropzone = document.getElementById('cvDropzone');
  const fileInput = document.getElementById('cvFileInput');
  const statusDiv = document.getElementById('fileUploadStatus');
  const submitBtn = document.getElementById('btnSubmitApply');

  dropzone.addEventListener('click', () => fileInput.click());

  dropzone.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropzone.classList.add('dragover');
  });

  dropzone.addEventListener('dragleave', () => {
    dropzone.classList.remove('dragover');
  });

  dropzone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropzone.classList.remove('dragover');
    if (e.dataTransfer.files.length) {
      handleFileSelected(e.dataTransfer.files[0]);
    }
  });

  fileInput.addEventListener('change', (e) => {
    if (e.target.files.length) {
      handleFileSelected(e.target.files[0]);
    }
  });

  async function handleFileSelected(file) {
    // 1. Kiểm tra kích thước (Tối đa 10 MiB = 10 * 1024 * 1024 = 10.485.760 bytes)
    const MAX_SIZE = 10485760;
    if (file.size > MAX_SIZE) {
      statusDiv.innerHTML = `<span style="color:#f87171;">❌ Kích thước tệp (${(file.size / 1024 / 1024).toFixed(2)} MB) vượt quá giới hạn tối đa cho phép là 10 MiB.</span>`;
      submitBtn.disabled = true;
      return;
    }

    // 2. Kiểm tra phần mở rộng tệp (.pdf hoặc .docx)
    const fileName = file.name.toLowerCase();
    if (!fileName.endsWith('.pdf') && !fileName.endsWith('.docx')) {
      statusDiv.innerHTML = `<span style="color:#f87171;">❌ Định dạng tệp không hợp lệ. Chỉ chấp nhận tệp có định dạng .PDF hoặc .DOCX.</span>`;
      submitBtn.disabled = true;
      return;
    }

    // Tiến hành tải tệp lên server và trích xuất OCR
    statusDiv.innerHTML = `<span style="color:#a5b4fc;">⚡ Đang tải lên và trích xuất nội dung CV...</span>`;
    const formData = new FormData();
    formData.append('file_cv', file);

    try {
      const token = authState.getToken();
      const res = await fetch('/api/ho-so-cv/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      const data = await res.json();
      if (data.success) {
        uploadedCvId = data.data.id;
        document.getElementById('dropzoneText').innerText = `✅ Đã chọn: ${file.name} (${(file.size / 1024).toFixed(1)} KB)`;
        statusDiv.innerHTML = `<span style="color:#34d399;">✔ Đã tải lên và trích xuất thành công ${data.data.do_dai_van_ban} ký tự.</span>`;
        submitBtn.disabled = false;
        showToast('Tải CV và trích xuất văn bản thành công.', 'success');
      } else {
        statusDiv.innerHTML = `<span style="color:#f87171;">❌ ${data.message}</span>`;
        submitBtn.disabled = true;
      }
    } catch (err) {
      statusDiv.innerHTML = `<span style="color:#f87171;">❌ Lỗi kết nối tải file: ${err.message}</span>`;
      submitBtn.disabled = true;
    }
  }
}

async function loadMyApplications() {
  try {
    const res = await fetchWithAuth('/luot-ung-tuyen');
    const container = document.getElementById('myApplicationsContainer');

    if (res.success && res.data.length) {
      container.innerHTML = res.data.map(app => {
        let step1 = 'completed';
        let step2 = app.trang_thai === 'MOI' ? 'active' : (app.trang_thai === 'DANG_PHONG_VAN' ? 'active' : 'completed');
        let step3 = (app.trang_thai === 'DAT' || app.trang_thai === 'KHONG_DAT') ? 'completed' : '';

        let badgeClass = 'badge-moi';
        if (app.trang_thai === 'DANG_PHONG_VAN') badgeClass = 'badge-pv';
        else if (app.trang_thai === 'DAT') badgeClass = 'badge-dat';
        else if (app.trang_thai === 'KHONG_DAT') badgeClass = 'badge-khongdat';

        return `
          <div style="background:rgba(255,255,255,0.02); border:1px solid var(--border-glass); border-radius:12px; padding:1.5rem; margin-bottom:1.25rem;">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:1rem;">
              <div>
                <h4 style="font-size:1.1rem; color:#fff;">${app.tieu_de_tin}</h4>
                <div style="font-size:0.8rem; color:var(--text-muted); margin-top:0.2rem;">CV sử dụng: ${app.ten_file_cv}</div>
              </div>
              <span class="badge ${badgeClass}">${app.trang_thai}</span>
            </div>

            <!-- Pipeline Visual Timeline -->
            <div class="pipeline-timeline">
              <div class="pipeline-step ${step1}">
                <span>1</span> Tiếp Nhận (MOI)
              </div>
              <div class="pipeline-step ${step2}">
                <span>2</span> Phỏng Vấn (DANG_PHONG_VAN)
              </div>
              <div class="pipeline-step ${step3}">
                <span>3</span> Kết Quả (${app.trang_thai === 'KHONG_DAT' ? 'Không Đạt' : 'Trúng Tuyển'})
              </div>
            </div>

            <div style="font-size:0.85rem; color:var(--text-secondary); margin-top:1rem;">
              <strong>Ghi chú từ HR:</strong> ${app.ghi_chu || 'Hồ sơ đang trong quá trình rà soát.'}
            </div>
          </div>
        `;
      }).join('');
    } else {
      container.innerHTML = `<p style="color:var(--text-muted);">Bạn chưa nộp hồ sơ vào tin tuyển dụng nào.</p>`;
    }
  } catch (err) {
    console.error('Lỗi tải hồ sơ của tôi:', err);
  }
}

async function loadMyInterviews() {
  try {
    const res = await fetchWithAuth('/lich-phong-van');
    const container = document.getElementById('myInterviewsContainer');

    if (res.success && res.data.length) {
      container.innerHTML = res.data.map(lich => {
        const rawLoc = lich.dia_diem_hoac_link || '';
        const isUrl = rawLoc.startsWith('http://') || rawLoc.startsWith('https://') || rawLoc.startsWith('meet.google.com') || rawLoc.startsWith('zoom.us') || rawLoc.includes('.com/') || rawLoc.includes('.vn/');
        const targetHref = isUrl && !rawLoc.startsWith('http') ? `https://${rawLoc}` : rawLoc;
        const locDisplay = isUrl
          ? `<a href="${targetHref}" target="_blank" style="color:#818cf8; text-decoration:underline;">🔗 Tham gia phòng họp trực tuyến</a>`
          : `<span style="color:#e0e7ff;">${rawLoc}</span>`;

        return `
          <div style="background:rgba(255,255,255,0.02); border:1px solid var(--border-glass); border-radius:12px; padding:1.25rem; margin-bottom:1rem;">
            <div style="display:flex; justify-content:space-between; margin-bottom:0.5rem;">
              <strong style="color:#fff;">${lich.tieu_de_tin}</strong>
              <span class="badge badge-pv">${lich.trang_thai}</span>
            </div>
            <div style="font-size:0.88rem; color:var(--text-secondary); margin-bottom:0.5rem;">
              🕒 <strong>Thời gian:</strong> ${formatDate(lich.thoi_gian_bat_dau)}
            </div>
            <div style="font-size:0.88rem; color:var(--text-secondary); margin-bottom:0.5rem;">
              📍 <strong>Hình thức & Địa điểm:</strong> ${lich.hinh_thuc} | ${locDisplay}
            </div>
            <div style="font-size:0.85rem; color:var(--text-muted);">
              📝 <strong>Ghi chú:</strong> ${lich.ghi_chu || 'Vui lòng chuẩn bị đường truyền internet ổn định và mở camera.'}
            </div>
          </div>
        `;
      }).join('');
    } else {
      container.innerHTML = `<p style="color:var(--text-muted);">Bạn chưa có lịch phỏng vấn nào được lên.</p>`;
    }
  } catch (err) {
    console.error('Lỗi tải lịch phỏng vấn:', err);
  }
}

async function loadMyNotifications() {
  try {
    const res = await fetchWithAuth('/thong-bao');
    if (res.success) {
      myNotificationsList = res.data || [];
      renderNotifications();
    }
  } catch (err) {
    console.error('Lỗi tải thông báo:', err);
  }
}

function renderNotifications() {
  const container = document.getElementById('myNotificationsContainer');
  if (!container) return;

  const totalCount = myNotificationsList.length;
  const unreadCount = myNotificationsList.filter(n => !n.da_doc).length;
  const readCount = totalCount - unreadCount;

  // Cập nhật số đếm trên các bộ lọc
  if (document.getElementById('countNotifAll')) document.getElementById('countNotifAll').innerText = totalCount;
  if (document.getElementById('countNotifUnread')) document.getElementById('countNotifUnread').innerText = unreadCount;
  if (document.getElementById('countNotifRead')) document.getElementById('countNotifRead').innerText = readCount;

  // Cập nhật huy hiệu chưa đọc trên Sidebar
  const sidebarBadge = document.getElementById('sidebarNotifBadge');
  if (sidebarBadge) {
    if (unreadCount > 0) {
      sidebarBadge.innerText = unreadCount;
      sidebarBadge.style.display = 'inline-block';
    } else {
      sidebarBadge.style.display = 'none';
    }
  }

  // Lọc theo tab hiện tại
  let displayedList = myNotificationsList;
  if (activeNotifFilter === 'unread') {
    displayedList = myNotificationsList.filter(n => !n.da_doc);
  } else if (activeNotifFilter === 'read') {
    displayedList = myNotificationsList.filter(n => n.da_doc);
  }

  if (!displayedList.length) {
    container.innerHTML = `
      <div style="text-align:center; padding:3rem 1rem; color:var(--text-muted); background:rgba(255,255,255,0.01); border-radius:12px; border:1px dashed var(--border-subtle);">
        <div style="font-size:2rem; margin-bottom:0.5rem;">📭</div>
        <p style="font-size:0.95rem;">Không có thông báo nào trong mục này.</p>
      </div>
    `;
    return;
  }

  container.innerHTML = displayedList.map(n => {
    // Biểu tượng & màu theo loại thông báo
    let typeIcon = '⚡';
    let typeLabel = 'Hệ thống';
    let borderAccent = 'rgba(99,102,241,0.5)';
    let bgIcon = 'rgba(99,102,241,0.15)';

    if (n.loai_thong_bao === 'LICH_PHONG_VAN') {
      typeIcon = '📅';
      typeLabel = 'Lịch Phỏng Vấn';
      borderAccent = 'rgba(56,189,248,0.6)';
      bgIcon = 'rgba(56,189,248,0.15)';
    } else if (n.loai_thong_bao === 'KET_QUA_UNG_TUYEN') {
      typeIcon = '🎯';
      typeLabel = 'Kết Quả Tuyển Dụng';
      borderAccent = 'rgba(52,211,153,0.6)';
      bgIcon = 'rgba(52,211,153,0.15)';
    } else if (n.loai_thong_bao === 'EMAIL') {
      typeIcon = '✉️';
      typeLabel = 'Email Tuyển Dụng';
      borderAccent = 'rgba(251,191,36,0.6)';
      bgIcon = 'rgba(251,191,36,0.15)';
    }

    const isUnread = !n.da_doc;
    const cardBg = isUnread 
      ? 'background: linear-gradient(135deg, rgba(99,102,241,0.08) 0%, rgba(255,255,255,0.03) 100%); border-left: 4px solid #6366f1;' 
      : 'background: rgba(255,255,255,0.02); border-left: 4px solid var(--border-subtle); opacity: 0.85;';

    return `
      <div style="${cardBg} border-radius:12px; padding:1.25rem; border:1px solid var(--border-glass); transition:all 0.2s ease;">
        <div style="display:flex; justify-content:space-between; align-items:flex-start; gap:1rem; margin-bottom:0.6rem;">
          <div style="display:flex; align-items:center; gap:0.65rem;">
            <div style="width:36px; height:36px; border-radius:10px; background:${bgIcon}; display:flex; align-items:center; justify-content:center; font-size:1.15rem;">
              ${typeIcon}
            </div>
            <div>
              <div style="display:flex; align-items:center; gap:0.5rem;">
                <h4 style="font-size:1rem; font-weight:700; color:#fff; margin:0;">${n.tieu_de}</h4>
                ${isUnread ? '<span style="display:inline-flex; align-items:center; gap:0.3rem; color:#60a5fa; font-size:0.72rem; font-weight:700;"><span style="width:6px; height:6px; border-radius:50%; background:#3b82f6; box-shadow:0 0 6px #3b82f6;"></span> MỚI</span>' : ''}
              </div>
              <div style="font-size:0.75rem; color:var(--text-muted); margin-top:0.15rem;">
                ${typeLabel} • ${formatDate(n.created_at)}
              </div>
            </div>
          </div>

          <div style="display:flex; align-items:center; gap:0.4rem;">
            ${isUnread ? `
              <button class="btn btn-secondary btn-sm" onclick="markNotificationRead('${n.id}')" title="Đánh dấu đã đọc" style="font-size:0.78rem; padding:0.3rem 0.65rem;">
                ✓ Đã đọc
              </button>
            ` : '<span style="font-size:0.75rem; color:var(--text-muted); margin-right:0.25rem;">Đã xem</span>'}
            <button class="btn btn-secondary btn-sm" onclick="deleteNotification('${n.id}')" title="Xóa thông báo" style="color:#f87171; font-size:0.78rem; padding:0.3rem 0.5rem;">
              🗑️
            </button>
          </div>
        </div>

        <div style="font-size:0.9rem; color:var(--text-secondary); line-height:1.6; padding-left:3rem; margin-top:0.25rem;">
          ${n.noi_dung}
        </div>
      </div>
    `;
  }).join('');
}

window.markNotificationRead = async function(id) {
  try {
    const res = await fetchWithAuth(`/thong-bao/${id}/da-doc`, { method: 'PATCH' });
    if (res.success) {
      showToast('Đã đánh dấu thông báo là đã đọc.', 'success');
      await loadMyNotifications();
    }
  } catch (err) {
    showToast(err.message, 'error');
  }
};

window.deleteNotification = async function(id) {
  try {
    const res = await fetchWithAuth(`/thong-bao/${id}`, { method: 'DELETE' });
    if (res.success) {
      showToast('Đã xóa thông báo.', 'success');
      await loadMyNotifications();
    }
  } catch (err) {
    showToast(err.message, 'error');
  }
};

/**
 * =====================================================================
 * TRỢ LÝ AI HỎI ĐÁP NGHỀ NGHIỆP DÀNH RIÊNG CHO ỨNG VIÊN
 * Giao diện chat trực quan, tự nhiên, thân thiện - Tuyệt đối không hiển thị SQL / Code
 * =====================================================================
 */
function initCandidateAiChat(user) {
  const chatMessages = document.getElementById('candidateChatMessages');
  const chatForm = document.getElementById('candidateChatForm');
  const chatInput = document.getElementById('candidateChatInput');
  const btnReset = document.getElementById('btnResetChat');
  const suggestionChips = document.querySelectorAll('.chat-chip');

  if (!chatMessages || !chatForm || !chatInput) return;

  const candidateName = user ? user.ho_ten : 'Bạn';
  let isSending = false;

  // Render câu chào mở đầu
  function renderGreeting() {
    chatMessages.innerHTML = '';
    const greetingText = `Xin chào **${candidateName}**! 👋\n\nTôi là **Trợ lý AI Tuyển dụng & Hướng nghiệp** của công ty. Tôi có thể hỗ trợ bạn tìm kiếm các vị trí việc làm phù hợp, theo dõi sát sao tiến độ hồ sơ, gợi ý mẹo chuẩn bị phỏng vấn hoặc tối ưu điểm số CV.\n\nBạn có thể nhấn vào các gợi ý nhanh bên dưới hoặc đặt câu hỏi bất kỳ nhé!`;
    appendChatMessage('ai', greetingText, new Date());
  }

  // Cuộn mượt xuống đáy khung chat
  function scrollToBottom() {
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }

  // Chuyển đổi văn bản tự nhiên có định dạng sang HTML an toàn
  function formatChatMessage(text) {
    if (!text) return '';
    
    // Thoát ký tự HTML an toàn
    let safe = text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');

    // Định dạng in đậm **text**
    safe = safe.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

    // Định dạng in nghiêng *text*
    safe = safe.replace(/\*(.*?)\*/g, '<em>$1</em>');

    // Định dạng danh sách gạch đầu dòng / bullet points
    safe = safe.replace(/^[•\-]\s+(.*)$/gm, '<li style="margin-left:1.2rem; margin-bottom:0.25rem;">$1</li>');

    // Chuyển đổi xuống dòng
    safe = safe.replace(/\n\n/g, '<div style="height:0.5rem"></div>');
    safe = safe.replace(/\n/g, '<br>');

    return safe;
  }

  // Thêm tin nhắn vào khung chat
  function appendChatMessage(sender, text, timestamp = new Date()) {
    const timeStr = timestamp.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
    const row = document.createElement('div');
    row.className = `chat-msg-row ${sender}`;

    const avatarHtml = sender === 'ai' 
      ? `<div class="chat-msg-avatar" title="Trợ lý AI">🤖</div>` 
      : `<div class="chat-msg-avatar" title="${candidateName}">👤</div>`;

    row.innerHTML = `
      ${avatarHtml}
      <div>
        <div class="chat-bubble">
          ${formatChatMessage(text)}
        </div>
        <div class="chat-timestamp">${timeStr}</div>
      </div>
    `;

    chatMessages.appendChild(row);
    scrollToBottom();
  }

  // Hiển thị hiệu ứng AI đang gõ (Typing indicator)
  function showTypingIndicator() {
    const typingRow = document.createElement('div');
    typingRow.className = 'chat-msg-row ai';
    typingRow.id = 'chatTypingIndicator';
    typingRow.innerHTML = `
      <div class="chat-msg-avatar">🤖</div>
      <div>
        <div class="chat-bubble" style="padding:0.6rem 1rem;">
          <div class="typing-indicator">
            <div class="typing-dot"></div>
            <div class="typing-dot"></div>
            <div class="typing-dot"></div>
            <span style="font-size:0.8rem; color:#a5b4fc; margin-left:6px;">Trợ lý AI đang soạn câu trả lời...</span>
          </div>
        </div>
      </div>
    `;
    chatMessages.appendChild(typingRow);
    scrollToBottom();
  }

  // Ẩn hiệu ứng gõ
  function hideTypingIndicator() {
    const typing = document.getElementById('chatTypingIndicator');
    if (typing) typing.remove();
  }

  // Gửi câu hỏi đến Backend AI
  async function sendMessage(questionText) {
    const q = (questionText || chatInput.value || '').trim();
    if (!q || isSending) return;

    isSending = true;
    chatInput.value = '';
    chatInput.disabled = true;
    const btnSend = document.getElementById('btnCandidateChatSend');
    if (btnSend) btnSend.disabled = true;

    // Hiển thị bong bóng chat người dùng
    appendChatMessage('user', q, new Date());

    // Hiển thị trạng thái đang soạn thảo
    showTypingIndicator();

    try {
      const res = await fetchWithAuth('/ai/tro-ly-ung-vien', {
        method: 'POST',
        body: JSON.stringify({ cau_hoi: q })
      });

      hideTypingIndicator();

      if (res.success && res.data) {
        appendChatMessage('ai', res.data.cau_tra_loi, new Date(res.data.thoi_gian || Date.now()));
      } else {
        appendChatMessage('ai', 'Xin lỗi bạn, hiện tại tôi chưa tìm thấy câu trả lời phù hợp. Bạn có thể diễn đạt lại câu hỏi giúp tôi nhé!', new Date());
      }
    } catch (err) {
      hideTypingIndicator();
      console.error('Lỗi khi trò chuyện với trợ lý AI:', err);
      appendChatMessage('ai', 'Rất tiếc, đã có lỗi kết nối tạm thời tới máy chủ AI. Bạn vui lòng thử lại sau giây lát nhé!', new Date());
    } finally {
      isSending = false;
      chatInput.disabled = false;
      if (btnSend) btnSend.disabled = false;
      chatInput.focus();
      scrollToBottom();
    }
  }

  // Bắt sự kiện nộp biểu mẫu chat
  chatForm.addEventListener('submit', (e) => {
    e.preventDefault();
    sendMessage();
  });

  // Hỗ trợ gõ Enter để gửi
  chatInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  });

  // Gợi ý câu hỏi nhanh (Suggestion Chips)
  suggestionChips.forEach(chip => {
    chip.addEventListener('click', () => {
      const prompt = chip.getAttribute('data-question');
      if (prompt) {
        sendMessage(prompt);
      }
    });
  });

  // Nút xóa đoạn chat và bắt đầu lại
  if (btnReset) {
    btnReset.addEventListener('click', () => {
      if (confirm('Bạn có muốn làm mới cuộc trò chuyện với Trợ lý AI?')) {
        renderGreeting();
      }
    });
  }

  // Khởi tạo lời chào ban đầu
  renderGreeting();
}


