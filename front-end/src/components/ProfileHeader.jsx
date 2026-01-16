import { formatDate } from '../js/profileUtils';

export default function ProfileHeader({ user, onAvatarClick }) {
  const getInitial = (name) => {
    return name ? name.charAt(0).toUpperCase() : '?';
  };

  return (
    <div className="profile-header">
      <div className="profile-avatar-container" onClick={onAvatarClick}>
        {user.avatar ? (
          <img src={user.avatar} alt="Avatar" className="profile-avatar-img" />
        ) : (
          <div className="profile-avatar-default">
            {getInitial(user.name)}
          </div>
        )}
        <div className="profile-avatar-overlay">
          <span>Thay đổi</span>
        </div>
      </div>
      <div className="profile-header-info">
        <h2 className="profile-name">{user.name}</h2>
        <p className="profile-email">{user.email}</p>
        <p className="profile-joined">Tham gia: {formatDate(user.createdAt)}</p>
      </div>
    </div>
  );
}
