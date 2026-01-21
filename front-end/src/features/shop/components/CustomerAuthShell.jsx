import { Link } from "react-router-dom";
import "../../auth/styles/customer-auth.css";

/**
 * CustomerAuthShell - Layout wrapper for customer authentication pages
 */
export default function CustomerAuthShell({ children }) {
  return (
    <div className="customer-auth-page">
      <div className="customer-auth-container">
        {/* Left side - Branding */}
        <div className="customer-auth-brand">
          <Link to="/shop" className="customer-auth-logo">
            <span className="logo-text">FYD</span>
            <span className="logo-tagline">Fashion Your Day</span>
          </Link>
          
          <div className="customer-auth-hero">
            <h2>Khám phá phong cách của bạn</h2>
            <p>
              Đăng nhập để trải nghiệm mua sắm cá nhân hóa, 
              theo dõi đơn hàng và nhận ưu đãi độc quyền.
            </p>
            <div className="customer-auth-features">
              <div className="feature-item">
                <span className="feature-icon">🚚</span>
                <span>Miễn phí vận chuyển</span>
              </div>
              <div className="feature-item">
                <span className="feature-icon">🔄</span>
                <span>Đổi trả dễ dàng</span>
              </div>
              <div className="feature-item">
                <span className="feature-icon">💎</span>
                <span>Tích điểm thưởng</span>
              </div>
            </div>
          </div>

          <CustomerAuthArt />
        </div>

        {/* Right side - Form */}
        <div className="customer-auth-content">
          {children}
        </div>
      </div>
    </div>
  );
}

function CustomerAuthArt() {
  return (
    <svg className="customer-auth-art" viewBox="0 0 400 200" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path 
        d="M20 150C80 80 140 120 200 90C260 60 320 30 380 50" 
        stroke="rgba(255,107,122,0.4)" 
        strokeWidth="2" 
      />
      <path 
        d="M20 130C100 60 160 100 220 70C280 40 340 20 380 40" 
        stroke="rgba(110,168,255,0.4)" 
        strokeWidth="2" 
      />
      <circle cx="100" cy="110" r="12" fill="rgba(255,107,122,0.2)" stroke="rgba(255,107,122,0.4)" />
      <circle cx="220" cy="80" r="14" fill="rgba(110,168,255,0.2)" stroke="rgba(110,168,255,0.4)" />
      <circle cx="320" cy="45" r="10" fill="rgba(75,240,200,0.2)" stroke="rgba(75,240,200,0.4)" />
    </svg>
  );
}
