export default function ProfileInfoSection({ user, onSave }) {
  return (
    <div className="profile-info-section">
      <h3>Thông tin cá nhân</h3>
      <form onSubmit={(e) => { e.preventDefault(); onSave(); }}>
        <div className="form-group">
          <label>Họ tên</label>
          <input type="text" defaultValue={user?.fullName} />
        </div>
        <div className="form-group">
          <label>Email</label>
          <input type="email" defaultValue={user?.email} disabled />
        </div>
        <div className="form-group">
          <label>Số điện thoại</label>
          <input type="tel" defaultValue={user?.phone} />
        </div>
        <button type="submit" className="btn-save">Lưu thay đổi</button>
      </form>
    </div>
  );
}
