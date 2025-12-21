# Fixing ChunkLoadError

## The Error
```
ChunkLoadError: Loading chunk app/layout failed.
(timeout: http://localhost:3000/_next/static/chunks/app/layout.js)
```

This error means Next.js can't load JavaScript chunks, usually due to corrupted build cache.

## ✅ Solution

### Step 1: Clear Build Cache

The `.next` folder has been deleted. Now:

1. **Stop your dev server** (press `Ctrl+C` in the terminal)

2. **Start fresh**:
   ```bash
   npm run dev
   ```

3. **Wait for compilation** - This will rebuild everything from scratch

4. **Refresh your browser** (hard refresh: `Ctrl+Shift+R` or `Ctrl+F5`)

### Step 2: If Still Not Working

1. **Clear browser cache**:
   - Press `Ctrl+Shift+Delete`
   - Select "Cached images and files"
   - Clear data

2. **Try incognito/private window** to test if it's a cache issue

3. **Check for port conflicts**:
   - Make sure nothing else is using port 3000
   - Try a different port: `npm run dev -- -p 3001`

### Why This Happens

- Hot reload issues during development
- Build cache corruption
- Network interruption during build
- File system sync issues

### Prevention

- Regularly restart the dev server during long sessions
- Avoid force-closing the terminal while the server is running
- Clear `.next` folder if you see weird build errors

---

**The .next folder has been cleared. Just restart your dev server now!**

