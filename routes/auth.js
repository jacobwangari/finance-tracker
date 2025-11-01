const express = require('express');
const router = express.Router();
const passport = require('passport');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const { ensureGuest } = require('../middleware/auth');

// Login page
router.get('/login', ensureGuest, (req, res) => {
  res.render('login', {
    title: 'Login',
    messages: req.flash()
  });
});

// Register page
router.get('/register', ensureGuest, (req, res) => {
  res.render('register', {
    title: 'Register',
    messages: req.flash()
  });
});

// Register handle
router.post('/register', async (req, res) => {
  const { name, email, password, password2 } = req.body;
  let errors = [];

  // Check required fields
  if (!name || !email || !password || !password2) {
    errors.push({ msg: 'Please fill in all fields' });
  }

  // Check passwords match
  if (password !== password2) {
    errors.push({ msg: 'Passwords do not match' });
  }

  // Check password length
  if (password.length < 6) {
    errors.push({ msg: 'Password should be at least 6 characters' });
  }

  if (errors.length > 0) {
    res.render('register', {
      title: 'Register',
      errors,
      name,
      email
    });
  } else {
    try {
      const existingUser = await User.findOne({ email: email.toLowerCase() });

      if (existingUser) {
        errors.push({ msg: 'Email is already registered' });
        res.render('register', {
          title: 'Register',
          errors,
          name,
          email
        });
      } else {
        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = new User({
          name,
          email: email.toLowerCase(),
          password: hashedPassword
        });

        await newUser.save();
        req.flash('success', 'You are now registered and can log in');
        res.redirect('/auth/login');
      }
    } catch (err) {
      console.error(err);
      res.render('error', { error: err });
    }
  }
});

// Login handle
router.post('/login', (req, res, next) => {
  passport.authenticate('local', {
    successRedirect: '/dashboard',
    failureRedirect: '/auth/login',
    failureFlash: true
  })(req, res, next);
});

// GitHub OAuth
router.get('/github', passport.authenticate('github', { scope: ['user:email'] }));

router.get('/github/callback',
  passport.authenticate('github', { failureRedirect: '/auth/login' }),
  (req, res) => {
    res.redirect('/dashboard');
  }
);

// Logout
router.get('/logout', (req, res) => {
  req.logout((err) => {
    if (err) {
      console.error(err);
    }
    req.flash('success', 'You are logged out');
    res.redirect('/');
  });
});

module.exports = router;