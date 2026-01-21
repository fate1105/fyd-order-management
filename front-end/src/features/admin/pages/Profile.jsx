import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPortal } from 'react-dom';
import { isLoggedIn, logout } from '@shared/utils/authSession';
import { authAPI, formatDate } from '@shared/utils/api';
import Toast from '@shared/components/Toast';
import '../styles/profile.css';

// SVG Icons
const UserIcon = () => (
  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

const CameraIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
    <circle cx="12" cy="13" r="4" />
  </svg>
);

const EditIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" />
  </svg>
);

const LockIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
);

const ShieldIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
  </svg>
);

const CloseIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M18 6L6 18M6 6l12 12" />
  </svg>
);

const EyeIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

const EyeOffIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
    <line x1="1" y1="1" x2="23" y2="23" />
  </svg>
);

// Password Modal Component
function PasswordModal({ open, onClose, onSuccess }) {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!currentPassword || !newPassword || !confirmPassword) {
      setError('Vui lòng điền đầy đủ thông tin');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Mật khẩu mới và xác nhận không khớp');
      return;
    }

    if (newPassword.length < 6) {
      setError('Mật khẩu mới phải có ít nhất 6 ký tự');
      return;
    }

    setLoading(true);
    try {
      await authAPI.updateProfile({
        currentPassword,
        newPassword
      });
      onSuccess();
      onClose();
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setError(err.message || 'Không thể đổi mật khẩu');
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  return createPortal(
    <div className="modalBackdrop" onMouseDown={onClose}>
      <div className="modal passwordModal" onMouseDown={e => e.stopPropagation()}>
        <div className="modalHead">
          <div className="modalTitle">
            <LockIcon /> Đổi mật khẩu
          </div>
          <button className="iconBtn" type="button" onClick={onClose}>
            <CloseIcon />
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modalBody">
            {error && <div className="errorMessage">{error}</div>}

            <div className="field">
              <label>Mật khẩu hiện tại</label>
              <div className="inputRow">
                <input
                  type={showCurrent ? 'text' : 'password'}
                  value={currentPassword}
                  onChange={e => setCurrentPassword(e.target.value)}
                  placeholder="Nhập mật khẩu hiện tại"
                  disabled={loading}
                />
                <button
                  type="button"
                  className="iconBtn"
                  onClick={() => setShowCurrent(!showCurrent)}
                >
                  {showCurrent ? <EyeOffIcon /> : <EyeIcon />}
                </button>
              </div>
            </div>

            <div className="field">
              <label>Mật khẩu mới</label>
              <div className="inputRow">
                <input
                  type={showNew ? 'text' : 'password'}
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  placeholder="Nhập mật khẩu mới"
                  disabled={loading}
                />
                <button
                  type="button"
                  className="iconBtn"
                  onClick={() => setShowNew(!showNew)}
                >
                  {showNew ? <EyeOffIcon /> : <EyeIcon />}
                </button>
              </div>
            </div>

            <div className="field">
              <label>Xác nhận mật khẩu mới</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                placeholder="Nhập lại mật khẩu mới"
                disabled={loading}
              />
            </div>
          </div>
          <div className="modalActions">
            <button type="button" className="btnGhost" onClick={onClose}>Hủy</button>
            <button type="submit" className="btnPrimary" disabled={loading}>
              {loading ? 'Đang xử lý...' : 'Cập nhật'}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}

export default function Profile() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  // Edit states
  const [isEditingName, setIsEditingName] = useState(false);
  const [editName, setEditName] = useState('');
  const [savingName, setSavingName] = useState(false);

  // Password modal
  const [showPasswordModal, setShowPasswordModal] = useState(false);

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    if (!isLoggedIn()) {
      navigate('/admin/login');
      return;
    }

    try {
      setLoading(true);
      const userData = await authAPI.getMe();
      setUser(userData);
      setEditName(userData.fullName || userData.username || '');
    } catch (error) {
      console.error('Failed to load user:', error);
      showToast('Không thể tải thông tin người dùng', 'error');
      // If unauthorized, redirect to login
      if (error.message?.includes('401') || error.message?.includes('Unauthorized')) {
        logout();
        navigate('/admin/login');
      }
    } finally {
      setLoading(false);
    }
  };

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
  };

  const handleSaveName = async () => {
    if (!editName.trim()) {
      showToast('Tên không được để trống', 'error');
      return;
    }

    setSavingName(true);
    try {
      await authAPI.updateProfile({ fullName: editName.trim() });
      setUser(prev => ({ ...prev, fullName: editName.trim() }));
      setIsEditingName(false);
      showToast('Cập nhật tên thành công!');
    } catch (error) {
      showToast(error.message || 'Không thể cập nhật tên', 'error');
    } finally {
      setSavingName(false);
    }
  };

  const handleAvatarUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      showToast('Vui lòng chọn file ảnh (jpg, png, gif, webp)', 'error');
      return;
    }

    // For now, just show a message - real upload would require API endpoint
    showToast('Tính năng upload avatar đang được phát triển', 'info');
  };

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  if (loading) {
    return (
      <div className="admin-profile-page">
        <div className="profile-loading">
          <div className="loadingSpinner"></div>
          <p>Đang tải thông tin...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="admin-profile-page">
        <div className="profile-error">
          <p>Không thể tải thông tin người dùng</p>
          <button className="btnPrimary" onClick={() => navigate('/admin/login')}>
            Đăng nhập lại
          </button>
        </div>
      </div>
    );
  }

  const initials = (user.fullName || user.username || 'A').charAt(0).toUpperCase();

  return (
    <div className="admin-profile-page">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        style={{ display: 'none' }}
        onChange={handleAvatarUpload}
      />

      {/* Profile Header Card */}
      <div className="profile-header">
        <div className="profile-header-inner">
          <div className="profile-avatar-container" onClick={() => fileInputRef.current?.click()}>
            {user.avatar ? (
              <img src={user.avatar} alt="Avatar" className="profile-avatar-img" />
            ) : (
              <div className="profile-avatar-default">{initials}</div>
            )}
            <div className="profile-avatar-overlay">
              <CameraIcon />
              <span>Đổi ảnh</span>
            </div>
          </div>

          <div className="profile-header-info">
            <h1 className="profile-name">{user.fullName || user.username}</h1>
            <p className="profile-email">{user.email}</p>
            <p className="profile-role">
              <ShieldIcon />
              {user.role === 'ADMIN' ? 'Quản trị viên' : user.role || 'Nhân viên'}
            </p>
          </div>

          <div className="profile-header-actions">
            <button className="btnGhost" onClick={handleLogout}>
              Đăng xuất
            </button>
          </div>
        </div>
      </div>

      {/* Content Grid */}
      <div className="profile-content">
        {/* Personal Info Section */}
        <div className="profile-section">
          <div className="section-header">
            <h3><UserIcon /> Thông tin cá nhân</h3>
          </div>

          <div className="field">
            <label>Họ và tên</label>
            {isEditingName ? (
              <div className="edit-field">
                <input
                  type="text"
                  value={editName}
                  onChange={e => setEditName(e.target.value)}
                  disabled={savingName}
                  autoFocus
                />
                <div className="edit-actions">
                  <button
                    className="btnGhost"
                    onClick={() => {
                      setIsEditingName(false);
                      setEditName(user.fullName || user.username || '');
                    }}
                    disabled={savingName}
                  >
                    Hủy
                  </button>
                  <button
                    className="btnPrimary"
                    onClick={handleSaveName}
                    disabled={savingName}
                  >
                    {savingName ? 'Đang lưu...' : 'Lưu'}
                  </button>
                </div>
              </div>
            ) : (
              <div className="field-display">
                <span>{user.fullName || user.username || '—'}</span>
                <button className="iconBtn" onClick={() => setIsEditingName(true)}>
                  <EditIcon />
                </button>
              </div>
            )}
          </div>

          <div className="field">
            <label>Email</label>
            <div className="field-display readonly">
              <span>{user.email || '—'}</span>
            </div>
          </div>

          <div className="field">
            <label>Tên đăng nhập</label>
            <div className="field-display readonly">
              <span>{user.username || '—'}</span>
            </div>
          </div>

          {user.createdAt && (
            <div className="field">
              <label>Ngày tham gia</label>
              <div className="field-display readonly">
                <span>{formatDate(user.createdAt)}</span>
              </div>
            </div>
          )}
        </div>

        {/* Security Section */}
        <div className="profile-section">
          <div className="section-header">
            <h3><LockIcon /> Bảo mật</h3>
          </div>

          <div className="security-item">
            <div className="security-info">
              <h4>Mật khẩu</h4>
              <p>Đổi mật khẩu đăng nhập của bạn</p>
            </div>
            <button className="btnGhost" onClick={() => setShowPasswordModal(true)}>
              Đổi mật khẩu
            </button>
          </div>

          <div className="security-item">
            <div className="security-info">
              <h4>Phiên đăng nhập</h4>
              <p>Quản lý các thiết bị đã đăng nhập</p>
            </div>
            <button className="btnGhost" disabled>
              Xem chi tiết
            </button>
          </div>
        </div>

        {/* Activity Section */}
        <div className="profile-section profile-section-full">
          <div className="section-header">
            <h3>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
              </svg>
              Hoạt động gần đây
            </h3>
          </div>

          <div className="activity-stats">
            <div className="stat-card">
              <div className="stat-value">—</div>
              <div className="stat-label">Đơn xử lý hôm nay</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">—</div>
              <div className="stat-label">Sản phẩm cập nhật</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">—</div>
              <div className="stat-label">Khách hàng mới</div>
            </div>
          </div>

          <div className="activity-log">
            <div className="activity-item">
              <div className="activity-icon">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
              </div>
              <div className="activity-content">
                <span className="activity-text">Đăng nhập vào hệ thống</span>
                <span className="activity-time">Vừa xong</span>
              </div>
            </div>
            <div className="activity-empty">
              <p>Hoạt động sẽ được ghi nhận tại đây</p>
            </div>
          </div>
        </div>
      </div>

      {/* Password Modal */}
      <PasswordModal
        open={showPasswordModal}
        onClose={() => setShowPasswordModal(false)}
        onSuccess={() => showToast('Đổi mật khẩu thành công!')}
      />

      {/* Toast */}
      <Toast
        show={toast.show}
        message={toast.message}
        type={toast.type}
        onClose={() => setToast({ ...toast, show: false })}
      />
    </div>
  );
}
