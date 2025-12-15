// OAuth Configuration
// IMPORTANT: Replace these with your actual OAuth credentials from:
// - Google: https://console.cloud.google.com/apis/credentials
// - Facebook: https://developers.facebook.com/apps
// - Microsoft: https://portal.azure.com/#blade/Microsoft_AAD_RegisteredApps/ApplicationsListBlade

module.exports = {
  session: {
    secret: process.env.SESSION_SECRET || 'diving-comp-secret-change-in-production',
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === 'production', // Set to true in production with HTTPS
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
  },
  
  google: {
    clientID: process.env.GOOGLE_CLIENT_ID || 'YOUR_GOOGLE_CLIENT_ID',
    clientSecret: process.env.GOOGLE_CLIENT_SECRET || 'YOUR_GOOGLE_CLIENT_SECRET',
    callbackURL: process.env.GOOGLE_CALLBACK_URL || 'http://localhost:3000/auth/google/callback'
  },
  
  facebook: {
    clientID: process.env.FACEBOOK_APP_ID || 'YOUR_FACEBOOK_APP_ID',
    clientSecret: process.env.FACEBOOK_APP_SECRET || 'YOUR_FACEBOOK_APP_SECRET',
    callbackURL: process.env.FACEBOOK_CALLBACK_URL || 'http://localhost:3000/auth/facebook/callback',
    profileFields: ['id', 'displayName', 'email', 'name', 'photos']
  },
  
  microsoft: {
    clientID: process.env.MICROSOFT_CLIENT_ID || 'YOUR_MICROSOFT_CLIENT_ID',
    clientSecret: process.env.MICROSOFT_CLIENT_SECRET || 'YOUR_MICROSOFT_CLIENT_SECRET',
    callbackURL: process.env.MICROSOFT_CALLBACK_URL || 'http://localhost:3000/auth/microsoft/callback',
    tenant: 'common' // 'common' allows any Microsoft account (Hotmail, Outlook, etc.)
  }
};
