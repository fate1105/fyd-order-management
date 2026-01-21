const KEY = "fyd_token";

export function getSession() {
  return localStorage.getItem(KEY) || sessionStorage.getItem(KEY);
}

export function isLoggedIn() {
  return !!getSession();
}

export function logout() {
  localStorage.removeItem(KEY);
  sessionStorage.removeItem(KEY);
}
