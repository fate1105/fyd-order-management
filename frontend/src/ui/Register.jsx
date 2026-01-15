import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthShell from "../components/AuthShell.jsx";
import { registerUser } from "../js/authMock.js";

function makeCaptcha() {
  const a = Math.floor(2 + Math.random() * 9);
  const b = Math.floor(2 + Math.random() * 9);
  const op = Math.random() > 0.5 ? "+" : "×";
  const ans = op === "+" ? a + b : a * b;
  return { q: `${a} ${op} ${b} = ?`, ans: String(ans) };
}

function strengthScore(pw) {
  let s = 0;
  if (pw.length >= 8) s++;
  if (/[A-Z]/.test(pw)) s++;
  if (/[a-z]/.test(pw)) s++;
  if (/\d/.test(pw)) s++;
  if (/[^A-Za-z0-9]/.test(pw)) s++;
  return s; // 0..5
}

export default function Register() {
  const nav = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [pw2, setPw2] = useState("");
  const [show, setShow] = useState(false);

  const [captcha, setCaptcha] = useState(makeCaptcha());
  const [capIn, setCapIn] = useState("");

  const [err, setErr] = useState("");
  const [info, setInfo] = useState("");

  const score = useMemo(() => strengthScore(pw), [pw]);
  const scorePct = Math.min(100, Math.round((score / 5) * 100));
  const label = score >= 4 ? "Mạnh" : score >= 3 ? "Vừa" : "Yếu";

  const refreshCaptcha = () => {
    setCaptcha(makeCaptcha());
    setCapIn("");
  };

  const submit = (e) => {
    e.preventDefault();
    setErr("");
    setInfo("");

    if (!name.trim() || !email.trim() || !pw) {
      setErr("Vui lòng nhập đầy đủ thông tin.");
      return;
    }
    if (pw !== pw2) {
      setErr("Mật khẩu nhập lại không khớp.");
      return;
    }
    if (score < 4) {
      setErr("Mật khẩu chưa đủ mạnh. Gợi ý: >= 8 ký tự, có chữ hoa, chữ thường, số, ký tự đặc biệt.");
      return;
    }
    if (capIn.trim() !== captcha.ans) {
      setErr("Captcha không đúng.");
      refreshCaptcha();
      return;
    }

    try {
      registerUser({ name, email, password: pw });
      setInfo("Đăng ký thành công! Bạn có thể đăng nhập.");
      setTimeout(() => nav("/login"), 300);
    } catch (e2) {
      setErr(e2.message);
      refreshCaptcha();
    }
  };

  return (
    <AuthShell
      title="Tạo tài khoản"
      subtitle="Tạo tài khoản để truy cập FYD Admin. Áp dụng mật khẩu mạnh + captcha."
    >
      <div className="authHead">
        <div>
          <div className="h">Đăng ký</div>
          <div className="p">Tạo tài khoản staff/admin (demo localStorage).</div>
        </div>
        <Link className="aLink" to="/login">Đăng nhập</Link>
      </div>

      {err ? <div className="aError">{err}</div> : null}
      {info ? <div className="aInfo">{info}</div> : null}

      <form className="authForm" onSubmit={submit}>
        <label className="aField">
          <span>Họ tên</span>
          <input className="aInput" value={name} onChange={(e) => setName(e.target.value)} placeholder="VD: FYD Staff" />
        </label>

        <label className="aField">
          <span>Email</span>
          <input className="aInput" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="staff@fyd.com" />
        </label>

        <label className="aField">
          <span>Mật khẩu</span>
          <div className="aInputRow">
            <input className="aInput" type={show ? "text" : "password"} value={pw} onChange={(e) => setPw(e.target.value)} placeholder="Mật khẩu mạnh" />
            <button className="aBtnIcon" type="button" onClick={() => setShow((v) => !v)}>
              {show ? "🙈" : "👁️"}
            </button>
          </div>

          <div className="strength" style={{ marginTop: 10 }}>
            <div className="strBar">
              <div className="strFill" style={{ width: `${scorePct}%` }} />
            </div>
            <div className="strTxt">{label}</div>
          </div>
        </label>

        <label className="aField">
          <span>Nhập lại mật khẩu</span>
          <input className="aInput" type={show ? "text" : "password"} value={pw2} onChange={(e) => setPw2(e.target.value)} placeholder="Nhập lại" />
        </label>

        <div className="aField">
          <span>Captcha</span>
          <div className="captchaBox">
            <div className="captchaQ">{captcha.q}</div>
            <input className="aInput" style={{ maxWidth: 180 }} value={capIn} onChange={(e) => setCapIn(e.target.value)} placeholder="Đáp án" />
            <button className="aBtnIcon" type="button" onClick={refreshCaptcha}>↻</button>
          </div>
        </div>

        <button className="aPrimary" type="submit">Tạo tài khoản</button>
      </form>
    </AuthShell>
  );
}
