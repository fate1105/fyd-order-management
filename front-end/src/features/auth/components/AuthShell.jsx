import "../styles/auth.css";
import "../../admin/styles/admin-theme.css";

export default function AuthShell({ children, title, subtitle }) {
  return (
    <div className="authPage">
      <div className="authCard">
        {/* Brand Section */}
        <div className="authBrand">
          <div className="authLogo">FYD</div>
          <div className="authBrandText">
            <div className="name">FYD Admin</div>
            <div className="tagline">Operating System</div>
          </div>
        </div>

        {/* Header */}
        <div className="authHead">
          <div className="h">{title}</div>
          {subtitle && <div className="p">{subtitle}</div>}
        </div>

        {/* Form Content */}
        {children}

        {/* Footer */}
        <div style={{
          marginTop: '32px',
          paddingTop: '24px',
          borderTop: '1px solid var(--admin-border)',
          textAlign: 'center',
          fontSize: '11px',
          color: 'var(--admin-text-muted-2)',
          letterSpacing: '0.5px'
        }}>
          © {new Date().getFullYear()} FYD TEAM. ALL RIGHTS RESERVED.
        </div>
      </div>
    </div>
  );
}
