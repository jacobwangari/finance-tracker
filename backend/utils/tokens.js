const jwt = require('jsonwebtoken');

const signAccessToken = (user) =>
  jwt.sign({ id: user._id }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '15m' });

const signRefreshToken = (user) =>
  jwt.sign({ id: user._id }, process.env.REFRESH_TOKEN_SECRET, { expiresIn: '7d' });

// Cookie options — SameSite=None+Secure is required for cross-domain deploys (e.g.
// frontend on Vercel, backend on Render) but breaks on plain-HTTP localhost, so we
// switch based on environment.
const refreshCookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  path: '/api/auth' // only sent to auth routes, not every request
};

module.exports = { signAccessToken, signRefreshToken, refreshCookieOptions };