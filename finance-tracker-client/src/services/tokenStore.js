// Holds the access token in memory only — never localStorage, never a JS-readable cookie.
// It's intentionally lost on full page reload; App bootstraps a fresh one via /auth/refresh
// (the httpOnly refresh cookie survives reloads and browser restarts).
let accessToken = null;

export const getAccessToken = () => accessToken;
export const setAccessToken = (token) => { accessToken = token; };
export const clearAccessToken = () => { accessToken = null; };