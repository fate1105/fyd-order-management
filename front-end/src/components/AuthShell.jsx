import "../css/auth.css";

function AuthArt() {
  return (
    <svg className="authArt" viewBox="0 0 520 260" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M40 210C120 120 170 150 250 120C330 90 360 40 480 60" stroke="rgba(75,240,200,0.55)" strokeWidth="3" />
      <path d="M40 175C120 85 200 130 260 100C340 60 380 20 480 40" stroke="rgba(110,168,255,0.55)" strokeWidth="3" />
      <circle cx="120" cy="165" r="18" fill="rgba(75,240,200,0.18)" stroke="rgba(75,240,200,0.55)" />
      <circle cx="270" cy="115" r="20" fill="rgba(110,168,255,0.16)" stroke="rgba(110,168,255,0.55)" />
      <rect x="72" y="44" width="185" height="120" rx="22" fill="rgba(255,255,255,0.06)" stroke="rgba(255,255,255,0.12)" />
      <rect x="98" y="78" width="132" height="14" rx="7" fill="rgba(255,255,255,0.10)" />
      <rect x="98" y="104" width="96" height="14" rx="7" fill="rgba(75,240,200,0.14)" />
      <rect x="98" y="130" width="116" height="14" rx="7" fill="rgba(110,168,255,0.14)" />
    </svg>
  );
}

export default function AuthShell({ title, subtitle, children }) {
  return (
    <div className="authPage">
      <div className="authCard">
        <section className="authLeft">
          <div className="authBrand">
            <div className="authLogo">FYD</div>
            <div className="authBrandText">
              <div className="name">FYD Admin</div>
              <div className="sub">Order • Inventory • AI</div>
            </div>
          </div>

          <div className="authPitch">
            <div className="title">{title}</div>
            <div className="desc">{subtitle}</div>
            <div className="authBadges">
              <span className="aBadge">OTP</span>
              <span className="aBadge">Captcha</span>
              <span className="aBadge">Anti brute-force</span>
            </div>
          </div>

          <AuthArt />
        </section>

        <section className="authRight">
          {children}
          <div className="aSmall" style={{ marginTop: 12 }}>
            * Demo frontend: OTP/Captcha mô phỏng. Backend thật sẽ xử lý gửi OTP, hash mật khẩu, rate-limit theo IP.
          </div>
        </section>
      </div>
    </div>
  );
}
