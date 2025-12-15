# OAuth Setup Instructions

To enable social login authentication, you need to obtain OAuth credentials from each provider.

## Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Navigate to "APIs & Services" > "Credentials"
4. Click "Create Credentials" > "OAuth client ID"
5. Select "Web application"
6. Add authorized redirect URI: `http://localhost:3000/auth/google/callback`
7. Copy your Client ID and Client Secret
8. Update `config.js` or set environment variables:
   ```
   GOOGLE_CLIENT_ID=your_client_id
   GOOGLE_CLIENT_SECRET=your_client_secret
   ```

## Microsoft OAuth Setup

1. Go to [Azure Portal](https://portal.azure.com/)
2. Navigate to "Azure Active Directory" > "App registrations"
3. Click "New registration"
4. Name your app and select "Accounts in any organizational directory and personal Microsoft accounts"
5. Add redirect URI (Web): `http://localhost:3000/auth/microsoft/callback`
6. Go to "Certificates & secrets" > "New client secret"
7. Copy your Application (client) ID and client secret value
8. Update `config.js` or set environment variables:
   ```
   MICROSOFT_CLIENT_ID=your_client_id
   MICROSOFT_CLIENT_SECRET=your_client_secret
   ```

## Facebook OAuth Setup

1. Go to [Facebook Developers](https://developers.facebook.com/)
2. Click "My Apps" > "Create App"
3. Select "Consumer" app type
4. Fill in app details
5. Go to "Settings" > "Basic"
6. Copy your App ID and App Secret
7. Go to "Facebook Login" > "Settings"
8. Add OAuth Redirect URI: `http://localhost:3000/auth/facebook/callback`
9. Update `config.js` or set environment variables:
   ```
   FACEBOOK_APP_ID=your_app_id
   FACEBOOK_APP_SECRET=your_app_secret
   ```

## Environment Variables (Recommended for Production)

Create a `.env` file in the root directory:

```
SESSION_SECRET=your_random_secret_key_change_this
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
FACEBOOK_APP_ID=your_facebook_app_id
FACEBOOK_APP_SECRET=your_facebook_app_secret
MICROSOFT_CLIENT_ID=your_microsoft_client_id
MICROSOFT_CLIENT_SECRET=your_microsoft_client_secret
NODE_ENV=production
```

Install dotenv: `npm install dotenv`

Add to the top of `server.js`: `require('dotenv').config();`

## Testing Locally

The OAuth redirect URLs must match exactly. For local testing, use:
- `http://localhost:3000` (not `127.0.0.1`)

For production, update the callback URLs in both your OAuth app settings and `config.js`.

## User Roles

After first login, users are assigned the 'viewer' role by default. Roles can be manually updated in the database:
- `viewer` - Can view competitions and results
- `judge` - Can enter scores
- `manager` - Can manage competitions, events, competitors
- `admin` - Full access

Role-based authorization will be implemented in future updates.
