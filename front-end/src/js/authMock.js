const LS_USERS = "fyd_users";
const LS_LOCK = "fyd_login_lock";
const LS_OTP = "fyd_otp_pending";

function getUsers() {
  try { return JSON.parse(localStorage.getItem(LS_USERS) || "[]"); } catch { return []; }
}
function setUsers(users) {
  localStorage.setItem(LS_USERS, JSON.stringify(users));
}

export function registerUser({ name, email, password }) {
  const users = getUsers();
  const exists = users.some(u => u.email.toLowerCase() === email.toLowerCase());
  if (exists) throw new Error("Email đã tồn tại.");
  // Demo only: lưu plain. Backend thật phải hash + salt.
  users.push({ id: cryptoRandomId(), name, email, password, createdAt: Date.now() });
  setUsers(users);
  return true;
}

export function loginCheck({ email, password }) {
  const users = getUsers();
  const u = users.find(x => x.email.toLowerCase() === email.toLowerCase());
  if (!u) throw new Error("Tài khoản không tồn tại.");
  if (u.password !== password) throw new Error("Sai mật khẩu.");
  return { id: u.id, name: u.name, email: u.email };
}

// ---- lockout (anti brute force) ----
export function getLockState() {
  try { return JSON.parse(localStorage.getItem(LS_LOCK) || "{}"); } catch { return {}; }
}
export function recordFail(email) {
  const key = email.toLowerCase();
  const lock = getLockState();
  const cur = lock[key] || { fails: 0, until: 0 };
  const now = Date.now();

  let fails = cur.fails + 1;
  // cooldown tăng dần: 5s, 15s, 60s
  let cooldown = fails >= 6 ? 60000 : fails >= 4 ? 15000 : 5000;

  lock[key] = { fails, until: now + cooldown };
  localStorage.setItem(LS_LOCK, JSON.stringify(lock));
  return lock[key];
}
export function clearFail(email) {
  const key = email.toLowerCase();
  const lock = getLockState();
  delete lock[key];
  localStorage.setItem(LS_LOCK, JSON.stringify(lock));
}
export function isLocked(email) {
  const key = email.toLowerCase();
  const lock = getLockState();
  const cur = lock[key];
  if (!cur) return { locked: false, seconds: 0 };
  const now = Date.now();
  if (cur.until > now) return { locked: true, seconds: Math.ceil((cur.until - now) / 1000) };
  return { locked: false, seconds: 0 };
}

// ---- OTP (demo) ----
export function startOtpSession(email) {
  const otp = String(Math.floor(100000 + Math.random() * 900000));
  const payload = { email: email.toLowerCase(), otp, expiresAt: Date.now() + 2 * 60 * 1000 }; // 2 phút
  localStorage.setItem(LS_OTP, JSON.stringify(payload));
  return otp; // demo: trả otp để bạn show UI
}
export function verifyOtp(email, otpInput) {
  let payload;
  try { payload = JSON.parse(localStorage.getItem(LS_OTP) || "null"); } catch { payload = null; }
  if (!payload) throw new Error("Không có OTP đang chờ.");
  if (payload.email !== email.toLowerCase()) throw new Error("OTP không khớp tài khoản.");
  if (Date.now() > payload.expiresAt) throw new Error("OTP đã hết hạn.");
  if (String(otpInput).trim() !== payload.otp) throw new Error("OTP không đúng.");
  localStorage.removeItem(LS_OTP);
  return true;
}

function cryptoRandomId() {
  try {
    const arr = new Uint8Array(8);
    crypto.getRandomValues(arr);
    return Array.from(arr).map(b => b.toString(16).padStart(2, "0")).join("");
  } catch {
    return String(Math.random()).slice(2);
  }
}
