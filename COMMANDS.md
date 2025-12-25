# 🎯 Slingshot - Quick Commands Reference

## 📱 Mobile App Commands

### Initial Setup
```bash
cd mobile
npm install
```

### Build React App
```bash
npm run build
```

### Add Platforms
```bash
# Android
npx cap add android

# iOS (macOS only)
npx cap add ios
```

### Sync Changes
```bash
npx cap sync
# or
npx cap copy
```

### Open IDEs
```bash
# Android Studio
npx cap open android

# Xcode
npx cap open ios
```

### Package.json Scripts
```bash
npm start          # Start dev server
npm run build      # Build for production
npm test           # Run tests
```

---

## 🖥️ Backend Commands

### Start Server
```bash
node server.ts
# or with auto-reload
npm run dev
```

### Install Dependencies
```bash
npm install
```

---

## 🌐 Web App Commands

### Development
```bash
npm run dev        # Start Vite dev server (http://localhost:5173)
```

### Build
```bash
npm run build      # Build for production
```

### Preview
```bash
npm run preview    # Preview production build
```

---

## 🗄️ Database Commands

### MongoDB Local
```bash
# Start MongoDB
mongod

# Connect to MongoDB shell
mongosh
```

### MongoDB Atlas
- Use connection string in `.env`
- No local commands needed

---

## 🔧 Utility Commands

### Find Your IP Address
```bash
# Windows
ipconfig

# Mac/Linux
ifconfig
# or
ip addr show
```

### Check Node Version
```bash
node --version
npm --version
```

### Kill Process on Port (if port 3001 busy)
```bash
# Windows
netstat -ano | findstr :3001
taskkill /PID <PID> /F

# Mac/Linux
lsof -i :3001
kill -9 <PID>
```

---

## 🐛 Debugging Commands

### View Mobile App Logs
```bash
# Android (in Android Studio)
# View → Tool Windows → Logcat

# Or via command line
adb logcat
```

### Clear Capacitor Cache
```bash
cd mobile
rm -rf android ios
npx cap add android
npx cap sync
```

### Reinstall Node Modules
```bash
rm -rf node_modules package-lock.json
npm install
```

---

## 📦 Build Commands

### Android APK
In Android Studio:
1. Build → Generate Signed Bundle / APK
2. Select APK
3. Choose keystore
4. Build

Or via command line:
```bash
cd mobile/android
./gradlew assembleRelease
```

### iOS Archive (macOS only)
In Xcode:
1. Product → Archive
2. Follow distribution steps

---

## 🌍 Network Commands

### Test Connection
```bash
# Ping your IP
ping 192.168.1.100

# Test backend is accessible
curl http://192.168.1.100:3001/health
```

### Check Open Ports
```bash
# Windows
netstat -an | findstr :3001

# Mac/Linux
lsof -i :3001
```

---

## 🔄 Common Workflows

### After Code Changes (Mobile)
```bash
cd mobile
npm run build
npx cap sync
# Then rerun in Android Studio
```

### After Code Changes (Backend)
```bash
# Just restart server
node server.ts
```

### After Code Changes (Web)
```bash
# Vite auto-reloads, no action needed
# Or manually: npm run dev
```

### Clean Build
```bash
cd mobile
rm -rf build
npm run build
npx cap sync
```

---

## 🚀 Deployment Commands

### Deploy Backend (Example: Heroku)
```bash
heroku create
git push heroku main
heroku config:set MONGODB_URI=your_connection_string
```

### Deploy Web App (Example: Vercel)
```bash
npm install -g vercel
vercel
```

---

## 📊 Git Commands

### Initialize Git (if needed)
```bash
git init
git add .
git commit -m "Initial commit"
```

### Push to Remote
```bash
git remote add origin <your-repo-url>
git push -u origin main
```

---

## 🎯 Full Workflow from Scratch

```bash
# 1. Backend
cd d:\Brogrammers\sling-shot
npm install
node server.ts

# 2. Mobile (new terminal)
cd mobile
npm install
# Edit src/lib/socket.ts with your IP
npm run build
npx cap add android
npx cap sync
npx cap open android
# Click Run in Android Studio

# 3. Big Screen (browser)
# Open: http://localhost:5173/bigscreen

# 4. Test!
# Use mobile app to shoot a message
```

---

## ⚡ One-Liners

```bash
# Quick mobile rebuild
cd mobile && npm run build && npx cap sync

# Quick backend restart
node server.ts

# Quick clean install
rm -rf node_modules && npm install

# Quick check all running
ps aux | grep node

# Quick mobile log view (Android)
adb logcat | grep -i "slingshot"
```

---

## 🔍 Inspection Commands

### Check Mobile App Info
```bash
cd mobile
cat capacitor.config.ts
```

### Check Installed Capacitor Plugins
```bash
cd mobile
npx cap ls
```

### Check Android Connected Devices
```bash
adb devices
```

### Check iOS Connected Devices (macOS)
```bash
instruments -s devices
```

---

## 📱 Device Management

### Android USB Debugging
```bash
# Check connection
adb devices

# Restart ADB server
adb kill-server
adb start-server

# Install APK manually
adb install app-release.apk

# Uninstall app
adb uninstall com.company.slingshot
```

---

## 🎨 Asset Management

### Optimize Images (if needed)
```bash
# Install imagemagick
# Then resize/compress images
convert input.jpg -resize 800x800 -quality 85 output.jpg
```

---

## 📊 Monitoring Commands

### Watch Backend Logs
```bash
node server.ts | tee server.log
```

### Watch Web Dev Server
```bash
npm run dev | tee web.log
```

---

## 🔐 Security Commands

### Generate Environment Variables
```bash
# Create .env from template
cp .env.example .env
# Then edit .env with your values
```

---

## 💡 Pro Tips

```bash
# Use nodemon for auto-restart
npm install -g nodemon
nodemon server.ts

# Use concurrently to run multiple commands
npm install -g concurrently
concurrently "node server.ts" "npm run dev"

# Quick test API endpoint
curl http://localhost:3001/health
```

---

## 📚 Help Commands

```bash
# Capacitor help
npx cap --help

# NPM help
npm help

# Node version manager (if using nvm)
nvm list
nvm use 18
```

---

## 🎯 Most Used Commands (Top 10)

1. `node server.ts` - Start backend
2. `npm run dev` - Start web dev server
3. `cd mobile && npm run build` - Build mobile app
4. `npx cap sync` - Sync mobile app
5. `npx cap open android` - Open Android Studio
6. `npm install` - Install dependencies
7. `ipconfig` / `ifconfig` - Get IP address
8. `adb devices` - Check Android device
9. `git add . && git commit -m "message"` - Commit changes
10. `curl http://localhost:3001/health` - Test backend

---

**Save this file for quick reference! 🎯**
