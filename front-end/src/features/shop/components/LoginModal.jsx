/* global FB */
import { useState } from "react";
import { useGoogleLogin } from "@react-oauth/google";
import { customerAuthAPI } from "@shared/utils/customerAuthApi.js";
import { setCustomerSession } from "@shared/utils/customerSession.js";

export default function LoginModal({ isOpen, onClose, onLoginSuccess }) {
  const [mode, setMode] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [remember, setRemember] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Google OAuth
  const googleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setLoading(true);
      setError('');
      try {
        const response = await customerAuthAPI.googleLogin(tokenResponse.access_token);
        if (response.success && response.token) {
          setCustomerSession(response.token, response.customer, true);
          onLoginSuccess(response.customer);
          onClose();
          resetForm();
        } else {
          setError(response.message || 'Đăng nhập Google thất bại');
        }
      } catch {
        setError('Không thể kết nối server');
      } finally {
        setLoading(false);
      }
    },
    onError: () => setError('Đăng nhập Google thất bại'),
  });

  // Facebook OAuth
  const handleFacebookLogin = () => {
    if (typeof FB === 'undefined') {
      setError('Facebook SDK chưa được tải. Vui lòng refresh trang và thử lại.');
      return;
    }

    setLoading(true);
    setError('');

    FB.login(function (response) {
      if (response.authResponse) {
        const accessToken = response.authResponse.accessToken;

        customerAuthAPI.facebookLogin(accessToken)
          .then(function (apiResponse) {
            if (apiResponse.success && apiResponse.token) {
              setCustomerSession(apiResponse.token, apiResponse.customer, true);
              onLoginSuccess(apiResponse.customer);
              onClose();
              resetForm();
            } else {
              setError(apiResponse.message || 'Đăng nhập Facebook thất bại');
            }
            setLoading(false);
          })
          .catch(function () {
            setError('Không thể kết nối server');
            setLoading(false);
          });
      } else {
        setError('Đăng nhập Facebook bị hủy');
        setLoading(false);
      }
    }, { scope: 'email,public_profile' });
  };

  if (!isOpen) return null;

  const resetForm = () => {
    setEmail('');
    setPassword('');
    setFullName('');
    setConfirmPassword('');
    setError('');
    setShowPassword(false);
    setShowConfirmPassword(false);
  };

  const switchMode = (newMode) => {
    setMode(newMode);
    resetForm();
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Vui lòng nhập email và mật khẩu');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await customerAuthAPI.login(email, password);
      if (response.success && response.token) {
        setCustomerSession(response.token, response.customer, remember);
        onLoginSuccess(response.customer);
        onClose();
        resetForm();
      } else {
        setError(response.message || 'Đăng nhập thất bại');
      }
    } catch {
      setError('Không thể kết nối server');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!fullName || !email || !password) {
      setError('Vui lòng điền đầy đủ thông tin');
      return;
    }
    if (password !== confirmPassword) {
      setError('Mật khẩu xác nhận không khớp');
      return;
    }
    if (password.length < 8) {
      setError('Mật khẩu phải có ít nhất 8 ký tự');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await customerAuthAPI.register({ fullName, email, password });
      if (response.success) {
        setError('');
        switchMode('login');
        setEmail(email);
        alert(response.message || 'Đăng ký thành công! Vui lòng đăng nhập.');
      } else {
        setError(response.message || 'Đăng ký thất bại');
      }
    } catch {
      setError('Không thể kết nối server');
    } finally {
      setLoading(false);
    }
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <>
      <div className="login-modal-backdrop" onClick={handleBackdropClick} />
      <div className="login-modal">
        <button className="login-modal-close" onClick={onClose} aria-label="Đóng">×</button>

        <div className="login-modal-content">
          <div className="login-modal-header">
            <h2>{mode === 'login' ? 'ĐĂNG NHẬP' : 'TẠO TÀI KHOẢN'}</h2>
            <p>{mode === 'login'
              ? 'Đăng nhập để mua sắm và theo dõi đơn hàng'
              : 'Tạo tài khoản để nhận ưu đãi độc quyền'}
            </p>
          </div>

          {error && <div className="login-modal-error">{error}</div>}

          <form onSubmit={mode === 'login' ? handleLogin : handleRegister}>
            {mode === 'register' && (
              <div className="login-modal-field">
                <input
                  type="text"
                  placeholder="Họ và tên"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  disabled={loading}
                  required
                />
              </div>
            )}

            <div className="login-modal-field">
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                required
              />
            </div>

            <div className="login-modal-field">
              <div className="login-modal-password">
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Mật khẩu"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                  required
                />
                <button
                  type="button"
                  className="password-toggle-btn"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={loading}
                  aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                >
                  {showPassword ? (
                    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                      <line x1="1" y1="1" x2="23" y2="23" />
                    </svg>
                  ) : (
                    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {mode === 'register' && (
              <div className="login-modal-field">
                <div className="login-modal-password">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="Xác nhận mật khẩu"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    disabled={loading}
                    required
                  />
                  <button
                    type="button"
                    className="password-toggle-btn"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    disabled={loading}
                    aria-label={showConfirmPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                  >
                    {showConfirmPassword ? (
                      <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                        <line x1="1" y1="1" x2="23" y2="23" />
                      </svg>
                    ) : (
                      <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                        <circle cx="12" cy="12" r="3" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>
            )}

            {mode === 'login' && (
              <div className="login-modal-remember">
                <label>
                  <input
                    type="checkbox"
                    checked={remember}
                    onChange={(e) => setRemember(e.target.checked)}
                  />
                  <span>Ghi nhớ đăng nhập</span>
                </label>
              </div>
            )}

            <button
              type="submit"
              className="login-modal-submit"
              disabled={loading}
            >
              {loading ? 'Đang xử lý...' : (mode === 'login' ? 'ĐĂNG NHẬP' : 'TẠO TÀI KHOẢN')}
            </button>
          </form>

          <div className="login-modal-divider">
            <span>hoặc</span>
          </div>

          <div className="login-modal-oauth">
            <button
              type="button"
              className="oauth-btn google"
              onClick={() => googleLogin()}
              disabled={loading}
            >
              <svg viewBox="0 0 24 24" width="20" height="20">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
              </svg>
              <span>Đăng nhập với Google</span>
            </button>

            <button
              type="button"
              className="oauth-btn facebook"
              onClick={handleFacebookLogin}
              disabled={loading}
            >
              <svg viewBox="0 0 24 24" width="20" height="20">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" fill="#1877F2" />
              </svg>
              <span>Đăng nhập với Facebook</span>
            </button>
          </div>

          <div className="login-modal-switch">
            {mode === 'login' ? (
              <p>
                Chưa có tài khoản?{' '}
                <button type="button" onClick={() => switchMode('register')}>
                  Đăng ký ngay
                </button>
              </p>
            ) : (
              <p>
                Đã có tài khoản?{' '}
                <button type="button" onClick={() => switchMode('login')}>
                  Đăng nhập
                </button>
              </p>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
