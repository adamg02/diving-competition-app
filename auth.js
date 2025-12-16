const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const FacebookStrategy = require('passport-facebook').Strategy;
const MicrosoftStrategy = require('passport-microsoft').Strategy;
const config = require('./config');
const db = require('./database');

// Serialize user for session
passport.serializeUser((user, done) => {
  done(null, user.id);
});

// Deserialize user from session
passport.deserializeUser((id, done) => {
  db.get('SELECT * FROM users WHERE id = ?', [id], (err, user) => {
    done(err, user);
  });
});

// Google OAuth Strategy
passport.use(new GoogleStrategy({
    clientID: config.google.clientID,
    clientSecret: config.google.clientSecret,
    callbackURL: config.google.callbackURL
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      console.log('Google OAuth callback - Profile ID:', profile.id);
      // Check if user exists
      db.get(
        'SELECT * FROM users WHERE provider = ? AND provider_id = ?',
        ['google', profile.id],
        (err, user) => {
          if (err) {
            console.error('Error checking for existing user:', err);
            return done(err);
          }
          
          console.log('User lookup result:', user ? 'Found existing user' : 'User not found');
          
          if (user) {
            console.log('Existing user:', user);
            // Update last login
            db.run(
              'UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = ?',
              [user.id],
              (err) => {
                if (err) console.error('Error updating last login:', err);
              }
            );
            return done(null, user);
          } else {
            // Create new user
            const email = profile.emails && profile.emails[0] ? profile.emails[0].value : null;
            const photo = profile.photos && profile.photos[0] ? profile.photos[0].value : null;
            
            console.log('Creating new user with data:', {
              provider: 'google',
              provider_id: profile.id,
              email,
              display_name: profile.displayName,
              role: 'viewer'
            });
            
            db.run(
              `INSERT INTO users (provider, provider_id, email, display_name, first_name, last_name, profile_photo, role)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
              ['google', profile.id, email, profile.displayName, profile.name?.givenName, profile.name?.familyName, photo, 'viewer'],
              function(err) {
                if (err) {
                  console.error('Error creating user:', err);
                  return done(err);
                }
                
                console.log('User created with lastID:', this.lastID);
                
                db.get('SELECT * FROM users WHERE id = ?', [this.lastID], (err, newUser) => {
                  return done(err, newUser);
                });
              }
            );
          }
        }
      );
    } catch (error) {
      return done(error);
    }
  }
));

// Facebook OAuth Strategy
passport.use(new FacebookStrategy({
    clientID: config.facebook.clientID,
    clientSecret: config.facebook.clientSecret,
    callbackURL: config.facebook.callbackURL,
    profileFields: config.facebook.profileFields
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      db.get(
        'SELECT * FROM users WHERE provider = ? AND provider_id = ?',
        ['facebook', profile.id],
        (err, user) => {
          if (err) return done(err);
          
          if (user) {
            db.run(
              'UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = ?',
              [user.id],
              (err) => {
                if (err) console.error('Error updating last login:', err);
              }
            );
            return done(null, user);
          } else {
            const email = profile.emails && profile.emails[0] ? profile.emails[0].value : null;
            const photo = profile.photos && profile.photos[0] ? profile.photos[0].value : null;
            
            db.run(
              `INSERT INTO users (provider, provider_id, email, display_name, first_name, last_name, profile_photo, role)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
              ['facebook', profile.id, email, profile.displayName, profile.name?.givenName, profile.name?.familyName, photo, 'viewer'],
              function(err) {
                if (err) return done(err);
                
                db.get('SELECT * FROM users WHERE id = ?', [this.lastID], (err, newUser) => {
                  return done(err, newUser);
                });
              }
            );
          }
        }
      );
    } catch (error) {
      return done(error);
    }
  }
));

// Microsoft OAuth Strategy
passport.use(new MicrosoftStrategy({
    clientID: config.microsoft.clientID,
    clientSecret: config.microsoft.clientSecret,
    callbackURL: config.microsoft.callbackURL,
    tenant: config.microsoft.tenant,
    scope: ['user.read']
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      db.get(
        'SELECT * FROM users WHERE provider = ? AND provider_id = ?',
        ['microsoft', profile.id],
        (err, user) => {
          if (err) return done(err);
          
          if (user) {
            db.run(
              'UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = ?',
              [user.id],
              (err) => {
                if (err) console.error('Error updating last login:', err);
              }
            );
            return done(null, user);
          } else {
            const email = profile.emails && profile.emails[0] ? profile.emails[0].value : null;
            const photo = profile.photos && profile.photos[0] ? profile.photos[0].value : null;
            
            db.run(
              `INSERT INTO users (provider, provider_id, email, display_name, first_name, last_name, profile_photo, role)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
              ['microsoft', profile.id, email, profile.displayName, profile.name?.givenName, profile.name?.familyName, photo, 'viewer'],
              function(err) {
                if (err) return done(err);
                
                db.get('SELECT * FROM users WHERE id = ?', [this.lastID], (err, newUser) => {
                  return done(err, newUser);
                });
              }
            );
          }
        }
      );
    } catch (error) {
      return done(error);
    }
  }
));

module.exports = passport;
