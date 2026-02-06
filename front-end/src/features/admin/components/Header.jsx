import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/header.css";
import { getSession, logout } from "@shared/utils/authSession.js";
import { NotificationPanel, AllNotificationsModal } from "./notifications";
import useNotifications from "../hooks/useNotifications.jsx";
import { useTranslation } from "react-i18next";
import { useConfirm } from "@shared/context/ConfirmContext";
import { useTheme } from "@shared/hooks/useTheme.js";

export default function Header({ kicker, title }) {
  const nav = useNavigate();
  const { t, i18n } = useTranslation();
  const { showConfirm } = useConfirm();
  const { theme, toggleTheme } = useTheme();

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
  const [showAllNoti, setShowAllNoti] = useState(false);

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

  const onLogout = async () => {
    if (await showConfirm(t("common.logout"), t("common.confirm_logout", "Bạn có chắc muốn đăng xuất không?"))) {
      logout();
      nav("/admin/login");
    }
  };

  const toggleLanguage = () => {
    const newLang = i18n.language === "vi" ? "en" : "vi";
    i18n.changeLanguage(newLang);
  };

  const SunIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="5"></circle>
      <line x1="12" y1="1" x2="12" y2="3"></line>
      <line x1="12" y1="21" x2="12" y2="23"></line>
      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
      <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
      <line x1="1" y1="12" x2="3" y2="12"></line>
      <line x1="21" y1="12" x2="23" y2="12"></line>
      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
      <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
    </svg>
  );

  const MoonIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
    </svg>
  );

  const LangIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
      <path d="M2 12a15.3 15.3 0 0 1 10-4 15.3 15.3 0 0 1 10 4 15.3 15.3 0 0 1-10 4 15.3 15.3 0 0 1-10-4z" />
    </svg>
  );

  const AiIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
      <path d="M5 3v4M3 5h4M19 17v4M17 19h4" />
    </svg>
  );

  return (
    <header className="topbar">
      <div className="topbarLeft">
        <div className="pageTitle">
          <div className="pageKicker">{kicker}</div>
          <div className="pageMain">{title}</div>
        </div>
      </div>

      <div className="topbarRight">
        <button className="headerBtn themeBtn" type="button" onClick={toggleTheme} title={t("common.theme_toggle")}>
          {theme === "dark" ? <SunIcon /> : <MoonIcon />}
        </button>

        <button className="headerBtn iconOnly" type="button" onClick={toggleLanguage} title={i18n.language === "vi" ? "Switch to English" : "Chuyển sang Tiếng Việt"}>
          <LangIcon />
          <span style={{ fontSize: '10px', fontWeight: '800', marginLeft: '-4px' }}>
            {i18n.language === "vi" ? "VN" : "EN"}
          </span>
        </button>

        <button className="headerBtn iconOnly" type="button" onClick={() => nav("/admin/ai")} title={t("common.ai_suggestion")}>
          <AiIcon />
        </button>

        <div className="notifWrap" ref={notiRef}>
          <button
            className="iconBtn"
            type="button"
            aria-label={`${t("common.notifications")}, ${unreadCount} ${t("header.unread_suffix")}`}
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
            onViewAll={() => setShowAllNoti(true)}
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
              {user?.avatarUrl ? (
                <img src={user.avatarUrl} alt="" />
              ) : (
                <span>{user?.fullName?.charAt(0)?.toUpperCase() || "A"}</span>
              )}
            </div>
            <div className="userInfo">
              <span className="userName">{user?.fullName || "Admin"}</span>
              <span className="userRole">{user?.role?.name === "STAFF" ? t("common.staff_role") : t("common.admin")}</span>
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
                {t("header.profile")}
              </button>
              <button className="dropdownItem" type="button" onClick={() => { setOpenUser(false); nav("/"); }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                  <polyline points="9 22 9 12 15 12 15 22" />
                </svg>
                {t("header.view_shop")}
              </button>
              <div className="dropdownDivider" />
              <button className="dropdownItem danger" type="button" onClick={onLogout}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                  <polyline points="16 17 21 12 16 7" />
                  <line x1="21" y1="12" x2="9" y2="12" />
                </svg>
                {t("header.logout")}
              </button>
            </div>
          )}
        </div>
      </div>

      <AllNotificationsModal
        isOpen={showAllNoti}
        onClose={() => setShowAllNoti(false)}
      />
    </header>
  );
}
