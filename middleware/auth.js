module.exports = {
  ensureAuth: function(req, res, next) {
    if (req.isAuthenticated()) {
      return next();
    }
    req.flash('error', 'Please log in to view this page');
    res.redirect('/auth/login');
  },
  ensureGuest: function(req, res, next) {
    if (req.isAuthenticated()) {
      res.redirect('/dashboard');
    } else {
      return next();
    }
  }
};