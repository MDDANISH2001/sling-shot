# 🎯 Slingshot Mobile App - Complete Setup Guide

## System Architecture

This project consists of three main components:

1. **Mobile App** (`mobile/`) - React + Capacitor app for shooting messages
2. **Backend** (`server.ts`) - Node.js + Socket.io for message handling
3. **Big Screen** (`src/pages/BigScreen.tsx`) - React web app for display

---

## Prerequisites

- Node.js 18+ installed
- Android Studio (for Android development)
- Xcode (for iOS development, macOS only)
- A physical mobile device for testing (recommended)

---

## Part 1: Mobile App Setup

### Step 1: Install Dependencies

```bash
cd mobile
npm install
```

### Step 2: Configure Backend URL

Edit `mobile/src/lib/socket.ts` and update the `SOCKET_URL`:

```typescript
// Find your computer's local IP address:
// Windows: ipconfig
// Mac/Linux: ifconfig

const SOCKET_URL = 'http://YOUR_LOCAL_IP:3001';
// Example: 'http://192.168.1.100:3001'
```

### Step 3: Build the React App

```bash
npm run build
```

### Step 4: Add Native Platforms

#### For Android:

```bash
npx cap add android
npx cap sync
```

#### For iOS (macOS only):

```bash
npx cap add ios
npx cap sync
```

### Step 5: Configure Permissions

#### Android Permissions

The file `android/app/src/main/AndroidManifest.xml` should already include these permissions from Capacitor plugins:

```xml
<uses-permission android:name="android.permission.CAMERA" />
<uses-permission android:name="android.permission.INTERNET" />
<uses-feature android:name="android.hardware.sensor.accelerometer" android:required="true" />
```

If not present, add them inside the `<manifest>` tag.

#### iOS Permissions

Edit `ios/App/App/Info.plist` and add:

```xml
<key>NSCameraUsageDescription</key>
<string>This app needs camera access to capture selfies</string>
<key>NSMotionUsageDescription</key>
<string>This app needs motion sensor access to detect slingshot gesture</string>
```

### Step 6: Open Native IDE

#### Android Studio:

```bash
npx cap open android
```

Then:
1. Wait for Gradle sync to complete
2. Connect your Android device via USB
3. Enable USB Debugging on your device
4. Click the "Run" button (green play icon)

#### Xcode (iOS):

```bash
npx cap open ios
```

Then:
1. Select your development team
2. Connect your iOS device
3. Select your device as the target
4. Click the "Run" button

---

## Part 2: Backend Setup

### Step 1: Install Backend Dependencies

```bash
# From project root
npm install
```

### Step 2: Setup MongoDB

You have two options:

**Option A: Local MongoDB**
```bash
# Install MongoDB locally, then start it
mongod
```

**Option B: MongoDB Atlas (Cloud)**
1. Create a free account at mongodb.com/atlas
2. Create a cluster
3. Get your connection string
4. Create `.env` file in project root:

```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/sling-shot
```

### Step 3: Setup AWS S3 (Optional)

For image storage, you can use local storage (default) or AWS S3.

For AWS S3, create `.env` file:

```env
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
AWS_S3_BUCKET=your-bucket-name
```

If not configured, images will be saved locally in the `uploads/` folder.

### Step 4: Start Backend Server

```bash
npm run dev
# or
node server.ts
```

The server will start on `http://localhost:3001`

---

## Part 3: Big Screen Web App

### Step 1: Update Your Main App Router

Edit `src/App.tsx` to include the BigScreen route:

```tsx
import { BigScreen } from './pages/BigScreen';

// Add to your routes:
<Route path="/bigscreen" element={<BigScreen />} />
```

### Step 2: Access Big Screen

Open your browser and navigate to:
```
http://localhost:5173/bigscreen
```

Or on your deployed URL.

---

## Part 4: Local Network Testing

### Find Your Computer's IP Address

**Windows:**
```bash
ipconfig
```
Look for "IPv4 Address" under your active network adapter.

**Mac/Linux:**
```bash
ifconfig
# or
ip addr show
```

**Example IP:** `192.168.1.100`

### Update Mobile App Configuration

In `mobile/src/lib/socket.ts`:
```typescript
const SOCKET_URL = 'http://192.168.1.100:3001';
```

### Rebuild Mobile App

```bash
cd mobile
npm run build
npx cap sync
```

Then reopen and run in Android Studio or Xcode.

### Ensure Same Network

- Your computer (running backend) must be on the same WiFi network as your phone
- Disable any firewall that might block port 3001
- Windows: Allow Node.js through Windows Firewall when prompted

---

## Part 5: Building Production APK

### Android APK Build

```bash
cd mobile
npm run build
npx cap sync
npx cap open android
```

In Android Studio:
1. Go to **Build** → **Generate Signed Bundle / APK**
2. Select **APK**
3. Create or use existing keystore
4. Choose **release** build variant
5. Wait for build to complete
6. APK will be in `android/app/release/`

### iOS App Build

In Xcode:
1. Select **Generic iOS Device** as target
2. Go to **Product** → **Archive**
3. Follow App Store or Ad-Hoc distribution steps

---

## Part 6: Testing the Complete System

### Test Flow:

1. **Start Backend:**
   ```bash
   node server.ts
   ```

2. **Open Big Screen:**
   - Open browser: `http://localhost:5173/bigscreen`
   - Or: `http://YOUR_IP:5173/bigscreen`

3. **Use Mobile App:**
   - Open app on phone
   - Take a selfie
   - Enter name and message
   - Tap "Start Slingshot"
   - Pull phone backward
   - Throw forward quickly
   - Watch message appear on big screen!

---

## Troubleshooting

### Mobile App Issues

**Camera not working:**
- Check camera permissions in device settings
- Ensure app has camera permission granted

**Motion sensors not detected:**
- iOS: Permission prompt should appear on first use
- Android: Should work automatically
- Ensure you're on a physical device (not emulator)

**Cannot connect to backend:**
- Verify backend is running
- Check IP address in socket.ts is correct
- Ensure phone and computer are on same WiFi
- Disable firewalls temporarily to test

### Backend Issues

**MongoDB connection failed:**
- Check MongoDB is running locally, or
- Verify MongoDB Atlas connection string is correct

**Images not uploading:**
- Check `uploads/` folder exists and is writable
- For S3: Verify AWS credentials are correct

### Big Screen Issues

**No messages appearing:**
- Check browser console for Socket.io errors
- Verify backend is running
- Check network tab for websocket connection

---

## Project Structure

```
sling-shot/
├── mobile/                          # Capacitor mobile app
│   ├── src/
│   │   ├── hooks/
│   │   │   ├── useNativeSlingshot.ts   # Motion detection
│   │   │   └── useCamera.ts            # Camera capture
│   │   ├── screens/
│   │   │   ├── Registration.tsx        # User input screen
│   │   │   └── Slingshot.tsx          # Shooting screen
│   │   ├── lib/
│   │   │   └── socket.ts              # Socket.io connection
│   │   └── App.tsx                     # Main app
│   ├── android/                        # Android native project
│   ├── ios/                           # iOS native project
│   └── capacitor.config.ts            # Capacitor config
├── src/
│   └── pages/
│       └── BigScreen.tsx              # Display component
├── server.ts                          # Backend server
└── uploads/                           # Local image storage
```

---

## Key Features

### Mobile App
- ✅ Native camera access (front-facing selfie)
- ✅ Real-time accelerometer motion detection
- ✅ Pull-back and release gesture recognition
- ✅ Force calculation based on throw speed
- ✅ Real-time Socket.io communication
- ✅ Visual feedback for charging/shooting states

### Backend
- ✅ Socket.io event handling
- ✅ MongoDB message storage
- ✅ S3 or local image storage
- ✅ shotFired event processing
- ✅ displayShot event emission to big screen

### Big Screen
- ✅ Real-time message display
- ✅ Physics-based animation (force affects speed)
- ✅ Smooth flying transitions
- ✅ Message history grid
- ✅ Visual effects and animations

---

## Environment Variables Summary

Create `.env` file in project root:

```env
# Backend Port (optional, defaults to 3001)
PORT=3001

# MongoDB (required)
MONGODB_URI=mongodb://localhost:27017/sling-shot

# AWS S3 (optional, falls back to local storage)
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your_key
AWS_SECRET_ACCESS_KEY=your_secret
AWS_S3_BUCKET=your-bucket

# Mobile App Socket URL (configure in mobile/src/lib/socket.ts)
# REACT_APP_SOCKET_URL=http://YOUR_IP:3001
```

---

## Common Commands Reference

### Mobile Development
```bash
# Install dependencies
cd mobile && npm install

# Build web assets
npm run build

# Sync with native projects
npx cap sync

# Open Android Studio
npx cap open android

# Open Xcode
npx cap open ios

# Copy web assets to native
npx cap copy
```

### Backend Development
```bash
# Start server
node server.ts

# Start with auto-reload (if using nodemon)
npm run dev
```

### Web Development
```bash
# Start Vite dev server
npm run dev

# Build for production
npm run build
```

---

## Next Steps

1. **Customize UI:** Modify CSS files in `mobile/src/screens/`
2. **Add Features:** Extend hooks with additional functionality
3. **Improve Animations:** Enhance big screen physics in BigScreen.tsx
4. **Add Sound Effects:** Use Capacitor Audio plugin
5. **Add Leaderboard:** Track highest force shots
6. **Add Filters:** Camera filters using Canvas API

---

## Support

For issues or questions:
- Check the troubleshooting section above
- Review Capacitor docs: https://capacitorjs.com
- Review Socket.io docs: https://socket.io

---

## License

MIT License - feel free to use and modify as needed!
