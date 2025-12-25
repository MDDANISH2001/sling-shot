import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useNativeSlingshot } from '../hooks/useNativeSlingshot';
import { getSocket } from '../lib/socket';
import { UserData, ShotPayload } from '../types';
import './Slingshot.css';

export const Slingshot: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const userData = location.state as UserData | null;

  const [isShooting, setIsShooting] = useState(false);
  const [shotSuccess, setShotSuccess] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'error'>('connecting');

  // Redirect if no user data
  useEffect(() => {
    if (!userData) {
      navigate('/');
    }
  }, [userData, navigate]);

  // Initialize socket connection
  useEffect(() => {
    const socket = getSocket();

    socket.on('connect', () => {
      console.log('✅ Socket connected:', socket.id);
      setConnectionStatus('connected');
    });

    socket.on('disconnect', () => {
      console.log('❌ Socket disconnected');
      setConnectionStatus('error');
    });

    socket.on('connect_error', (err) => {
      console.error('❌ Connection error:', err.message);
      setConnectionStatus('error');
    });

    socket.on('shotSuccess', (data) => {
      console.log('✅ Shot confirmed by server:', data);
    });

    socket.on('error', (err) => {
      console.error('❌ Server error:', err.message);
    });

    return () => {
      socket.off('connect');
      socket.off('disconnect');
      socket.off('connect_error');
      socket.off('shotSuccess');
      socket.off('error');
    };
  }, []);

  const handleShot = (force: number) => {
    if (isShooting || !userData) return;

    setIsShooting(true);

    const payload: ShotPayload = {
      name: userData.name,
      message: userData.message,
      selfie: userData.selfie,
      force: Math.round(force * 10) / 10, // Round to 1 decimal
      timestamp: Date.now(),
    };

    console.log('🚀 SENDING SHOT TO SERVER:', payload.name, 'force:', payload.force);
    
    const socket = getSocket();
    
    socket.emit('shotFired', payload);
    console.log('✅ Shot emitted to server');

    // Show success animation
    setTimeout(() => {
      setShotSuccess(true);
      
      // Navigate back after success
      setTimeout(() => {
        navigate('/');
      }, 2000);
    }, 500);
  };

  const slingshotState = useNativeSlingshot({
    onShot: handleShot,
    enabled: !isShooting && !shotSuccess,
  });

  if (!userData) {
    return null;
  }

  return (
    <div className={`slingshot-container ${slingshotState.isCharging ? 'charging' : ''} ${shotSuccess ? 'success' : ''}`}>
      {/* Connection Status */}
      <div className={`connection-status ${connectionStatus}`}>
        {connectionStatus === 'connecting' && '🔄 Connecting...'}
        {connectionStatus === 'connected' && '✅ Connected'}
        {connectionStatus === 'error' && '❌ Connection Error'}
      </div>

      {/* Preview Card */}
      <div className="preview-card">
        <img src={userData.selfie} alt={userData.name} className="preview-image" />
        <div className="preview-content">
          <h2 className="preview-name">{userData.name}</h2>
          <p className="preview-message">{userData.message}</p>
        </div>
      </div>

      {/* Slingshot Instructions */}
      {!isShooting && !shotSuccess && (
        <div className="instructions">
          {!slingshotState.isReady && (
            <div className="status-box warning">
              <h3>⚠️ Motion Not Ready</h3>
              <p>Make sure motion sensors are enabled</p>
            </div>
          )}

          {slingshotState.error && (
            <div className="status-box error">
              <h3>❌ Error</h3>
              <p>{slingshotState.error}</p>
            </div>
          )}

          {slingshotState.isReady && !slingshotState.error && (
            <>
              <div className="status-box ready">
                <h3>📱 Ready to Launch</h3>
                <ol className="instruction-list">
                  <li>Make a quick <strong>swing/flick</strong> motion</li>
                  <li>Like throwing a slingshot!</li>
                </ol>
                <p className="tip">💡 One quick motion, any direction</p>
              </div>
            </>
          )}
        </div>
      )}

      {/* Shooting Animation */}
      {isShooting && (
        <div className="shooting-overlay">
          <div className="shooting-content">
            <div className="rocket-icon">🚀</div>
            <h2>Launching...</h2>
          </div>
        </div>
      )}

      {/* Success Animation */}
      {shotSuccess && (
        <div className="success-overlay">
          <div className="success-content">
            <div className="success-icon">🎉</div>
            <h2>Shot Fired!</h2>
            <p>Your message is on the big screen!</p>
          </div>
        </div>
      )}

      {/* Charging Indicator */}
      {slingshotState.isCharging && !isShooting && (
        <div className="charging-indicator">
          <div className="target-icon">🎯</div>
        </div>
      )}

      {/* Debug Info (optional, remove in production) */}
      <div className="debug-info">
        <p>Ready: {slingshotState.isReady ? '✅' : '❌'}</p>
        <p>Charging: {slingshotState.isCharging ? '✅' : '❌'}</p>
        <p>Force: {slingshotState.force.toFixed(1)}</p>
      </div>

      {/* Back Button */}
      {!isShooting && !shotSuccess && (
        <button onClick={() => navigate('/')} className="back-button">
          ← Back
        </button>
      )}
    </div>
  );
};
