import { useState } from 'react';

/**
 * PasswordField component with visibility toggle
 */
export default function PasswordField({
  value,
  onChange,
  placeholder = '••••••••',
  showStrength = false,
  name,
  id,
  autoComplete = 'current-password',
  className = '',
  disabled = false,
}) {
  const [showPassword, setShowPassword] = useState(false);

  const handleToggleVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  const handleChange = (e) => {
    onChange(e.target.value);
  };

  return (
    <div className="password-field">
      <div className="aInputRow">
        <input
          className={`aInput ${className}`}
          type={showPassword ? 'text' : 'password'}
          value={value}
          onChange={handleChange}
          placeholder={placeholder}
          name={name}
          id={id}
          autoComplete={autoComplete}
          disabled={disabled}
          aria-label={placeholder || 'Password'}
        />
        <button
          className="aBtnIcon password-toggle"
          type="button"
          onClick={handleToggleVisibility}
          aria-label={showPassword ? 'Hide password' : 'Show password'}
          disabled={disabled}
        >
          {showPassword ? '🙈' : '👁️'}
        </button>
      </div>
      {showStrength && value && (
        <PasswordStrengthIndicator password={value} />
      )}
    </div>
  );
}

function PasswordStrengthIndicator({ password }) {
  const strength = calculatePasswordStrength(password);
  const strengthLabels = ['Rất yếu', 'Yếu', 'Trung bình', 'Khá', 'Mạnh'];
  const strengthColors = [
    'rgba(255, 107, 122, 0.7)',
    'rgba(255, 180, 100, 0.7)',
    'rgba(255, 211, 110, 0.7)',
    'rgba(150, 230, 180, 0.7)',
    'rgba(75, 240, 200, 0.7)',
  ];

  const percentage = (strength / 5) * 100;

  return (
    <div className="strength" style={{ marginTop: '8px' }}>
      <div className="strBar">
        <div
          className="strFill"
          style={{
            width: `${percentage}%`,
            background: strengthColors[strength - 1] || strengthColors[0],
          }}
        />
      </div>
      <span className="strTxt">{strengthLabels[strength - 1] || 'Rất yếu'}</span>
    </div>
  );
}

export function calculatePasswordStrength(password) {
  if (!password) return 0;

  let score = 0;
  if (password.length >= 8) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[a-z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) score++;

  return score;
}

export function isPasswordStrong(password) {
  if (!password || password.length < 8) return false;
  if (!/[A-Z]/.test(password)) return false;
  if (!/[a-z]/.test(password)) return false;
  if (!/[0-9]/.test(password)) return false;
  return true;
}
