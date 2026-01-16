import { formatDate } from '../../js/profileUtils';

export default function ProfileHeader({ user, onAvatarClick }) {
  const getInitial = (name) => {
    return name ? name.charAt(0).toUpperCase() : '?';
  };

  return (
    <div className="profile-header">
      <div className="profile-avatar-container" onClick={onAvatarClick}>
        {(user.avatar || user.avatarUrl) ? (
          <img src={user.avatar || user.avatarUrl} alt="Avatar" className="profile-avatar-img" />
        ) : (
          <div className="profile-avatar-default">
            {getInitial(user.name || user.username)}
          </div>
        )}
        <div className="profile-avatar-overlay">
          <span>Thay đổi</span>
        </div>
      </div>
      <div className="profile-header-info">
        <h2 className="profile-name">{user.name || user.username}</h2>
        <p className="profile-email">{user.email}</p>
        <p className="profile-joined">Tham gia: {formatDate(user.createdAt)}</p>
      </div>
    </div>
  );
}
