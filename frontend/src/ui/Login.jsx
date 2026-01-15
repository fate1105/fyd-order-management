import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthShell from "../components/AuthShell.jsx";
import {
  clearFail,
  isLocked,
  loginCheck,
  recordFail,
  startOtpSession,
} from "../js/authMock.js";

function makeCaptcha() {
  const a = Math.floor(2 + Math.random() * 9);
  const b = Math.floor(2 + Math.random() * 9);
  const op = Math.random() > 0.5 ? "+" : "×";
  const ans = op === "+" ? a + b : a * b;
  return { q: `${a} ${op} ${b} = ?`, ans: String(ans) };
}

export default  function Login() {
  const nav = useNavigate();

  const [email, setEmail] = useState(localStorage.getItem("fyd_last_email") || "");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [remember, setRemember] = useState(true);

  const [captcha, setCaptcha] = useState(makeCaptcha());
  const [captchaInput, setCaptchaInput] = useState("");

  const [err, setErr] = useState("");
  const [info, setInfo] = useState("");

  const lock = useMemo(() => isLocked(email || ""), [email, err]);

  useEffect(() => {
    if (remember && email) localStorage.setItem("fyd_last_email", email);
  }, [remember, email]);

  const refreshCaptcha = () => {
    setCaptcha(makeCaptcha());
    setCaptchaInput("");
  };

  const submit = (e) => {
    e.preventDefault();
    setErr("");
    setInfo("");

    const lockState = isLocked(email || "");
    if (lockState.locked) {
      setErr(`Bạn đang bị tạm khóa ${lockState.seconds}s do thử sai nhiều lần.`);
      return;
    }

    if (!email.trim() || !password) {
      setErr("Vui lòng nhập email và mật khẩu.");
      return;
    }

    if (captchaInput.trim() !== captcha.ans) {
      setErr("Captcha không đúng. Vui lòng thử lại.");
      refreshCaptcha();
      return;
    }

    try {
      // bước 1: check user/password
      loginCheck({ email, password });
      clearFail(email);

      // bước 2: OTP
      const otp = startOtpSession(email);

      // demo: show otp để test (backend thật sẽ gửi email/SMS)
      setInfo(`OTP demo: ${otp} (hết hạn 2 phút). Nhập OTP để hoàn tất đăng nhập.`);
      nav(`/verify-otp?email=${encodeURIComponent(email)}`);
    } catch (e2) {
      const st = recordFail(email);
      setErr(`${e2.message} (Cooldown: ${Math.ceil((st.until - Date.now()) / 1000)}s)`);
      refreshCaptcha();
    }
  };

  return (
    <AuthShell
      title="Đăng nhập an toàn"
      subtitle="Đăng nhập vào FYD Admin. Có Captcha, OTP và khóa tạm thời để chống brute-force."
    >
      <div className="authHead">
        <div>
          <div className="h">Đăng nhập</div>
          <div className="p">Sử dụng tài khoản admin/staff.</div>
        </div>
        <Link className="aLink" to="/register">Tạo tài khoản</Link>
      </div>

      {err ? <div className="aError">{err}</div> : null}
      {info ? <div className="aInfo">{info}</div> : null}

      {lock.locked ? (
        <div className="aError">
          Tài khoản đang bị khóa tạm thời. Vui lòng thử lại sau <b>{lock.seconds}s</b>.
        </div>
      ) : null}

      <form className="authForm" onSubmit={submit}>
        <label className="aField">
          <span>Email</span>
          <input className="aInput" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="admin@fyd.com" />
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
            />
            <button className="aBtnIcon" type="button" onClick={() => setShowPw((v) => !v)}>
              {showPw ? "🙈" : "👁️"}
            </button>
          </div>
        </label>

        <div className="aField">
          <span>Captcha</span>
          <div className="captchaBox">
            <div className="captchaQ">{captcha.q}</div>
            <input
              className="aInput"
              style={{ maxWidth: 180 }}
              value={captchaInput}
              onChange={(e) => setCaptchaInput(e.target.value)}
              placeholder="Đáp án"
            />
            <button className="aBtnIcon" type="button" onClick={refreshCaptcha}>↻</button>
          </div>
        </div>

        <div className="authRow">
          <label className="aCheck">
            <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} />
            Remember me
          </label>
          <a className="aLink" href="#" onClick={(e) => { e.preventDefault(); alert("Demo: forgot password (backend sẽ xử lý)"); }}>
            Quên mật khẩu?
          </a>
        </div>

        <button className="aPrimary" type="submit">Tiếp tục (OTP)</button>

        <button className="aGhost" type="button" onClick={() => nav("/")}>
          Vào dashboard (demo)
        </button>
      </form>
    </AuthShell>
  );
}
