import { useState } from 'react';
import { validateName } from '../js/profileUtils';

export default function ProfileInfoSection({ name, email, isEditing, onEdit, onSave, onCancel }) {
  const [tempName, setTempName] = useState(name);
  const [error, setError] = useState(null);

  const handleSave = () => {
    const validation = validateName(tempName);
    if (!validation.valid) {
      setError(validation.error);
      return;
    }
    setError(null);
    onSave(tempName);
  };

  const handleCancel = () => {
    setTempName(name);
    setError(null);
    onCancel();
  };

  const handleChange = (e) => {
    setTempName(e.target.value);
    if (error) setError(null);
  };

  return (
    <div className="card profile-info-section">
      <h3>Thông tin cá nhân</h3>
      
      <div className="field">
        <label>Tên</label>
        {isEditing ? (
          <div>
            <input
              type="text"
              value={tempName}
              onChange={handleChange}
              className={error ? 'error' : ''}
            />
            {error && <span className="error-message">{error}</span>}
            <div className="button-group">
              <button className="btnPrimary" onClick={handleSave}>Lưu</button>
              <button className="btnGhost" onClick={handleCancel}>Hủy</button>
            </div>
          </div>
        ) : (
          <div className="field-display">
            <span>{name}</span>
            <button className="btnGhost" onClick={onEdit}>Chỉnh sửa</button>
          </div>
        )}
      </div>

      <div className="field">
        <label>Email</label>
        <input type="email" value={email} readOnly disabled />
      </div>
    </div>
  );
}
