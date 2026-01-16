import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import CustomerAuthShell from "../components/CustomerAuthShell.jsx";
import PasswordField from "../components/auth/PasswordField.jsx";
import PasswordStrength, { isPasswordStrong } from "../components/auth/PasswordStrength.jsx";
import OAuthButtons from "../components/auth/OAuthButtons.jsx";
import { customerAuthAPI } from "../../js/customerAuthApi.js";
import { setCustomerSession, isCustomerLoggedIn } from "../../js/customerSession.js";
import "../../css/customer-auth.css";

/**
 * CustomerRegister - Customer registration page
 * Validates: Requirements 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7, 3.8
 */
export default function CustomerRegister() {
  const nav = useNavigate();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  // Redirect if already logged in
  useEffect(() => {
    if (isCustomerLoggedIn()) nav("/shop");
  }, [nav]);

  /**
   * Validate email format
   */
  const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  /**
   * Validate form
   * Validates: Requirements 3.2, 3.8
   */
  const validateForm = () => {
    if (!fullName.trim()) {
      setErr("Vui lòng nhập họ tên.");
      return false;
    }
    if (fullName.trim().length < 2) {
      setErr("Họ tên phải có ít nhất 2 ký tự.");
      return false;
    }
    if (!email.trim()) {
      setErr("Vui lòng nhập email.");
      return false;
    }
    if (!isValidEmail(email)) {
      setErr("Email không hợp lệ.");
      return false;
    }
    if (!password) {
      setErr("Vui lòng nhập mật khẩu.");
      return false;
    }
    if (!isPasswordStrong(password)) {
      setErr("Mật khẩu phải có ít nhất 8 ký tự, bao gồm chữ hoa, chữ thường và số.");
      return false;
    }
    if (password !== confirmPassword) {
      setErr("Mật khẩu xác nhận không khớp.");
      return false;
    }
    return true;
  };

  /**
   * Handle form submission
   * Validates: Requirements 3.3, 3.4
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErr("");

    if (!validateForm()) return;

    setLoading(true);
    try {
      const result = await customerAuthAPI.register({
        fullName: fullName.trim(),
        email: email.trim(),
        password,
      });

      if (result.success) {
        // Auto login after registration
        setCustomerSession(result.token, result.customer, false);
        nav("/shop");
      } else {
        // Validates: Requirements 3.7
        setErr(result.message || "Đăng ký thất bại. Vui lòng thử lại.");
      }
    } catch (e2) {
      setErr("Không thể kết nối server. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handle Google OAuth registration
   */
  const handleGoogleLogin = async () => {
    setErr("");
    setLoading(true);
    try {
      const result = await customerAuthAPI.googleLogin("google_oauth_token");
      if (result.success) {
        setCustomerSession(result.token, result.customer, true);
        nav("/shop");
      } else {
        setErr(result.message || "Đăng ký với Google thất bại.");
      }
    } catch (e2) {
      setErr("Không thể kết nối Google. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handle Facebook OAuth registration
   */
  const handleFacebookLogin = async () => {
    setErr("");
    setLoading(true);
    try {
      const result = await customerAuthAPI.facebookLogin("facebook_oauth_token");
      if (result.success) {
        setCustomerSession(result.token, result.customer, true);
        nav("/shop");
      } else {
        setErr(result.message || "Đăng ký với Facebook thất bại.");
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
        <h1 className="customer-auth-title">Đăng ký</h1>
        <p className="customer-auth-subtitle">
          Tạo tài khoản để bắt đầu mua sắm và nhận ưu đãi.
        </p>

        {err && <div className="customer-auth-error">{err}</div>}

        <form onSubmit={handleSubmit}>
          <label className="customer-auth-field">
            <span>Họ tên</span>
            <input
              className="customer-auth-input"
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Nguyễn Văn A"
              autoComplete="name"
              disabled={loading}
            />
          </label>

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
              placeholder="Tối thiểu 8 ký tự"
              autoComplete="new-password"
              disabled={loading}
            />
            <PasswordStrength password={password} />
          </label>

          <label className="customer-auth-field">
            <span>Xác nhận mật khẩu</span>
            <PasswordField
              value={confirmPassword}
              onChange={setConfirmPassword}
              placeholder="Nhập lại mật khẩu"
              autoComplete="new-password"
              disabled={loading}
            />
          </label>

          <button
            className="customer-auth-btn-primary"
            type="submit"
            disabled={loading}
          >
            {loading ? "Đang đăng ký..." : "Đăng ký"}
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
          Đã có tài khoản?{" "}
          <Link to="/customer/login" className="customer-auth-link">
            Đăng nhập
          </Link>
        </p>
      </div>
    </CustomerAuthShell>
  );
}
