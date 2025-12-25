import { NavLink, Route, Routes } from "react-router";
import { useEffect, useRef } from "react";
import "./App.css";
import { Registration } from "./pages/Registration";
import { Messages } from "./pages/Messages";
import { BigScreen } from "./pages/BigScreen";
import { initializeSocket } from "./utils/socket";
import { ToastContainer } from "react-toastify";

function App() {
  const socketInitialized = useRef(false);

  // Initialize socket once at app level
  useEffect(() => {
    if (!socketInitialized.current) {
      socketInitialized.current = true;
      const socket = initializeSocket();
      console.log('Socket initialized in App component');
      
      // Log connection status
      socket.on('connect', () => {
        console.log('App: Socket connected with ID:', socket.id);
      });
    }
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <ToastContainer />
      <header className="bg-white shadow-sm">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <h1 className="text-xl font-bold">Sling Shot</h1>
          <nav className="flex items-center gap-4 text-sm font-medium">
            <NavLink
              to="/"
              end
              className={({ isActive }) =>
                `px-3 py-1 rounded-md transition ${
                  isActive
                    ? "bg-indigo-600 text-white"
                    : "text-slate-700 hover:bg-indigo-50"
                }`
              }
            >
              Send Message
            </NavLink>
            <NavLink
              to="/messages"
              className={({ isActive }) =>
                `px-3 py-1 rounded-md transition ${
                  isActive
                    ? "bg-indigo-600 text-white"
                    : "text-slate-700 hover:bg-indigo-50"
                }`
              }
            >
              Live Feed
            </NavLink>
          </nav>
        </div>
      </header>

      <main>
        <Routes>
          <Route path="/" element={<Registration />} />
          <Route path="/messages" element={<Messages />} />
          <Route path="/bigscreen" element={<BigScreen />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
