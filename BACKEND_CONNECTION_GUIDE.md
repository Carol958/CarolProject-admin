# Backend Connection Troubleshooting Guide

## Problem
You're getting a `net::ERR_CONNECTION_CLOSED` error when trying to fetch categories from:
`https://eeriest-asymptotically-sherie.ngrok-free.dev/api/category`

## Root Cause
The backend server is either:
1. Not running
2. The ngrok tunnel has expired
3. Network connectivity issues

## Solution Steps

### Step 1: Start Your Backend Server
1. Navigate to your backend directory (likely in `c:\Users\Carol Mousa\Downloads\New folder\New folder\`)
2. Start the backend server:
   ```bash
   node server.js
   ```
   OR if you're using npm:
   ```bash
   npm start
   ```

### Step 2: Start ngrok Tunnel
1. Open a new terminal
2. Run ngrok (replace 5000 with your actual backend port):
   ```bash
   ngrok http 5000
   ```
3. Copy the new HTTPS forwarding URL (e.g., `https://xxxx-xxxx.ngrok-free.dev`)

### Step 3: Update Frontend API URLs
You need to update the API base URL in your frontend. Search for all occurrences of:
`https://eeriest-asymptotically-sherie.ngrok-free.dev`

And replace with your new ngrok URL.

**Files that likely need updating:**
- `src/pages/AddNewSubcategory.jsx` (line 30)
- Any other components making API calls
- Consider creating a config file for the API base URL

### Step 4: Create API Configuration File (Recommended)

Create a file `src/config/api.js`:
```javascript
export const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
```

Then create a `.env` file in the project root:
```
VITE_API_URL=https://your-ngrok-url.ngrok-free.dev
```

This way, you only need to update the URL in one place.

## Quick Check
1. Is your backend server running? Check the terminal for any errors
2. Is ngrok running? Check for the forwarding URL
3. Can you access the API in your browser? Try: `https://your-ngrok-url.ngrok-free.dev/api/category`

## Alternative: Use Localhost for Development
If you're developing locally, you can:
1. Update the API URL to `http://localhost:5000` (or your backend port)
2. Ensure your backend has CORS enabled for localhost:5173 (Vite's default port)

## Next Steps
After fixing the connection:
1. The improved error handling will now show user-friendly toast notifications
2. You'll see specific error messages if the API fails
3. Categories should load successfully in the dropdown
