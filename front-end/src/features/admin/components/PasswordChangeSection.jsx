export default function PasswordChangeSection({ onChangePassword }) {
  return (
    <div className="password-change-section">
      <h3>Đổi mật khẩu</h3>
      <form onSubmit={(e) => { e.preventDefault(); onChangePassword(); }}>
        <div className="form-group">
          <label>Mật khẩu hiện tại</label>
          <input type="password" />
        </div>
        <div className="form-group">
          <label>Mật khẩu mới</label>
          <input type="password" />
        </div>
        <div className="form-group">
          <label>Xác nhận mật khẩu mới</label>
          <input type="password" />
        </div>
        <button type="submit" className="btn-change-password">Đổi mật khẩu</button>
      </form>
    </div>
  );
}
