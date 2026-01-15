import { useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import AuthShell from "../components/AuthShell.jsx";
import { startOtpSession, verifyOtp } from "../js/authMock.js";

function useQuery() {
  const { search } = useLocation();
  return useMemo(() => new URLSearchParams(search), [search]);
}

export default function VerifyOtp() {
  const nav = useNavigate();
  const q = useQuery();
  const email = q.get("email") || "";

  const [otp, setOtp] = useState("");
  const [err, setErr] = useState("");
  const [info, setInfo] = useState("");

  const submit = (e) => {
    e.preventDefault();
    setErr("");
    setInfo("");

    try {
      verifyOtp(email, otp);
      // Demo “session”
      localStorage.setItem("fyd_session", JSON.stringify({ email, createdAt: Date.now() }));
      nav("/");
    } catch (e2) {
      setErr(e2.message);
    }
  };

  const resend = () => {
    setErr("");
    const newOtp = startOtpSession(email);
    setInfo(`OTP demo mới: ${newOtp} (2 phút)`);
  };

  return (
    <AuthShell
      title="Xác thực OTP"
      subtitle="Nhập mã OTP 6 số để hoàn tất đăng nhập. (Demo: OTP hiển thị để test)."
    >
      <div className="authHead">
        <div>
          <div className="h">Verify OTP</div>
          <div className="p">Email: <b>{email || "(trống)"}</b></div>
        </div>
        <Link className="aLink" to="/login">Quay lại</Link>
      </div>

      {err ? <div className="aError">{err}</div> : null}
      {info ? <div className="aInfo">{info}</div> : null}

      <form className="authForm" onSubmit={submit}>
        <label className="aField">
          <span>Mã OTP</span>
          <input
            className="aInput"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            placeholder="6 số"
            inputMode="numeric"
          />
        </label>

        <div className="authRow">
          <a className="aLink" href="#" onClick={(e) => { e.preventDefault(); resend(); }}>
            Gửi lại OTP
          </a>
          <span className="aSmall">OTP hết hạn sau 2 phút (demo).</span>
        </div>

        <button className="aPrimary" type="submit">Xác nhận</button>
      </form>
    </AuthShell>
  );
}
