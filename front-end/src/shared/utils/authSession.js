const TOKEN_KEY = "fyd_token";
const PERMS_KEY = "fyd_permissions";

export function saveSession(token, permissions) {
  localStorage.setItem(TOKEN_KEY, token);
  if (permissions) {
    localStorage.setItem(PERMS_KEY, JSON.stringify(permissions));
  }
}

export function getSession() {
  return localStorage.getItem(TOKEN_KEY) || sessionStorage.getItem(TOKEN_KEY);
}

export function getPermissions() {
  const perms = localStorage.getItem(PERMS_KEY);
  try {
    return perms ? JSON.parse(perms) : [];
  } catch (e) {
    return [];
  }
}

export function hasPermission(permission) {
  const perms = getPermissions();
  return perms.includes(permission);
}

export function isLoggedIn() {
  return !!getSession();
}

export function logout() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(PERMS_KEY);
  sessionStorage.removeItem(TOKEN_KEY);
}
