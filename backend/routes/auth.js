const express = require('express');
const router = express.Router();
const passport = require('passport');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const { ensureAuth } = require('../middleware/auth');
const { signAccessToken, signRefreshToken, refreshCookieOptions } = require('../utils/tokens');

const sanitizeUser = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  avatar: user.avatar
});

// Issues both tokens, stores the refresh token on the user doc, and sets the cookie
const issueTokens = async (res, user) => {
  const accessToken = signAccessToken(user);
  const refreshToken = signRefreshToken(user);

  user.refreshToken = refreshToken;
  await user.save();

  res.cookie('refreshToken', refreshToken, refreshCookieOptions);
  return accessToken;
};

// POST /api/auth/register
router.post('/register', async (req, res) => {
  const { name, email, password, password2 } = req.body;
  let errors = [];

  if (!name || !email || !password || !password2) errors.push('Please fill in all fields');
  if (password !== password2) errors.push('Passwords do not match');
  if (password && password.length < 6) errors.push('Password should be at least 6 characters');

  if (errors.length > 0) return res.status(400).json({ errors });

  try {
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) return res.status(400).json({ errors: ['Email is already registered'] });

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await User.create({ name, email: email.toLowerCase(), password: hashedPassword });

    const accessToken = await issueTokens(res, newUser);
    res.status(201).json({ accessToken, user: sanitizeUser(newUser) });
  } catch (err) {
    res.status(500).json({ errors: [err.message] });
  }
});

// POST /api/auth/login
router.post('/login', (req, res, next) => {
  passport.authenticate('local', { session: false }, async (err, user, info) => {
    if (err) return res.status(500).json({ message: err.message });
    if (!user) return res.status(401).json({ message: info?.message || 'Login failed' });

    const accessToken = await issueTokens(res, user);
    res.json({ accessToken, user: sanitizeUser(user) });
  })(req, res, next);
});

// POST /api/auth/refresh — reads the httpOnly cookie, rotates tokens
router.post('/refresh', async (req, res) => {
  const token = req.cookies?.refreshToken;
  if (!token) return res.status(401).json({ message: 'No refresh token' });

  try {
    const decoded = jwt.verify(token, process.env.REFRESH_TOKEN_SECRET);
    const user = await User.findById(decoded.id).select('+refreshToken');

    // Reject if user doesn't exist, or the token doesn't match what's stored
    // (stored token gets replaced on each login/refresh, so this catches stolen/reused tokens)
    if (!user || user.refreshToken !== token) {
      res.clearCookie('refreshToken', { path: '/api/auth' });
      return res.status(401).json({ message: 'Invalid refresh token' });
    }

    const accessToken = await issueTokens(res, user); // rotate: issue new pair
    res.json({ accessToken, user: sanitizeUser(user) });
  } catch (err) {
    res.clearCookie('refreshToken', { path: '/api/auth' });
    return res.status(401).json({ message: 'Invalid or expired refresh token' });
  }
});

// GET /api/auth/github
router.get('/github', passport.authenticate('github', { session: false, scope: ['user:email'] }));

// GET /api/auth/github/callback
router.get('/github/callback',
  passport.authenticate('github', { session: false, failureRedirect: `${process.env.CLIENT_URL}/login` }),
  async (req, res) => {
    const accessToken = await issueTokens(res, req.user); // sets refresh cookie directly on this response
    // Access token can't be set as an httpOnly cookie the frontend needs to read, so it
    // travels via URL once; refresh cookie is already set and will be used from now on.
    res.redirect(`${process.env.CLIENT_URL}/oauth-callback?token=${accessToken}`);
  }
);

// GET /api/auth/me
router.get('/me', ensureAuth, (req, res) => {
  res.json({ user: sanitizeUser(req.user) });
});

// POST /api/auth/logout
router.post('/logout', async (req, res) => {
  const token = req.cookies?.refreshToken;

  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.REFRESH_TOKEN_SECRET);
      await User.findByIdAndUpdate(decoded.id, { refreshToken: null });
    } catch {
      // token already invalid/expired — nothing to clean up
    }
  }

  res.clearCookie('refreshToken', { path: '/api/auth' });
  res.json({ message: 'Logged out' });
});

module.exports = router;