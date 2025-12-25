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
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'error'>('connecting');

  useEffect(() => {
    if (!userData) {
      navigate('/');
    }
  }, [userData, navigate]);

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

  const handleShot = (force: number) => {
    if (isShooting || !userData) return;

    setIsShooting(true);

    const payload: ShotPayload = {
      name: userData.name,
      message: userData.message,
      selfie: userData.selfie,
      force: Math.round(force * 10) / 10,
      timestamp: Date.now(),
    };

    const socket = getSocket();
    socket.emit('shotFired', payload);

    setTimeout(() => {
      navigate('/');
    }, 1000);
  };

  const slingshotState = useNativeSlingshot({
    onShot: handleShot,
    enabled: !isShooting,
  });

  if (!userData) {
    return null;
  }

  return (
    <div className={`slingshot-container ${slingshotState.isCharging ? 'charging' : ''}`}>
      <img src="/logo.png" alt="Logo" className="logo" />
      <div className={`status-dot ${connectionStatus}`} />
    </div>
  );
};
