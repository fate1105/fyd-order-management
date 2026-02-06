import { useState } from "react";
import { useToast } from "@shared/context/ToastContext";
import { useNavigate } from "react-router-dom";
import AuthShell from "../components/AuthShell.jsx";
import api from "@shared/utils/api.js";
import { saveSession } from "@shared/utils/authSession.js";

// SVG Icons
const EyeIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

const EyeOffIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
    <line x1="1" y1="1" x2="23" y2="23" />
  </svg>
);

const RefreshIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="23 4 23 10 17 10" />
    <polyline points="1 20 1 14 7 14" />
    <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
  </svg>
);

function makeCaptcha() {
  const a = Math.floor(2 + Math.random() * 9);
  const b = Math.floor(2 + Math.random() * 9);
  const op = Math.random() > 0.5 ? "+" : "×";
  const ans = op === "+" ? a + b : a * b;
  return { q: `${a} ${op} ${b}`, ans: String(ans) };
}

export default function Login() {
  const nav = useNavigate();
  const { showToast } = useToast();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [remember, setRemember] = useState(true);

  const [captcha, setCaptcha] = useState(makeCaptcha());
  const [captchaInput, setCaptchaInput] = useState("");

  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  const refreshCaptcha = () => {
    setCaptcha(makeCaptcha());
    setCaptchaInput("");
  };

  const submit = async (e) => {
    e.preventDefault();
    setErr("");

    if (!username.trim() || !password) {
      setErr("Vui lòng nhập tên đăng nhập và mật khẩu.");
      return;
    }

    if (captchaInput.trim() !== captcha.ans) {
      setErr("Captcha không đúng. Vui lòng thử lại.");
      refreshCaptcha();
      return;
    }

    setLoading(true);
    try {
      const response = await api.auth.login(username, password);

      // Store session
      if (response.token) {
        saveSession(response.token, response.user?.permissions);
      }

      nav("/admin");
    } catch (e2) {
      setErr(e2.message || "Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.");
      refreshCaptcha();
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      title="Đăng nhập"
      subtitle="Truy cập hệ thống quản trị FYD Operating System"
    >
      {err && <div className="aError">{err}</div>}

      <form className="authForm" onSubmit={submit}>
        <label className="aField">
          <span>Tên đăng nhập / Email</span>
          <input
            className="aInput"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="admin@fyd.com"
            disabled={loading}
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
              placeholder="••••••••"
              disabled={loading}
              autoComplete="current-password"
            />
            <button
              className="aBtnIcon"
              type="button"
              onClick={() => setShowPw((v) => !v)}
              aria-label={showPw ? "Hide password" : "Show password"}
            >
              {showPw ? <EyeOffIcon /> : <EyeIcon />}
            </button>
          </div>
        </label>

        <div className="aField">
          <span>Xác minh bảo mật</span>
          <div className="captchaBox">
            <div className="captchaQ">{captcha.q}</div>
            <input
              className="aInput"
              value={captchaInput}
              onChange={(e) => setCaptchaInput(e.target.value)}
              placeholder="= ?"
              disabled={loading}
            />
            <button
              className="aBtnIcon"
              type="button"
              onClick={refreshCaptcha}
              aria-label="Refresh captcha"
            >
              <RefreshIcon />
            </button>
          </div>
        </div>

        <div className="authRow">
          <label className="aCheck">
            <input
              type="checkbox"
              checked={remember}
              onChange={(e) => setRemember(e.target.checked)}
            />
            Ghi nhớ đăng nhập
          </label>
          <a
            className="aLink"
            href="#"
            onClick={(e) => {
              e.preventDefault();
              showToast("Vui lòng liên hệ quản trị viên để cấp lại mật khẩu.", "info");
            }}
          >
            Quên mật khẩu?
          </a>
        </div>

        <button className="aPrimary" type="submit" disabled={loading}>
          {loading ? "Đang xử lý..." : "Đăng nhập"}
        </button>
      </form>
    </AuthShell>
  );
}
