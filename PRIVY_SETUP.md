# Fix "Origin not allowed" Error in Privy

## The Error
```
Error: Origin not allowed
```

This error means that `http://localhost:3000` is not whitelisted in your Privy application settings.

## Solution

1. Go to the [Privy Dashboard](https://dashboard.privy.io)
2. Select your application (the one with App ID: `cmjfmcsgj0255ky0c8xkwzmlz`)
3. Navigate to **Settings** → **Application** or **Allowed Origins**
4. Add the following origins to the whitelist:
   - `http://localhost:3000` (for local development)
   - `http://localhost:3001` (if you use a different port)
   - Your production domain (when you deploy)

5. Save the changes

## Steps in Detail

1. **Login to Privy Dashboard**: https://dashboard.privy.io
2. **Select your app**: Find the app with ID starting with `cmjfmcsgj...`
3. **Go to Settings**: Click on "Settings" in the sidebar
4. **Find "Allowed Origins"**: Look for a section called "Allowed Origins", "Application URLs", or "Redirect URLs"
5. **Add localhost**: 
   - Click "Add Origin" or "+" button
   - Enter: `http://localhost:3000`
   - Save
6. **Restart your dev server** after adding the origin

## Alternative: Check Your App Configuration

If you can't find "Allowed Origins", look for:
- **Application URLs**
- **Redirect URLs** 
- **Whitelist URLs**
- **CORS Origins**

All of these refer to the same thing - the list of URLs that Privy will accept requests from.

## After Adding the Origin

1. Make sure you've saved the changes in Privy Dashboard
2. Restart your Next.js dev server:
   ```bash
   # Stop the server (Ctrl+C)
   npm run dev
   ```
3. The error should disappear

## Production Setup

When you deploy to production, remember to add your production domain:
- `https://yourdomain.com`
- `https://www.yourdomain.com` (if you use www)

