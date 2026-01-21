// Mock authentication utilities
let failCount = 0;
let lockUntil = 0;

export function clearFail() {
  failCount = 0;
  lockUntil = 0;
}

export function isLocked() {
  if (Date.now() < lockUntil) {
    return Math.ceil((lockUntil - Date.now()) / 1000);
  }
  return 0;
}

export function recordFail() {
  failCount++;
  if (failCount >= 3) {
    lockUntil = Date.now() + 30000; // 30 seconds
    return true;
  }
  return false;
}

export function loginCheck(username, password) {
  // Mock login - accept any credentials for demo
  return username && password;
}

export function startOtpSession(phone) {
  // Mock OTP - just return success
  return { success: true, phone };
}

export function registerUser(data) {
  // Mock registration
  return { success: true, user: data };
}

export function verifyOtp(phone, code) {
  // Mock OTP verification - accept any code
  return { success: true };
}
