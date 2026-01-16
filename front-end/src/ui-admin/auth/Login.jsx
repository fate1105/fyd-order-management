import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AuthShell from "../components/AuthShell.jsx";
import { authAPI } from "../../js/api.js";
import { isLoggedIn, setSession } from "../../js/authSession.js";

export default function Login() {
  const nav = useNavigate();

  const [username, setUsername] = useState(localStorage.getItem("fyd_last_user") || "");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [remember, setRemember] = useState(true);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  useEffect(() => {
    const theme = localStorage.getItem("theme") || "dark";
    document.body.classList.toggle("light", theme === "light");
  }, []);

  useEffect(() => {
    if (remember && username) localStorage.setItem("fyd_last_user", username);
  }, [remember, username]);

  // Check if already logged in
  useEffect(() => {
    if (isLoggedIn()) nav("/admin");
  }, [nav]);

  const submit = async (e) => {
    e.preventDefault();
    setErr("");

    if (!username.trim() || !password) {
      setErr("Vui lòng nhập tài khoản và mật khẩu.");
      return;
    }

    setLoading(true);
    try {
      const result = await authAPI.login(username, password);
      
      if (result.success) {
        setSession(result.token, result.user);
        nav("/admin");
      } else {
        setErr(result.message || "Đăng nhập thất bại");
      }
    } catch (e2) {
      setErr(e2.message || "Không thể kết nối server");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      title="Admin Panel"
      subtitle="Hệ thống quản lý FYD Fashion - Dành cho quản trị viên"
    >
      <div className="authHead">
        <div>
          <div className="h">Đăng nhập Admin</div>
          <div className="p">Truy cập bảng điều khiển quản trị</div>
        </div>
      </div>

      {err && <div className="aError">{err}</div>}

      <form className="authForm" onSubmit={submit}>
        <label className="aField">
          <span>Tài khoản</span>
          <input 
            className="aInput" 
            value={username} 
            onChange={(e) => setUsername(e.target.value)} 
            placeholder="Nhập tên đăng nhập" 
            autoComplete="username"
          />
        </label>

        <label className="aField">
          <span>Mật khẩu</span>
          <div className="aInputRow">
            <input
              className="aInput"
              type={showPw ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Nhập mật khẩu"
              autoComplete="current-password"
            />
            <button className="aBtnIcon" type="button" onClick={() => setShowPw((v) => !v)}>
              {showPw ? "🙈" : "👁️"}
            </button>
          </div>
        </label>

        <div className="authRow">
          <label className="aCheck">
            <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} />
            Ghi nhớ đăng nhập
          </label>
        </div>

        <button className="aPrimary" type="submit" disabled={loading}>
          {loading ? "Đang xử lý..." : "Đăng nhập"}
        </button>
      </form>

      <div className="admin-login-footer">
        <a href="/" className="back-to-shop">← Quay lại cửa hàng</a>
      </div>
    </AuthShell>
  );
}
