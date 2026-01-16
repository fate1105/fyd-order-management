const KEY = "fyd_session";

export function getSession() {
  try {
    return JSON.parse(localStorage.getItem(KEY));
  } catch {
    return null;
  }
}

export function isLoggedIn() {
  return !!getSession();
}

export function logout() {
  localStorage.removeItem(KEY);
}
