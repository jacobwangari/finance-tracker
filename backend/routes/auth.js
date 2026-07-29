const express = require('express');
const router = express.Router();
const passport = require('passport');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const { ensureAuth } = require('../middleware/auth');
const {
  signAccessToken,
  signRefreshToken,
  refreshCookieOptions,
  generateSecureToken,
  hashToken
} = require('../utils/tokens');
const { sendVerificationEmail, sendPasswordResetEmail } = require('../utils/email');

const sanitizeUser = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  avatar: user.avatar,
  isVerified: user.isVerified
});

const issueTokens = async (res, user) => {
  const accessToken = signAccessToken(user);
  const refreshToken = signRefreshToken(user);
  user.refreshToken = refreshToken;
  await user.save();
  res.cookie('refreshToken', refreshToken, refreshCookieOptions);
  return accessToken;
};

// ---------------------------------------------------------------------------
// POST /api/auth/register
// Creates an UNVERIFIED account and emails a confirmation link.
// Does NOT log the user in — they must verify first.
// ---------------------------------------------------------------------------
router.post('/register', async (req, res) => {
  const { name, email, password, password2 } = req.body;
  let errors = [];

  if (!name || !email || !password || !password2) errors.push('Please fill in all fields');
  if (password !== password2) errors.push('Passwords do not match');
  if (password && password.length < 6) errors.push('Password should be at least 6 characters');

  if (errors.length > 0) return res.status(400).json({ errors });

  try {
    const existingUser = await User.findOne({ email: email.toLowerCase() });

    if (existingUser) {
      if (existingUser.isVerified) {
        return res.status(400).json({ errors: ['Email is already registered'] });
      }

      const { rawToken, tokenHash } = generateSecureToken();
      existingUser.verificationTokenHash = tokenHash;
      existingUser.verificationTokenExpires = Date.now() + 24 * 60 * 60 * 1000;
      await existingUser.save();

      // Don't let a slow/failed SMTP connection turn into a 500 — the account
      // state is already correct either way, and the user can hit "resend" if needed.
      sendVerificationEmail(existingUser, rawToken).catch(err =>
        console.error('Failed to send verification email:', err.message)
      );

      return res.status(200).json({
        message: 'This email is already registered but unverified. We\'ve sent a new confirmation link.'
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const { rawToken, tokenHash } = generateSecureToken();

    const newUser = await User.create({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      isVerified: false,
      verificationTokenHash: tokenHash,
      verificationTokenExpires: Date.now() + 24 * 60 * 60 * 1000 // 24h
    });

    // Same reasoning: registration succeeds regardless of email deliverability.
    sendVerificationEmail(newUser, rawToken).catch(err =>
      console.error('Failed to send verification email:', err.message)
    );

    res.status(201).json({
      message: 'Account created. Please check your email to confirm your account before logging in.'
    });
  } catch (err) {
    res.status(500).json({ errors: [err.message] });
  }
});

// ---------------------------------------------------------------------------
// GET /api/auth/verify-email?token=...
// ---------------------------------------------------------------------------
router.get('/verify-email', async (req, res) => {
  const { token } = req.query;
  if (!token) return res.status(400).json({ message: 'Missing token' });

  const tokenHash = hashToken(token);

  try {
    const user = await User.findOne({
      verificationTokenHash: tokenHash,
      verificationTokenExpires: { $gt: Date.now() }
    }).select('+verificationTokenHash +verificationTokenExpires');

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired verification link' });
    }

    user.isVerified = true;
    // Intentionally NOT clearing the token/expiry here — leaving it in place
    // (until it naturally expires) makes repeat requests with the same token
    // idempotent instead of erroring on a second click or a duplicate request.
    await user.save();

    res.json({ message: 'Email verified successfully. You can now log in.' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ---------------------------------------------------------------------------
// POST /api/auth/resend-verification
// ---------------------------------------------------------------------------
router.post('/resend-verification', async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ message: 'Email is required' });

  try {
    const user = await User.findOne({ email: email.toLowerCase() });

    // Always return the same generic response — don't reveal whether an email
    // exists in the system (prevents account enumeration).
    const genericResponse = { message: 'If that account exists and is unverified, a new email has been sent.' };

    if (!user || user.isVerified) return res.json(genericResponse);

    const { rawToken, tokenHash } = generateSecureToken();
    user.verificationTokenHash = tokenHash;
    user.verificationTokenExpires = Date.now() + 24 * 60 * 60 * 1000;
    await user.save();

    sendVerificationEmail(user, rawToken).catch(err =>
      console.error('Failed to send verification email:', err.message)
    );
    res.json(genericResponse);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ---------------------------------------------------------------------------
// POST /api/auth/login
// ---------------------------------------------------------------------------
router.post('/login', (req, res, next) => {
  passport.authenticate('local', { session: false }, async (err, user, info) => {
    if (err) return res.status(500).json({ message: err.message });
    if (!user) return res.status(401).json({ message: info?.message || 'Login failed' });

    if (!user.isVerified) {
      return res.status(403).json({
        message: 'Please verify your email before logging in.',
        unverified: true
      });
    }

    const accessToken = await issueTokens(res, user);
    res.json({ accessToken, user: sanitizeUser(user) });
  })(req, res, next);
});

// ---------------------------------------------------------------------------
// POST /api/auth/forgot-password
// ---------------------------------------------------------------------------
router.post('/forgot-password', async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ message: 'Email is required' });

  const genericResponse = { message: 'If that account exists, a password reset email has been sent.' };

  try {
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) return res.json(genericResponse); // don't leak account existence

    const { rawToken, tokenHash } = generateSecureToken();
    user.resetPasswordTokenHash = tokenHash;
    user.resetPasswordExpires = Date.now() + 60 * 60 * 1000; // 1 hour
    await user.save();

    sendPasswordResetEmail(user, rawToken).catch(err =>
      console.error('Failed to send password reset email:', err.message)
    );
    res.json(genericResponse);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ---------------------------------------------------------------------------
// POST /api/auth/reset-password
// ---------------------------------------------------------------------------
router.post('/reset-password', async (req, res) => {
  const { token, password, password2 } = req.body;
  let errors = [];

  if (!token) errors.push('Missing reset token');
  if (!password || !password2) errors.push('Please fill in all fields');
  if (password !== password2) errors.push('Passwords do not match');
  if (password && password.length < 6) errors.push('Password should be at least 6 characters');

  if (errors.length > 0) return res.status(400).json({ errors });

  try {
    const tokenHash = hashToken(token);
    const user = await User.findOne({
      resetPasswordTokenHash: tokenHash,
      resetPasswordExpires: { $gt: Date.now() }
    }).select('+resetPasswordTokenHash +resetPasswordExpires +refreshToken');

    if (!user) return res.status(400).json({ errors: ['Invalid or expired reset link'] });

    user.password = await bcrypt.hash(password, 10);
    user.resetPasswordTokenHash = undefined;
    user.resetPasswordExpires = undefined;
    user.refreshToken = null; // invalidate any existing session — force re-login everywhere
    await user.save();

    res.clearCookie('refreshToken', { path: '/api/auth' });
    res.json({ message: 'Password reset successfully. Please log in with your new password.' });
  } catch (err) {
    res.status(500).json({ errors: [err.message] });
  }
});

// ---------------------------------------------------------------------------
// POST /api/auth/refresh
// ---------------------------------------------------------------------------
router.post('/refresh', async (req, res) => {
  const token = req.cookies?.refreshToken;
  if (!token) return res.status(401).json({ message: 'No refresh token' });

  try {
    const decoded = jwt.verify(token, process.env.REFRESH_TOKEN_SECRET);
    const user = await User.findById(decoded.id).select('+refreshToken');

    if (!user || user.refreshToken !== token) {
      res.clearCookie('refreshToken', { path: '/api/auth' });
      return res.status(401).json({ message: 'Invalid refresh token' });
    }

    const accessToken = await issueTokens(res, user);
    res.json({ accessToken, user: sanitizeUser(user) });
  } catch (err) {
    res.clearCookie('refreshToken', { path: '/api/auth' });
    return res.status(401).json({ message: 'Invalid or expired refresh token' });
  }
});

// ---------------------------------------------------------------------------
// GitHub OAuth — GitHub already verifies emails, so these accounts skip the
// email confirmation step entirely.
// ---------------------------------------------------------------------------
router.get('/github', passport.authenticate('github', { session: false, scope: ['user:email'] }));

router.get('/github/callback',
  passport.authenticate('github', { session: false, failureRedirect: `${process.env.CLIENT_URL}/login` }),
  async (req, res) => {
    if (!req.user.isVerified) {
      req.user.isVerified = true;
      await req.user.save();
    }
    const accessToken = await issueTokens(res, req.user);
    res.redirect(`${process.env.CLIENT_URL}/oauth-callback?token=${accessToken}`);
  }
);

// ---------------------------------------------------------------------------
// GET /api/auth/me
// ---------------------------------------------------------------------------
router.get('/me', ensureAuth, (req, res) => {
  res.json({ user: sanitizeUser(req.user) });
});

// ---------------------------------------------------------------------------
// POST /api/auth/logout
// ---------------------------------------------------------------------------
router.post('/logout', async (req, res) => {
  const token = req.cookies?.refreshToken;

  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.REFRESH_TOKEN_SECRET);
      await User.findByIdAndUpdate(decoded.id, { refreshToken: null });
    } catch {
      // already invalid/expired — nothing to clean up
    }
  }

  res.clearCookie('refreshToken', { path: '/api/auth' });
  res.json({ message: 'Logged out' });
});

module.exports = router;