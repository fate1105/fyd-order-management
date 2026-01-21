import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/header.css";
import { getSession, logout } from "@shared/utils/authSession.js";
import { NotificationPanel } from "./notifications";
import useNotifications from "../hooks/useNotifications.jsx";

export default function Header({ kicker, title }) {
  const nav = useNavigate();

  // Get user from session
  const [user, setUser] = useState(null);

  useEffect(() => {
    const session = getSession();
    if (session) {
      const users = JSON.parse(localStorage.getItem("fyd_users") || "[]");
      const fullUser = users.find(u => u.id === session.id);
      setUser(fullUser || session);
    }
  }, []);

  // User dropdown
  const [openUser, setOpenUser] = useState(false);
  const userRef = useRef(null);

  // Notifications
  const [openNoti, setOpenNoti] = useState(false);
  const notiRef = useRef(null);
  const { unreadCount, hasUrgent } = useNotifications();

  useEffect(() => {
    const onClickOutside = (e) => {
      if (userRef.current && !userRef.current.contains(e.target)) {
        setOpenUser(false);
      }
      if (notiRef.current && !notiRef.current.contains(e.target)) {
        setOpenNoti(false);
      }
    };

    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  const onLogout = () => {
    if (window.confirm("Bạn có chắc muốn đăng xuất không?")) {
      logout();
      nav("/admin/login");
    }
  };

  return (
    <header className="topbar">
      <div className="topbarLeft">
        <div className="pageTitle">
          <div className="pageKicker">{kicker}</div>
          <div className="pageMain">{title}</div>
        </div>
      </div>

      <div className="topbarRight">
        <div className="searchBox">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.35-4.35" />
          </svg>
          <input className="searchInput" placeholder="Tìm kiếm..." />
        </div>

        <button className="headerBtn primary" type="button" onClick={() => nav("/admin/orders")}>
          + TẠO ĐƠN
        </button>

        <button className="headerBtn" type="button" onClick={() => nav("/admin/ai")}>
          AI
        </button>

        <div className="notifWrap" ref={notiRef}>
          <button
            className="iconBtn"
            type="button"
            aria-label={`Thông báo, ${unreadCount} chưa đọc`}
            aria-haspopup="dialog"
            aria-expanded={openNoti}
            aria-controls="notification-panel"
            onClick={() => {
              setOpenNoti((v) => !v);
              setOpenUser(false);
            }}
          >
            {unreadCount > 0 && (
              <span className={`notif-count-badge ${hasUrgent ? 'urgent' : ''}`}>
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            )}
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
              <path d="M13.73 21a2 2 0 0 1-3.46 0" />
            </svg>
          </button>

          <NotificationPanel
            isOpen={openNoti}
            onClose={() => setOpenNoti(false)}
          />
        </div>

        <div className="userWrap" ref={userRef}>
          <button
            className="userBtn"
            type="button"
            onClick={() => {
              setOpenUser((v) => !v);
              setOpenNoti(false);
            }}
          >
            <div className="userAvatar">
              {user?.avatar ? (
                <img src={user.avatar} alt="" />
              ) : (
                <span>{user?.name?.charAt(0)?.toUpperCase() || "A"}</span>
              )}
            </div>
            <div className="userInfo">
              <span className="userName">{user?.name || "Admin"}</span>
              <span className="userRole">{user?.role === "staff" ? "Nhân viên" : "Quản trị viên"}</span>
            </div>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="m6 9 6 6 6-6" />
            </svg>
          </button>

          {openUser && (
            <div className="userDropdown">
              <button className="dropdownItem" type="button" onClick={() => { setOpenUser(false); nav("/admin/profile"); }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
                Hồ sơ cá nhân
              </button>
              <button className="dropdownItem" type="button" onClick={() => { setOpenUser(false); nav("/"); }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                  <polyline points="9 22 9 12 15 12 15 22" />
                </svg>
                Xem cửa hàng
              </button>
              <div className="dropdownDivider" />
              <button className="dropdownItem danger" type="button" onClick={onLogout}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                  <polyline points="16 17 21 12 16 7" />
                  <line x1="21" y1="12" x2="9" y2="12" />
                </svg>
                Đăng xuất
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
