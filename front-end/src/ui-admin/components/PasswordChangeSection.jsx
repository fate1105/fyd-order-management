import { useState } from 'react';
import { validatePassword, validatePasswordMatch } from '../../js/profileUtils';

export default function PasswordChangeSection({ onPasswordChange }) {
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState({});

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const newErrors = {};
    
    if (!oldPassword) {
      newErrors.oldPassword = 'Vui lòng nhập mật khẩu hiện tại';
    }
    
    const newValidation = validatePassword(newPassword);
    if (!newValidation.valid) {
      newErrors.newPassword = newValidation.error;
    }
    
    const confirmValidation = validatePassword(confirmPassword);
    if (!confirmValidation.valid) {
      newErrors.confirmPassword = confirmValidation.error;
    }
    
    if (newPassword && confirmPassword) {
      const matchValidation = validatePasswordMatch(newPassword, confirmPassword);
      if (!matchValidation.valid) {
        newErrors.confirmPassword = matchValidation.error;
      }
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    setOldPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setErrors({});
    
    onPasswordChange(oldPassword, newPassword, confirmPassword);
  };

  const handleFieldChange = (field, value) => {
    if (field === 'old') setOldPassword(value);
    if (field === 'new') setNewPassword(value);
    if (field === 'confirm') setConfirmPassword(value);
    
    if (errors[field + 'Password']) {
      setErrors({ ...errors, [field + 'Password']: null });
    }
  };

  return (
    <div className="card password-change-section">
      <h3>Đổi mật khẩu</h3>
      
      <form onSubmit={handleSubmit}>
        <div className="field">
          <label>Mật khẩu hiện tại</label>
          <input
            type="password"
            value={oldPassword}
            onChange={(e) => handleFieldChange('old', e.target.value)}
            className={errors.oldPassword ? 'error' : ''}
          />
          {errors.oldPassword && <span className="error-message">{errors.oldPassword}</span>}
        </div>

        <div className="field">
          <label>Mật khẩu mới</label>
          <input
            type="password"
            value={newPassword}
            onChange={(e) => handleFieldChange('new', e.target.value)}
            className={errors.newPassword ? 'error' : ''}
          />
          {errors.newPassword && <span className="error-message">{errors.newPassword}</span>}
        </div>

        <div className="field">
          <label>Xác nhận mật khẩu mới</label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => handleFieldChange('confirm', e.target.value)}
            className={errors.confirmPassword ? 'error' : ''}
          />
          {errors.confirmPassword && <span className="error-message">{errors.confirmPassword}</span>}
        </div>

        <button type="submit" className="btnPrimary">Đổi mật khẩu</button>
      </form>
    </div>
  );
}
