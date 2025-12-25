# 🎯 Slingshot Setup Checklist

Use this checklist to set up and test your complete Slingshot system.

## ✅ Phase 1: Initial Setup

### Backend Setup
- [ ] Navigate to project root: `cd d:\Brogrammers\sling-shot`
- [ ] Install dependencies: `npm install`
- [ ] Verify MongoDB is running (or configure MongoDB Atlas)
- [ ] (Optional) Create `.env` file with AWS S3 credentials
- [ ] Test server starts: `node server.ts`
- [ ] Verify console shows: "✓ MongoDB connected"
- [ ] Keep server running for testing

### Mobile App Setup
- [ ] Open new terminal
- [ ] Navigate to mobile: `cd mobile`
- [ ] Install dependencies: `npm install`
- [ ] Find your local IP address:
  - Windows: `ipconfig` (look for IPv4 Address)
  - Mac: `ifconfig` (look for inet)
  - Example: `192.168.1.100`
- [ ] Edit `src/lib/socket.ts` and update:
  ```typescript
  const SOCKET_URL = 'http://YOUR_IP:3001';
  ```
- [ ] Build React app: `npm run build`
- [ ] Verify `build/` folder created

## ✅ Phase 2: Android Setup

### Add Android Platform
- [ ] Add Android: `npx cap add android`
- [ ] Sync: `npx cap sync`
- [ ] Open Android Studio: `npx cap open android`
- [ ] Wait for Gradle sync to complete (be patient, first time is slow)

### Configure Device
- [ ] Connect Android phone via USB
- [ ] Enable Developer Options on phone:
  - Settings → About Phone → Tap "Build Number" 7 times
- [ ] Enable USB Debugging:
  - Settings → Developer Options → USB Debugging
- [ ] Authorize computer on phone when prompted
- [ ] Verify device shows in Android Studio toolbar

### Permissions Verification
- [ ] Open `android/app/src/main/AndroidManifest.xml`
- [ ] Verify these permissions exist:
  ```xml
  <uses-permission android:name="android.permission.CAMERA" />
  <uses-permission android:name="android.permission.INTERNET" />
  <uses-feature android:name="android.hardware.sensor.accelerometer" />
  ```

### Build & Run
- [ ] Click Run button (▶️) in Android Studio
- [ ] App installs on device
- [ ] App opens without crashing
- [ ] No red errors in Logcat

## ✅ Phase 3: Network Setup

### Verify Connection
- [ ] Both phone and computer on same WiFi network
- [ ] Check WiFi name matches on both devices
- [ ] Disable mobile data on phone (use WiFi only)
- [ ] Ping test (optional):
  ```bash
  ping YOUR_IP
  ```

### Firewall Setup
- [ ] Windows: Allow Node.js through firewall
- [ ] Temporarily disable firewall to test if needed
- [ ] Port 3001 must be accessible

## ✅ Phase 4: Big Screen Setup

### Web App Setup
- [ ] Open new terminal in project root
- [ ] Start dev server: `npm run dev`
- [ ] Open browser: `http://localhost:5173/bigscreen`
- [ ] Or open: `http://YOUR_IP:5173/bigscreen`
- [ ] Verify page loads with title "🎯 Slingshot Live!"
- [ ] Open browser console (F12)
- [ ] Look for Socket.io connection messages

## ✅ Phase 5: Testing

### Mobile App Test
- [ ] Open app on phone
- [ ] Tap "📷 Take Selfie"
- [ ] Camera opens (front-facing)
- [ ] Take photo
- [ ] Photo preview shows
- [ ] Enter name: "Test User"
- [ ] Enter message: "Hello World"
- [ ] Tap "🚀 Start Slingshot"
- [ ] See preview card with your data
- [ ] Connection status shows "✅ Connected"

### Motion Test
- [ ] Hold phone vertically
- [ ] Pull phone backward (toward you)
- [ ] See "🎯 READY! Release to SHOOT!" message
- [ ] See orange background
- [ ] Throw phone forward quickly (be careful!)
- [ ] See "Launching..." overlay
- [ ] See "🎉 Shot Fired!" success message

### Backend Test
- [ ] Check backend terminal
- [ ] Look for: "🎯 Shot fired by Test User with force X"
- [ ] Look for: "✓ Shot displayed on big screen"
- [ ] No error messages

### Big Screen Test
- [ ] Check browser on big screen
- [ ] See your selfie fly into view
- [ ] Animation is smooth
- [ ] Photo appears in grid below
- [ ] Shows name, message, and force value

## ✅ Phase 6: Complete Flow Test

### End-to-End Test
- [ ] Reset mobile app (go back to registration)
- [ ] Take different selfie
- [ ] Enter different name and message
- [ ] Complete slingshot gesture
- [ ] Watch on big screen
- [ ] Verify all data correct
- [ ] Check MongoDB has messages
- [ ] Check `uploads/` folder has images (or S3)

### Multiple Shots
- [ ] Fire 3 shots in a row
- [ ] Verify all appear on big screen
- [ ] Check cooldown works (1 second between shots)
- [ ] Verify animations don't overlap

## ✅ Phase 7: Quality Checks

### Mobile App Quality
- [ ] UI looks good (no overlapping text)
- [ ] Buttons are responsive
- [ ] Camera works on first try
- [ ] Motion sensors reliable
- [ ] Animations smooth
- [ ] No crashes

### Performance
- [ ] App loads quickly
- [ ] Camera opens instantly
- [ ] Motion detection responsive
- [ ] No lag in animations
- [ ] Backend responds quickly

### Error Handling
- [ ] Try without camera permission (handled gracefully)
- [ ] Try with backend offline (shows error)
- [ ] Try without WiFi (shows disconnected)
- [ ] Try empty form (validation works)

## ✅ Phase 8: Optional - iOS Setup

### iOS Setup (macOS only)
- [ ] Navigate to mobile: `cd mobile`
- [ ] Add iOS: `npx cap add ios`
- [ ] Sync: `npx cap sync`
- [ ] Open Xcode: `npx cap open ios`
- [ ] Select development team
- [ ] Connect iOS device
- [ ] Trust computer on device
- [ ] Run app
- [ ] Grant motion permission when prompted
- [ ] Grant camera permission when prompted
- [ ] Test complete flow

## ✅ Phase 9: Production Build

### Android APK Build
- [ ] Open Android Studio
- [ ] Build → Generate Signed Bundle / APK
- [ ] Select APK
- [ ] Create/use keystore
- [ ] Choose release variant
- [ ] Build completes
- [ ] Find APK in `android/app/release/`
- [ ] Install APK on device manually
- [ ] Test production build

### iOS App Build (macOS only)
- [ ] Open Xcode
- [ ] Select Generic iOS Device
- [ ] Product → Archive
- [ ] Follow distribution steps
- [ ] Test build

## ✅ Phase 10: Deployment (Optional)

### Backend Deployment
- [ ] Choose platform (Heroku, Railway, etc.)
- [ ] Setup MongoDB Atlas
- [ ] Configure environment variables
- [ ] Deploy backend
- [ ] Test deployed backend URL
- [ ] Update mobile app socket URL to production
- [ ] Rebuild and test

### Web App Deployment
- [ ] Deploy to Vercel/Netlify
- [ ] Configure environment variables
- [ ] Test big screen on production URL

## 📊 Success Criteria

All checkboxes above should be checked before considering setup complete.

### Minimum Viable Test
- ✅ Backend runs without errors
- ✅ Mobile app installs and opens
- ✅ Camera captures selfie
- ✅ Motion sensors detect gesture
- ✅ Shot fires successfully
- ✅ Big screen receives and displays shot
- ✅ Animation plays smoothly

### Production Ready
- ✅ All tests pass consistently
- ✅ No errors in logs
- ✅ Handles poor network gracefully
- ✅ UI looks professional
- ✅ Performance is good
- ✅ Works on multiple devices
- ✅ APK/IPA built successfully

## 🐛 Troubleshooting References

If any step fails, check:
- `mobile/README.md` - Complete troubleshooting guide
- `mobile/QUICKSTART.md` - Common issues
- Backend console logs
- Android Studio Logcat
- Browser console (big screen)

## 🎯 Quick Commands Reference

```bash
# Start backend
node server.ts

# Start web dev server
npm run dev

# Mobile: Install deps
cd mobile && npm install

# Mobile: Build
npm run build

# Mobile: Sync
npx cap sync

# Mobile: Open Android Studio
npx cap open android

# Mobile: Open Xcode
npx cap open ios
```

## ✅ Final Verification

- [ ] I have tested the complete flow
- [ ] All components work together
- [ ] I understand the system architecture
- [ ] I can reproduce the working state
- [ ] I have backed up my configuration
- [ ] I am ready to show this to others! 🎉

---

**When all boxes are checked, you're ready to sling! 🎯**

**Issues?** Check documentation in `mobile/` directory.

**Status:** _____ / _____ completed
