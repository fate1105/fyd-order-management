import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { getSession } from '../js/authSession';
import {
  getUserFromStorage,
  updateUserInStorage,
  updateSession,
  validateImageFile,
  fileToDataURL
} from '../js/profileUtils';
import ProfileHeader from '../components/ProfileHeader';
import ProfileInfoSection from '../components/ProfileInfoSection';
import PasswordChangeSection from '../components/PasswordChangeSection';
import Toast from '../components/Toast';
import '../css/profile.css';

export default function Profile() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  
  const [user, setUser] = useState(null);
  const [isEditingName, setIsEditingName] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = () => {
    const session = getSession();
    if (!session) {
      navigate('/login');
      return;
    }

    const userData = getUserFromStorage(session.id);
    if (!userData) {
      navigate('/login');
      return;
    }

    setUser(userData);
  };

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
  };

  const handleNameUpdate = (newName) => {
    if (!user) return;

    const success = updateUserInStorage(user.id, { name: newName });
    if (success) {
      updateSession({ name: newName });
      setUser({ ...user, name: newName });
      setIsEditingName(false);
      showToast('Cập nhật tên thành công!');
    } else {
      showToast('Không thể cập nhật tên', 'error');
    }
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleAvatarUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validation = validateImageFile(file);
    if (!validation.valid) {
      showToast(validation.error, 'error');
      return;
    }

    try {
      const dataURL = await fileToDataURL(file);
      const success = updateUserInStorage(user.id, { avatar: dataURL });
      
      if (success) {
        updateSession({ avatar: dataURL });
        setUser({ ...user, avatar: dataURL });
        showToast('Cập nhật ảnh đại diện thành công!');
      } else {
        showToast('Không thể cập nhật ảnh đại diện', 'error');
      }
    } catch (error) {
      showToast('Không thể đọc file ảnh', 'error');
    }
  };

  const handlePasswordChange = (oldPass, newPass, confirmPass) => {
    if (!user) return;

    const success = updateUserInStorage(user.id, { password: newPass });
    if (success) {
      showToast('Đổi mật khẩu thành công!');
    } else {
      showToast('Không thể đổi mật khẩu', 'error');
    }
  };

  if (!user) {
    return <div>Đang tải...</div>;
  }

  return (
    <div className="profile-page">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        style={{ display: 'none' }}
        onChange={handleAvatarUpload}
      />

      <ProfileHeader user={user} onAvatarClick={handleAvatarClick} />

      <div className="profile-content">
        <ProfileInfoSection
          name={user.name}
          email={user.email}
          isEditing={isEditingName}
          onEdit={() => setIsEditingName(true)}
          onSave={handleNameUpdate}
          onCancel={() => setIsEditingName(false)}
        />

        <PasswordChangeSection
          currentPassword={user.password}
          onPasswordChange={handlePasswordChange}
        />
      </div>

      <Toast
        show={toast.show}
        message={toast.message}
        type={toast.type}
        onClose={() => setToast({ ...toast, show: false })}
      />
    </div>
  );
}
