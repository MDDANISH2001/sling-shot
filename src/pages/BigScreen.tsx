import React, { useState, useEffect } from "react";
import { initializeSocket } from "../utils/socket";
import "./BigScreen.css";

interface Shot {
  id: string;
  userName: string;
  message: string;
  imageUrl: string;
  force: number;
  timestamp: number;
  createdAt: Date;
  x: number;
  y: number;
  backgroundImage: string;
}

// Helper function to check if positions overlap (working in percentage space)
const checkOverlap = (
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  minDistancePercent = 25 // Minimum 25% distance between shots (approximately 400px card width on 1600px screen)
) => {
  const distance = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
  return distance < minDistancePercent;
};

// Generate random position that doesn't overlap with existing shots
const generateRandomPosition = (existingShots: Shot[]) => {
  const maxAttempts = 100; // Increased attempts
  
  for (let i = 0; i < maxAttempts; i++) {
    // More varied positioning across entire screen
    const x = Math.random() * 85 + 5; // 5% to 90% - wider range
    const y = Math.random() * 80 + 10; // 10% to 90% - wider range

    const overlaps = existingShots.some((shot) =>
      checkOverlap(x, y, shot.x, shot.y, 25)
    );

    if (!overlaps) {
      return { x, y };
    }
  }

  // Fallback: use grid-based positioning if random fails
  const gridCols = 5;
  const gridRows = 4;
  const cellWidth = 80 / gridCols;
  const cellHeight = 70 / gridRows;
  
  // Find first available grid cell
  for (let row = 0; row < gridRows; row++) {
    for (let col = 0; col < gridCols; col++) {
      const x = 10 + col * cellWidth + cellWidth / 2 + (Math.random() * 5 - 2.5);
      const y = 15 + row * cellHeight + cellHeight / 2 + (Math.random() * 5 - 2.5);
      
      const overlaps = existingShots.some((shot) =>
        checkOverlap(x, y, shot.x, shot.y, 20) // Slightly more lenient for grid
      );
      
      if (!overlaps) {
        return { x, y };
      }
    }
  }

  // Last resort: random position
  return {
    x: Math.random() * 85 + 5,
    y: Math.random() * 80 + 10,
  };
};

export const BigScreen: React.FC = () => {
  const [shots, setShots] = useState<Shot[]>([]);
  // Select random background image on mount
  // const [backgroundImage, setBackgroundImage] = useState<string>("/background/1.png");

  useEffect(() => {
    const socket = initializeSocket();

    socket.on("displayShot", (data: any) => {
      console.log("🎯 Shot received:", data);

      setShots((prev) => {
        // Generate position based on current shots state (prevents stale closure)
        const { x, y } = generateRandomPosition(prev);
        const background = `/background/${Math.floor(Math.random() * 5) + 1}.png`;
        
        const newShot: Shot = {
          id: data.id,
          userName: data.userName,
          message: data.message,
          imageUrl: data.imageUrl,
          force: data.force || 5,
          timestamp: data.timestamp,
          createdAt: new Date(data.createdAt),
          x,
          y,
          backgroundImage: background,
        };

        return [newShot, ...prev].slice(0, 15); // Keep max 15 shots
      });
    });

    return () => {
      socket.off("displayShot");
    };
  }, []); // Empty dependency array - socket listener doesn't need to re-register

  return (
    <div className="big-screen-container" style={{}}>
      {/* Logo */}
      <div className="logo-container">
        <img src="/logo.png" alt="Slingshot Logo" className="logo" />
      </div>

      {/* Randomly Positioned Shots */}
      {shots.map((shot) => (
        <div
          key={shot.id}
          className="shot-bubble"
          style={{
            left: `${shot.x}%`,
            top: `${shot.y}%`,
            zIndex: shots.length - shots.indexOf(shot),
            backgroundImage: shot.backgroundImage
              ? `url(${shot.backgroundImage})`
              : "none",
            backgroundRepeat: "no-repeat",
            backgroundSize: "contain",
          }}
        >
          <div className="shot-image-circle">
            <img
              src={shot.imageUrl}
              alt={shot.userName}
              className="shot-avatar"
            />
          </div>
          <div className="shot-info">
            <h3 className="shot-name">{shot.userName}</h3>
            <p className="shot-message">{shot.message}</p>
          </div>
        </div>
      ))}

      {/* Empty State */}
      {shots.length === 0 && (
        <div className="empty-state">
          <div className="empty-icon">📱</div>
          <h2>Waiting for shots...</h2>
          <p>Fire away from your mobile device!</p>
        </div>
      )}
    </div>
  );
};
