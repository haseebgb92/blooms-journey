# Troubleshooting Guide

## Common Next.js & Turbopack Issues

### 1. Turbopack Build Cache Issues

**Error**: `Cannot find module '../chunks/ssr/[turbopack]_runtime.js'`

**Solution**:
```powershell
# Stop all Node.js processes
Get-Process -Name "node" -ErrorAction SilentlyContinue | Stop-Process -Force

# Clear Next.js build cache
Remove-Item -Recurse -Force .next -ErrorAction SilentlyContinue

# Clear npm cache
npm cache clean --force

# Restart development server
npm run dev
```

### 2. Port Already in Use

**Error**: `Error: listen EADDRINUSE: address already in use :::9002`

**Solution**:
```powershell
# Find processes using port 9002
Get-NetTCPConnection -LocalPort 9002

# Kill specific process by PID
Stop-Process -Id <PID> -Force

# Or kill all Node.js processes
Get-Process -Name "node" -ErrorAction SilentlyContinue | Stop-Process -Force
```

### 3. Firebase Index Errors

**Error**: `The query requires an index`

**Solution**:
- Check if the query is using composite indexes
- Simplify queries to avoid index requirements
- Use client-side filtering when possible
- Create required indexes in Firebase Console if needed

### 4. SSR/Client-Side Issues

**Error**: `ReferenceError: window is not defined`

**Solution**:
```typescript
// Use dynamic imports for client-side only code
const { notificationService } = await import('@/lib/notificationService');

// Check if running on client
if (typeof window !== 'undefined') {
  // Client-side code
}
```

### 5. TypeScript Errors

**Error**: `Cannot find name 'useToast'`

**Solution**:
- Remove unused imports
- Check import paths
- Ensure proper type definitions
- Clear TypeScript cache: `rm -rf .next && npm run dev`

### 6. Build Failures

**Error**: Build process fails or hangs

**Solution**:
```powershell
# Clean everything
Remove-Item -Recurse -Force .next -ErrorAction SilentlyContinue
Remove-Item -Recurse -Force node_modules -ErrorAction SilentlyContinue

# Reinstall dependencies
npm install

# Restart development server
npm run dev
```

## Google Authentication Issues

### 1. Google Sign-In Not Working

**Common Issues and Solutions**:

#### **Issue**: Pop-up blocked by browser
**Solution**:
- Allow pop-ups for the domain
- Check browser settings for pop-up blockers
- Try using incognito/private mode
- Clear browser cache and cookies

#### **Issue**: Unauthorized domain error
**Solution**:
1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project: `bloom-journey-cfezc`
3. Navigate to **Authentication** → **Settings** → **Authorized domains**
4. Add your domain:
   - `localhost` (for development)
   - `127.0.0.1` (for development)
   - Your production domain

#### **Issue**: Google sign-in not enabled
**Solution**:
1. Go to [Firebase Console](https://console.firebase.google.com)
2. Navigate to **Authentication** → **Sign-in method**
3. Enable **Google** provider
4. Configure OAuth consent screen if needed

#### **Issue**: Network errors
**Solution**:
- Check internet connection
- Try different network
- Check if Firebase services are accessible
- Verify firewall settings

### 2. Debugging Google Authentication

**Add these console logs to debug**:

```typescript
// In handleSocialSignIn function
console.log('Firebase Auth State:', auth.currentUser);
console.log('Google Provider Config:', googleProvider);
console.log('Attempting Google sign-in...');

try {
  const result = await signInWithPopup(auth, googleProvider);
  console.log('Google sign-in successful:', result.user.email);
} catch (error) {
  console.error('Google sign-in error:', error);
  console.error('Error code:', error.code);
  console.error('Error message:', error.message);
}
```

### 3. Firebase Configuration Check

**Verify your Firebase config**:

```typescript
// Check if all required fields are set
const firebaseConfig = {
  apiKey: "AIzaSyAwV1-PtT_1ld0Wru3BQqH0pZ2T4h65b_s", // ✅
  authDomain: "bloom-journey-cfezc.firebaseapp.com", // ✅
  projectId: "bloom-journey-cfezc", // ✅
  storageBucket: "bloom-journey-cfezc.appspot.com", // ✅
  messagingSenderId: "246287222430", // ✅
  appId: "1:246287222430:web:5b02ff554caf7933c55d8f" // ✅
};
```

### 4. Environment-Specific Issues

#### **Development Environment**:
- Ensure `localhost` is in authorized domains
- Check if running on correct port (9002)
- Verify no CORS issues

#### **Production Environment**:
- Add production domain to authorized domains
- Check SSL certificate
- Verify domain configuration

### 5. Alternative Solutions

#### **If Google sign-in still doesn't work**:

1. **Use Email/Password Authentication**:
   - Users can still sign up with email/password
   - Google sign-in is optional

2. **Implement Fallback**:
   ```typescript
   try {
     await signInWithPopup(auth, googleProvider);
   } catch (error) {
     if (error.code === 'auth/popup-blocked') {
       // Fallback to redirect
       await signInWithRedirect(auth, googleProvider);
     }
   }
   ```

3. **Check Browser Compatibility**:
   - Test in different browsers
   - Check browser console for errors
   - Verify JavaScript is enabled

### 6. Common Error Codes

| Error Code | Description | Solution |
|------------|-------------|----------|
| `auth/popup-closed-by-user` | User closed popup | Inform user to try again |
| `auth/popup-blocked` | Popup blocked by browser | Allow popups for site |
| `auth/unauthorized-domain` | Domain not authorized | Add domain to Firebase Console |
| `auth/operation-not-allowed` | Google sign-in disabled | Enable in Firebase Console |
| `auth/network-request-failed` | Network error | Check internet connection |
| `auth/cancelled-popup-request` | Multiple popup requests | Wait before retrying |

### 7. Testing Google Authentication

**Test Steps**:
1. Open browser developer tools (F12)
2. Go to Console tab
3. Try Google sign-in
4. Check for error messages
5. Verify network requests
6. Test in incognito mode

**Expected Behavior**:
- Popup opens with Google sign-in
- User can select account
- Successfully redirects to app
- User data is stored in Firebase

## Additional Resources

- [Firebase Authentication Documentation](https://firebase.google.com/docs/auth)
- [Google Sign-In Setup Guide](https://firebase.google.com/docs/auth/web/google-signin)
- [Firebase Console](https://console.firebase.google.com)
- [Troubleshooting Firebase Auth](https://firebase.google.com/docs/auth/web/troubleshooting)
