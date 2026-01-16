import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import CustomerAuthShell from "../components/CustomerAuthShell.jsx";
import PasswordField from "../components/auth/PasswordField.jsx";
import OAuthButtons from "../components/auth/OAuthButtons.jsx";
import { customerAuthAPI } from "../../js/customerAuthApi.js";
import { setCustomerSession, isCustomerLoggedIn } from "../../js/customerSession.js";
import "../../css/customer-auth.css";

/**
 * CustomerLogin - Customer login page
 * Validates: Requirements 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 2.1, 2.2
 */
export default function CustomerLogin() {
  const nav = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  // Redirect if already logged in
  useEffect(() => {
    if (isCustomerLoggedIn()) nav("/shop");
  }, [nav]);

  /**
   * Validate email format
   * Validates: Requirements 1.6
   */
  const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  /**
   * Handle form submission
   * Validates: Requirements 1.2, 1.3, 1.4
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErr("");

    // Validate email format
    if (!email.trim()) {
      setErr("Vui lòng nhập email.");
      return;
    }
    if (!isValidEmail(email)) {
      setErr("Email không hợp lệ.");
      return;
    }
    if (!password) {
      setErr("Vui lòng nhập mật khẩu.");
      return;
    }

    setLoading(true);
    try {
      const result = await customerAuthAPI.login(email, password);

      if (result.success) {
        setCustomerSession(result.token, result.customer, remember);
        nav("/shop");
      } else {
        // Validates: Requirements 1.3
        setErr(result.message || "Email hoặc mật khẩu không đúng.");
      }
    } catch (e2) {
      setErr("Không thể kết nối server. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handle Google OAuth login
   * Validates: Requirements 2.1
   */
  const handleGoogleLogin = async () => {
    setErr("");
    setLoading(true);
    try {
      // In production, this would initiate Google OAuth flow
      // For now, simulate with a placeholder token
      const result = await customerAuthAPI.googleLogin("google_oauth_token");
      if (result.success) {
        setCustomerSession(result.token, result.customer, true);
        nav("/shop");
      } else {
        setErr(result.message || "Đăng nhập Google thất bại.");
      }
    } catch (e2) {
      setErr("Không thể kết nối Google. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handle Facebook OAuth login
   * Validates: Requirements 2.2
   */
  const handleFacebookLogin = async () => {
    setErr("");
    setLoading(true);
    try {
      // In production, this would initiate Facebook OAuth flow
      const result = await customerAuthAPI.facebookLogin("facebook_oauth_token");
      if (result.success) {
        setCustomerSession(result.token, result.customer, true);
        nav("/shop");
      } else {
        setErr(result.message || "Đăng nhập Facebook thất bại.");
      }
    } catch (e2) {
      setErr("Không thể kết nối Facebook. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <CustomerAuthShell>
      <div className="customer-auth-form">
        <h1 className="customer-auth-title">Đăng nhập</h1>
        <p className="customer-auth-subtitle">
          Chào mừng bạn quay lại! Đăng nhập để tiếp tục mua sắm.
        </p>

        {err && <div className="customer-auth-error">{err}</div>}

        <form onSubmit={handleSubmit}>
          <label className="customer-auth-field">
            <span>Email</span>
            <input
              className="customer-auth-input"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="email@example.com"
              autoComplete="email"
              disabled={loading}
            />
          </label>

          <label className="customer-auth-field">
            <span>Mật khẩu</span>
            <PasswordField
              value={password}
              onChange={setPassword}
              placeholder="Nhập mật khẩu"
              autoComplete="current-password"
              disabled={loading}
            />
          </label>

          <div className="customer-auth-options">
            <label className="customer-auth-checkbox">
              <input
                type="checkbox"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
                disabled={loading}
              />
              <span>Ghi nhớ đăng nhập</span>
            </label>
            <Link to="/customer/forgot-password" className="customer-auth-link">
              Quên mật khẩu?
            </Link>
          </div>

          <button
            className="customer-auth-btn-primary"
            type="submit"
            disabled={loading}
          >
            {loading ? "Đang đăng nhập..." : "Đăng nhập"}
          </button>
        </form>

        <div className="customer-auth-divider">
          <span>hoặc</span>
        </div>

        <OAuthButtons
          onGoogleClick={handleGoogleLogin}
          onFacebookClick={handleFacebookLogin}
          loading={loading}
        />

        <p className="customer-auth-footer">
          Chưa có tài khoản?{" "}
          <Link to="/customer/register" className="customer-auth-link">
            Đăng ký ngay
          </Link>
        </p>
      </div>
    </CustomerAuthShell>
  );
}
