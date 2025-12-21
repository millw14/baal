# Fix Privy CORS Errors

## The Error
```
Access to fetch at 'https://auth.privy.io/api/v1/analytics_events' from origin 'http://localhost:3000' 
has been blocked by CORS policy: No 'Access-Control-Allow-Origin' header is present on the requested resource.
```

```
auth.privy.io/api/v1/passwordless/init:1 Failed to load resource: the server responded with a status of 403
```

This means `http://localhost:3000` is **not whitelisted** in your Privy application settings.

## ✅ Solution: Add Localhost to Privy Dashboard

### Step 1: Go to Privy Dashboard
1. Open https://dashboard.privy.io
2. Sign in to your account

### Step 2: Select Your Application
- Find your app with App ID: `cmjfmcsgj0255ky0c8xkwzmlz`
- Click on it to open the app settings

### Step 3: Navigate to Application Settings
- Look for **"Settings"** in the left sidebar
- Click on **"Application"** or **"App Settings"**
- Scroll to find **"Allowed Origins"** or **"Application URLs"**

### Step 4: Add Localhost
1. Click **"+ Add Origin"** or **"Add URL"** button
2. Enter: `http://localhost:3000`
3. **IMPORTANT**: Include the protocol (`http://`) and port (`:3000`)
4. Click **"Save"** or **"Add"**

### Step 5: Verify
The list should now include:
- `http://localhost:3000` ✅

### Step 6: Restart Your Dev Server
After adding the origin:
1. **Stop** your dev server (Ctrl+C)
2. **Start** it again: `npm run dev`
3. **Hard refresh** your browser (Ctrl+Shift+R)

## Where to Find "Allowed Origins" in Privy Dashboard

If you can't find "Allowed Origins", look for these alternative names:
- ✅ **Application URLs**
- ✅ **Redirect URLs**
- ✅ **Whitelist URLs**
- ✅ **CORS Origins**
- ✅ **Trusted Origins**

All of these refer to the same setting.

## Troubleshooting

### Still Getting CORS Errors?
1. **Double-check the URL format**:
   - ✅ Correct: `http://localhost:3000`
   - ❌ Wrong: `localhost:3000` (missing protocol)
   - ❌ Wrong: `http://localhost` (missing port)
   - ❌ Wrong: `https://localhost:3000` (wrong protocol for localhost)

2. **Clear browser cache**:
   - Press `Ctrl+Shift+Delete`
   - Clear cached images and files
   - Hard refresh: `Ctrl+Shift+R`

3. **Check if changes were saved**:
   - Go back to Privy Dashboard
   - Verify `http://localhost:3000` is in the list
   - Changes should be immediate (no need to wait)

4. **Try incognito/private window**:
   - Open a new incognito window
   - Navigate to `http://localhost:3000`
   - This bypasses cache issues

### Getting 403 Errors?
The 403 error on `/passwordless/init` usually means:
1. The origin is not allowed (CORS issue above)
2. OR email login is not enabled in Privy settings

**To enable email login:**
1. Go to Privy Dashboard → Your App → Settings
2. Look for **"Login Methods"** or **"Authentication Methods"**
3. Make sure **"Email"** or **"Passwordless"** is enabled
4. Save changes

## Production Setup

When you deploy, remember to add your production domain:
- `https://yourdomain.com`
- `https://www.yourdomain.com` (if you use www)

---

**After adding `http://localhost:3000` to Privy Dashboard and restarting your dev server, the CORS errors should disappear!**

