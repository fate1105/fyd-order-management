export default function ProfileHeader({ user, onAvatarChange }) {
  return (
    <div className="profile-header">
      <div className="avatar-section">
        <img src={user?.avatar || 'https://via.placeholder.com/150'} alt="Avatar" className="avatar" />
        <button onClick={onAvatarChange} className="btn-change-avatar">Đổi ảnh</button>
      </div>
      <div className="user-info">
        <h2>{user?.fullName || 'User'}</h2>
        <p>{user?.email}</p>
      </div>
    </div>
  );
}
