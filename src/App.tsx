import { Route, Routes } from "react-router";
import { useEffect, useRef } from "react";
import "./App.css";
import { BigScreen } from "./pages/BigScreen";
import { initializeSocket } from "./utils/socket";

function App() {
  const socketInitialized = useRef(false);

  // Initialize socket once at app level
  useEffect(() => {
    if (!socketInitialized.current) {
      socketInitialized.current = true;
      const socket = initializeSocket();
      console.log("Socket initialized in App component");

      // Log connection status
      socket.on("connect", () => {
        console.log("App: Socket connected with ID:", socket.id);
      });
    }
  }, []);

  return (
    <div className="min-h-screen bg-slate-900">
      <main>
        <Routes>
          <Route path="/" element={<BigScreen />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
