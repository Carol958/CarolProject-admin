# 🚀 Quick Start Guide: Backend Server & ngrok

## ⚠️ Current Problem
Your frontend is trying to connect to:
`https://eeriest-asymptotically-sherie.ngrok-free.dev/api/subcategory`

But getting `net::ERR_CONNECTION_CLOSED` because:
- ❌ Backend server is not running
- ❌ ngrok tunnel has expired

## ✅ Solution: Start Backend & ngrok

### Step 1: Start Your Backend Server

**Option A: If backend is in `c:\Users\Carol Mousa\Downloads\New folder\New folder\`**

1. Open a **NEW** PowerShell/Command Prompt window
2. Run these commands:
   ```bash
   cd "c:\Users\Carol Mousa\Downloads\New folder\New folder"
   npm start
   ```
   OR if that doesn't work:
   ```bash
   node server.js
   ```

**Option B: If backend is in `c:\Users\Carol Mousa\Downloads\Fproject\back end\Care-Mall-Backend\`**

1. Open a **NEW** PowerShell/Command Prompt window
2. Run these commands:
   ```bash
   cd "c:\Users\Carol Mousa\Downloads\Fproject\back end\Care-Mall-Backend"
   npm start
   ```
   OR:
   ```bash
   node server.js
   ```

**✅ Success indicators:**
- You should see messages like:
  - `Server running on port 5000` (or similar)
  - `Database connected`
  - No error messages

**❌ If you see errors:**
- `Cannot find module`: Run `npm install` first
- `Port already in use`: Kill the process using that port or use a different port
- `Database connection failed`: Check your database is running

---

### Step 2: Start ngrok Tunnel

1. Open **ANOTHER NEW** terminal window (keep backend running!)
2. Run ngrok (replace 5000 with your actual backend port):
   ```bash
   ngrok http 5000
   ```

3. **Copy the HTTPS URL** that appears (looks like: `https://xxxx-yyyy-zzzz.ngrok-free.dev`)

**Example ngrok output:**
```
Forwarding   https://abc123-def456.ngrok-free.dev -> http://localhost:5000
```
Copy the `https://abc123-def456.ngrok-free.dev` part!

---

### Step 3: Update Frontend API URL

**Quick Method - Update in One Place:**

1. Open `SubcategoryContext.jsx`
2. Find line 4:
   ```javascript
   const API_BASE_URL = "https://eeriest-asymptotically-sherie.ngrok-free.dev/api";
   ```
3. Replace with your NEW ngrok URL:
   ```javascript
   const API_BASE_URL = "https://YOUR-NEW-NGROK-URL.ngrok-free.dev/api";
   ```

**Also check these files for the old URL:**
- `src/pages/AddNewSubcategory.jsx` (line 30)
- Any other component files making API calls

---

## 🔍 Quick Test

After starting backend and ngrok:

1. **Test in browser:** Open `https://YOUR-NGROK-URL.ngrok-free.dev/api/subcategory`
   - Should show JSON data or a response (not an error page)

2. **Test in your app:** Try adding a subcategory
   - Should work without connection errors

---

## 💡 Alternative: Use Localhost (Easier for Development)

If you're developing locally and don't need external access:

1. **Skip ngrok entirely**
2. Update `SubcategoryContext.jsx` line 4 to:
   ```javascript
   const API_BASE_URL = "http://localhost:5000/api";
   ```
   (Replace 5000 with your backend port)

3. **Make sure your backend has CORS enabled** for `http://localhost:5173`

---

## 📝 Checklist

- [ ] Backend server is running (check terminal for "Server running" message)
- [ ] ngrok is running (or using localhost)
- [ ] Frontend API URL is updated with new ngrok URL (or localhost)
- [ ] Can access API in browser
- [ ] Frontend app can connect successfully

---

## 🆘 Still Having Issues?

**Backend won't start:**
- Run `npm install` in the backend directory
- Check if another process is using the port
- Check database connection settings

**ngrok issues:**
- Make sure ngrok is installed: `ngrok version`
- Install if needed: Download from https://ngrok.com/download

**Frontend still can't connect:**
- Clear browser cache
- Check browser console for the exact URL being called
- Verify the API URL in your code matches the ngrok URL exactly
