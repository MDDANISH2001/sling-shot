import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useNativeSlingshot } from "../hooks/useNativeSlingshot";
import { getSocket } from "../lib/socket";
import { ShotPayload } from "../types";
import "./UserInfo.css";

interface LocationState {
  selfie: string;
}

export const UserInfo: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { selfie } = (location.state as LocationState) || {};

  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [isReady, setIsReady] = useState(false);
  const [isShooting, setIsShooting] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'error'>('connecting');

  // Redirect if no selfie
  useEffect(() => {
    if (!selfie) {
      navigate('/');
    }
  }, [selfie, navigate]);

  // Socket connection
  useEffect(() => {
    const socket = getSocket();

    socket.on('connect', () => {
      setConnectionStatus('connected');
    });

    socket.on('disconnect', () => {
      setConnectionStatus('error');
    });

    socket.on('connect_error', () => {
      setConnectionStatus('error');
    });

    return () => {
      socket.off('connect');
      socket.off('disconnect');
      socket.off('connect_error');
    };
  }, []);

  const handleContinue = () => {
    if (!name.trim() || !message.trim()) return;
    setIsReady(true);
  };

  const handleShot = (force: number) => {
    if (isShooting) return;

    setIsShooting(true);

    const payload: ShotPayload = {
      name: name.trim(),
      message: message.trim(),
      selfie,
      force: Math.round(force * 10) / 10,
      timestamp: Date.now(),
    };

    const socket = getSocket();
    socket.emit('shotFired', payload);

    // Show success and return to start
    setTimeout(() => {
      navigate('/');
    }, 1500);
  };

  const slingshotState = useNativeSlingshot({
    onShot: handleShot,
    enabled: isReady && !isShooting,
  });

  if (!selfie) return null;

  return (
    <div className={`user-info-container ${isReady ? 'ready-mode' : ''} ${slingshotState.isCharging ? 'charging' : ''} ${isShooting ? 'shooting' : ''}`}>
      {/* Logo */}
      <img src="/logo.png" alt="Logo" className="logo" />

      {/* Connection Status */}
      <div className={`status-badge ${connectionStatus}`}>
        {connectionStatus === 'connecting' && '🔄 Connecting...'}
        {connectionStatus === 'connected' && '✅ Connected'}
        {connectionStatus === 'error' && '⚠️ No Connection'}
      </div>

      {!isReady ? (
        /* Form Mode */
        <div className="form-container">
          <div className="preview-circle">
            <img src={selfie} alt="Preview" className="preview-image" />
          </div>

          <h2 className="heading">👋 Let's get to know you!</h2>

          <div className="form-card">
            <div className="input-wrapper">
              <label className="label">Your Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your name"
                className="input"
                maxLength={50}
              />
            </div>

            <div className="input-wrapper">
              <label className="label">Your Message</label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="What would you like to say?"
                className="textarea"
                rows={4}
                maxLength={200}
              />
              <span className="char-count">{message.length}/200</span>
            </div>

            <button
              onClick={handleContinue}
              disabled={!name.trim() || !message.trim()}
              className="continue-button"
            >
              Continue 🎯
            </button>
          </div>
        </div>
      ) : (
        /* Slingshot Mode */
        <div className="slingshot-mode">
          {isShooting ? (
            <div className="success-animation">
              <div className="success-icon">🚀</div>
              <h2>Message Sent!</h2>
              <p>Flying to the big screen...</p>
            </div>
          ) : (
            <>
              <div className="preview-card">
                <img src={selfie} alt={name} className="preview-img" />
                <div className="preview-info">
                  <h3>{name}</h3>
                  <p>{message}</p>
                </div>
              </div>

              <div className="instruction-box">
                <h2>🎯 Ready to Launch!</h2>
                <p className="instruction-text">
                  Make a quick <strong>swing motion</strong> with your phone
                </p>
                <p className="instruction-hint">
                  Like throwing a slingshot! 🏹
                </p>
              </div>

              <button onClick={() => setIsReady(false)} className="back-button">
                ← Edit Details
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
};
