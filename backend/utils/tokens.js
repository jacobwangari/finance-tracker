const jwt = require('jsonwebtoken');
const crypto = require('crypto');

// Used for email verification & password reset links. The raw token goes in the
// email link; only its hash is stored in the DB, so a leaked database can't be
// used to forge working links (same principle as password hashing).
const generateSecureToken = () => {
  const rawToken = crypto.randomBytes(32).toString('hex');
  const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');
  return { rawToken, tokenHash };
};

const hashToken = (rawToken) =>
  crypto.createHash('sha256').update(rawToken).digest('hex');

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

module.exports = { signAccessToken, signRefreshToken, refreshCookieOptions, generateSecureToken, hashToken };