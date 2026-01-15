import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../css/header.css";
import { logout } from "../js/authSession.js";

export default function Header({ kicker, title }) {
  const nav = useNavigate();

  // Theme
  const [theme, setTheme] = useState(() => localStorage.getItem("theme") || "dark");

  useEffect(() => {
    // light => thêm class light vào body, dark => remove
    document.body.classList.toggle("light", theme === "light");
    localStorage.setItem("theme", theme);
  }, [theme]);

  // User dropdown
  const [openUser, setOpenUser] = useState(false);
  const userRef = useRef(null);

  // Notifications
  const [openNoti, setOpenNoti] = useState(false);
  const notiRef = useRef(null);

  // demo data
  const notis = [
    { id: 1, type: "order", title: "Đơn #FYD-10241", desc: "Đang được giao", time: "2 phút trước", unread: true },
    { id: 2, type: "ai", title: "AI gợi ý mới", desc: "Áo thun FYD → Túi tote FYD", time: "10 phút trước", unread: true },
    { id: 3, type: "warn", title: "Sắp hết hàng", desc: "Hoodie đen còn 3 sản phẩm", time: "1 giờ trước", unread: false },
  ];
  const unreadCount = notis.filter((n) => n.unread).length;

  // Click ngoài dropdown => đóng (cả user + noti)
  useEffect(() => {
    const onClickOutside = (e) => {
      // đóng user menu
      if (userRef.current && !userRef.current.contains(e.target)) {
        setOpenUser(false);
      }
      // đóng noti panel
      if (notiRef.current && !notiRef.current.contains(e.target)) {
        setOpenNoti(false);
      }
    };

    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  const onLogout = () => {
    if (confirm("Bạn có chắc muốn đăng xuất không?")) {
      logout();
      nav("/login");
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
        <div className="searchBox" title="Demo UI">
          <span className="searchIcon" aria-hidden="true">⌕</span>
          <input className="searchInput" placeholder="Tìm… (demo)" />
          <span className="searchHint">Ctrl K</span>
        </div>

        <button className="chipBtn" type="button" onClick={() => nav("/orders")}>
          + Tạo đơn
        </button>

        <button className="chipBtn ghost" type="button" onClick={() => nav("/ai")}>
          ✨ AI
        </button>

        {/* 🔔 Notifications */}
        <div className="notifWrap" ref={notiRef}>
          <button
            className="iconBtn"
            type="button"
            title="Thông báo"
            onClick={() => {
              setOpenNoti((v) => !v);
              setOpenUser(false); // mở noti thì đóng user cho gọn UI
            }}
            aria-haspopup="dialog"
            aria-expanded={openNoti}
          >
            {unreadCount > 0 && <span className="dot" />}
            🔔
          </button>

          <div className={`notifPanel ${openNoti ? "show" : ""}`}>
            <div className="notifHead">
              <div className="notifTitle">Thông báo</div>
              <div className="notifBadge">{unreadCount} mới</div>
            </div>

            <div className="notifList">
              {notis.map((n) => (
                <div key={n.id} className={`notifItem ${n.unread ? "unread" : ""}`}>
                  <div className={`notifIcon ${n.type}`}>
                    {n.type === "order" ? "📦" : n.type === "ai" ? "✨" : "⚠️"}
                  </div>

                  <div className="notifBody">
                    <div className="notifRow">
                      <div className="notifItemTitle">{n.title}</div>
                      <div className="notifTime">{n.time}</div>
                    </div>
                    <div className="notifDesc">{n.desc}</div>
                  </div>
                </div>
              ))}
            </div>

            <button
              className="notifFooter"
              type="button"
              onClick={() => {
                setOpenNoti(false);
                nav("/notifications");
              }}
            >
              Xem tất cả →
            </button>
          </div>
        </div>
        <button
          className="themeToggle"
          type="button"
          aria-label="Toggle theme"
          title={theme === "light" ? "Chuyển sang tối" : "Chuyển sang sáng"}
          onClick={() => setTheme(theme === "light" ? "dark" : "light")}
        >
          <span className="icon">{theme === "light" ? "☀️" : "🌙"}</span>
        </button>




        {/* Avatar dropdown */}
        <div className="userWrap" ref={userRef}>
          <div
            className="userChip"
            onClick={() => {
              setOpenUser((v) => !v);
              setOpenNoti(false); // mở user thì đóng noti
            }}
          >
            <div className="avatar">F</div>
            <div className="userMeta">
              <div className="userName">FYD Staff</div>
              <div className="userRole">Admin</div>
            </div>
          </div>

          {openUser && (
            <div className="userDropdown">
              <button
                className="userItem"
                type="button"
                onClick={() => {
                  setOpenUser(false);
                  nav("/profile");
                }}
              >
                👤 Hồ sơ
              </button>

              <div className="userDivider" />

              <button className="userItem" type="button" onClick={onLogout}>
                ⎋ Đăng xuất
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
