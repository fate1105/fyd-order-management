/**
 * PasswordStrength component - Standalone password strength indicator
 */
export default function PasswordStrength({ password, className = '' }) {
  const strength = calculatePasswordStrength(password);
  
  const strengthLabels = ['Rất yếu', 'Yếu', 'Trung bình', 'Khá', 'Mạnh'];
  const strengthColors = [
    'rgba(255, 107, 122, 0.7)',
    'rgba(255, 180, 100, 0.7)',
    'rgba(255, 211, 110, 0.7)',
    'rgba(150, 230, 180, 0.7)',
    'rgba(75, 240, 200, 0.7)',
  ];

  if (!password) {
    return null;
  }

  const percentage = (strength / 5) * 100;
  const label = strength > 0 ? strengthLabels[strength - 1] : strengthLabels[0];
  const color = strength > 0 ? strengthColors[strength - 1] : strengthColors[0];

  return (
    <div className={`strength ${className}`} style={{ marginTop: '8px' }}>
      <div className="strBar">
        <div
          className="strFill"
          style={{
            width: `${percentage}%`,
            background: color,
          }}
        />
      </div>
      <span className="strTxt">{label}</span>
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

export function getPasswordStrengthDetails(password) {
  if (!password) {
    return {
      hasMinLength: false,
      hasUppercase: false,
      hasLowercase: false,
      hasNumber: false,
      hasSpecialChar: false,
      score: 0,
      isStrong: false,
    };
  }

  const hasMinLength = password.length >= 8;
  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);

  const score = [hasMinLength, hasUppercase, hasLowercase, hasNumber, hasSpecialChar]
    .filter(Boolean).length;

  const isStrong = hasMinLength && hasUppercase && hasLowercase && hasNumber;

  return {
    hasMinLength,
    hasUppercase,
    hasLowercase,
    hasNumber,
    hasSpecialChar,
    score,
    isStrong,
  };
}
