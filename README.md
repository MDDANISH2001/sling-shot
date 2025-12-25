# 🎯 Slingshot - Real-time Message Slinging System

A complete real-time messaging system where users can "sling" messages from their mobile device to a big screen display using motion gestures!

## 🚀 What is This?

Slingshot is a three-part system:
1. **Mobile App** (React + Capacitor) - Users capture selfies, write messages, and physically "throw" them
2. **Backend** (Node.js + Socket.io) - Handles real-time message routing and storage
3. **Big Screen** (React Web) - Displays flying messages with physics-based animations

## ⚡ Quick Start

### 1. Mobile App Setup (5 minutes)
```bash
cd mobile
npm install
npm run build
npx cap add android
npx cap sync
npx cap open android
# Click Run in Android Studio
```

**Full guide:** See [`mobile/QUICKSTART.md`](mobile/QUICKSTART.md)

### 2. Backend Setup
```bash
npm install
node server.ts
```

### 3. Big Screen
Open browser: `http://localhost:5173/bigscreen`

## 📖 Documentation

- **[PROJECT_OVERVIEW.md](PROJECT_OVERVIEW.md)** - Complete system overview
- **[SETUP_CHECKLIST.md](SETUP_CHECKLIST.md)** - Step-by-step setup checklist
- **[FOLDER_STRUCTURE.md](FOLDER_STRUCTURE.md)** - Detailed folder organization
- **[mobile/README.md](mobile/README.md)** - Complete mobile app setup guide
- **[mobile/ARCHITECTURE.md](mobile/ARCHITECTURE.md)** - Technical deep dive

## 🎮 How It Works

```
User on Mobile                    Backend                    Big Screen
──────────────                    ───────                    ──────────
1. Take selfie 📷
2. Enter name & message
3. Pull phone backward ⬅️
4. Throw forward! ⏩
                        ───────>  Receives shot
                                  Saves to DB
                                  ────────>   Message flies in! 🎉
                                              Animation plays
                                              Shows in grid
```

## 🛠️ Tech Stack

- **Mobile:** React, TypeScript, Capacitor, Motion & Camera plugins
- **Backend:** Node.js, Express, Socket.io, MongoDB
- **Big Screen:** React, TypeScript, CSS Animations
- **Storage:** MongoDB + AWS S3 (or local)

## ✨ Features

### Mobile App
- ✅ Native camera access (selfie)
- ✅ Real-time accelerometer motion detection
- ✅ Pull-back & release gesture recognition
- ✅ Force calculation from throw speed
- ✅ Beautiful UI with animations
- ✅ Real-time Socket.io communication

### Backend
- ✅ Socket.io event handling
- ✅ MongoDB message storage
- ✅ Image upload (S3 or local)
- ✅ Real-time message broadcasting

### Big Screen
- ✅ Real-time message display
- ✅ Physics-based animations
- ✅ Force affects animation speed
- ✅ Message history grid
- ✅ Smooth transitions

## 📱 Requirements

- Node.js 18+
- MongoDB (local or Atlas)
- Android Studio (for Android)
- Xcode (for iOS, macOS only)
- Physical mobile device recommended

## 🎯 Project Structure

```
sling-shot/
├── mobile/              NEW: Capacitor mobile app
├── src/pages/          
│   └── BigScreen.tsx    NEW: Display component
├── server.ts            UPDATED: Added shotFired handler
└── uploads/             Image storage
```

## 🚀 Development

### Start Backend
```bash
npm install
node server.ts
```

### Start Web Dev Server
```bash
npm run dev
```

### Build Mobile App
```bash
cd mobile
npm run build
npx cap sync
```

## 📊 Current Status

✅ **Production Ready**

- All components fully implemented
- Complete documentation (15,000+ words)
- Tested workflow
- Build instructions included

## 🤝 Contributing

This is a complete implementation. Feel free to:
- Add new features
- Improve animations
- Enhance UI
- Add sound effects
- Create leaderboards

## 📄 License

MIT License - feel free to use and modify!

---

## 🎓 Original Vite + React Template Info

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```
