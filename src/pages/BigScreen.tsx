import React, { useState, useEffect } from 'react';
import { initializeSocket } from '../utils/socket';
import './BigScreen.css';

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
  scale: number;
  rotation: number;
}

export const BigScreen: React.FC = () => {
  const [shots, setShots] = useState<Shot[]>([]);
  const [activeShot, setActiveShot] = useState<Shot | null>(null);

  useEffect(() => {
    const socket = initializeSocket();

    socket.on('displayShot', (data: any) => {
      console.log('🎯 Shot received:', data);

      // Calculate animation parameters based on force
      const force = data.force || 5;
      const startX = Math.random() * 20 - 10; // -10 to 10%
      const startY = 120; // Start from bottom
      const endX = 50 + (Math.random() * 30 - 15); // 35-65%
      const endY = 50 + (Math.random() * 20 - 10); // 40-60%

      const newShot: Shot = {
        id: data.id,
        userName: data.userName,
        message: data.message,
        imageUrl: data.imageUrl,
        force,
        timestamp: data.timestamp,
        createdAt: new Date(data.createdAt),
        x: startX,
        y: startY,
        scale: 0,
        rotation: 0,
      };

      setActiveShot(newShot);

      // Animate the shot
      setTimeout(() => {
        setActiveShot(prev => 
          prev ? { ...prev, x: endX, y: endY, scale: 1, rotation: 360 } : null
        );
      }, 50);

      // Add to shots list and clear active after animation
      setTimeout(() => {
        setShots(prev => [newShot, ...prev].slice(0, 20));
        setActiveShot(null);
      }, 2000 + (force * 100));
    });

    return () => {
      socket.off('displayShot');
    };
  }, []);

  return (
    <div className="big-screen-container">
      {/* Background */}
      <div className="background-gradient"></div>

      {/* Header */}
      <div className="header">
        <h1 className="title">🎯 Slingshot Live!</h1>
        <p className="subtitle">Messages flying in real-time</p>
      </div>

      {/* Active Shot Animation */}
      {activeShot && (
        <div
          className="active-shot"
          style={{
            left: `${activeShot.x}%`,
            top: `${activeShot.y}%`,
            transform: `translate(-50%, -50%) scale(${activeShot.scale}) rotate(${activeShot.rotation}deg)`,
            transitionDuration: `${1 + activeShot.force * 0.2}s`,
          }}
        >
          <div className="shot-card flying">
            <img src={activeShot.imageUrl} alt={activeShot.userName} className="shot-image" />
            <div className="shot-content">
              <h3 className="shot-name">{activeShot.userName}</h3>
              <p className="shot-message">{activeShot.message}</p>
              <div className="shot-force">
                Force: {activeShot.force.toFixed(1)} 🚀
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Recent Shots Grid */}
      <div className="shots-grid">
        {shots.map((shot) => (
          <div key={shot.id} className="shot-card">
            <img src={shot.imageUrl} alt={shot.userName} className="shot-image" />
            <div className="shot-content">
              <h3 className="shot-name">{shot.userName}</h3>
              <p className="shot-message">{shot.message}</p>
              <div className="shot-meta">
                <span className="shot-force">⚡ {shot.force.toFixed(1)}</span>
                <span className="shot-time">
                  {new Date(shot.createdAt).toLocaleTimeString()}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {shots.length === 0 && !activeShot && (
        <div className="empty-state">
          <div className="empty-icon">📱</div>
          <h2>Waiting for shots...</h2>
          <p>Fire away from your mobile device!</p>
        </div>
      )}
    </div>
  );
};
