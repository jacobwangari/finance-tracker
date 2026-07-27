const LocalStrategy = require('passport-local').Strategy;
const GitHubStrategy = require('passport-github2').Strategy;
const bcrypt = require('bcryptjs');
const User = require('../models/User');

module.exports = function (passport) {
  // Local Strategy — used only to verify credentials during /login, no session
  passport.use(
    new LocalStrategy({ usernameField: 'email', session: false }, async (email, password, done) => {
      try {
        const user = await User.findOne({ email: email.toLowerCase() });
        if (!user) return done(null, false, { message: 'Email not registered' });

        const isMatch = await bcrypt.compare(password, user.password);
        if (isMatch) return done(null, user);
        return done(null, false, { message: 'Incorrect password' });
      } catch (err) {
        return done(err);
      }
    })
  );

  // GitHub Strategy — no session, we issue our own JWT in the callback route
  passport.use(
    new GitHubStrategy(
      {
        clientID: process.env.GITHUB_CLIENT_ID,
        clientSecret: process.env.GITHUB_CLIENT_SECRET,
        callbackURL: process.env.GITHUB_CALLBACK_URL
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          let user = await User.findOne({ githubId: profile.id });

          if (!user) {
            user = await User.create({
              githubId: profile.id,
              name: profile.displayName || profile.username,
              email: profile.emails && profile.emails[0] ? profile.emails[0].value : null,
              avatar: profile.photos && profile.photos[0] ? profile.photos[0].value : null
            });
          }

          return done(null, user);
        } catch (err) {
          return done(err);
        }
      }
    )
  );


};