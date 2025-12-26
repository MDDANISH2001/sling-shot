import { io, Socket } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_API_SOCKET_URL || '';
// const SOCKET_URL = 'https://kg45xxml-3001.inc1.devtunnels.ms';
// const SOCKET_URL =  'http://192.168.0.134:3001';

let socket: Socket | null = null;
let isInitializing = false;
let connectionAttempts = 0;

export const initializeSocket = (): Socket => {
  // If socket exists and is connected, return it
  if (socket?.connected) {
    console.log('Reusing existing socket connection');
    return socket;
  }

  // If socket exists but disconnected, reconnect it
  if (socket && !socket.connected && !isInitializing) {
    console.log('Reconnecting existing socket');
    socket.connect();
    return socket;
  }

  // Prevent multiple simultaneous initializations
  if (isInitializing && socket) {
    console.log('Socket initialization already in progress');
    return socket;
  }

  // If we already have a socket instance, don't create a new one
  if (socket) {
    console.log('Socket instance already exists, returning it');
    return socket;
  }

  connectionAttempts++;
  console.log(`Creating new socket connection (attempt ${connectionAttempts})`);
  isInitializing = true;

  socket = io(SOCKET_URL, {
    transports: ['websocket', 'polling'],
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    reconnectionAttempts: 5,
    autoConnect: true,
    forceNew: false,
    timeout: 20000,
    upgrade: true,
  });

  socket.on('connect', () => {
    console.log('✓ Connected to server with socket ID:', socket?.id);
    isInitializing = false;
  });

  socket.on('disconnect', (reason) => {
    console.log('✗ Disconnected from server:', reason);
    if (reason === 'io client disconnect') {
      console.warn('Client initiated disconnect - this should not happen during normal operation');
    }
    isInitializing = false;
  });

  socket.on('connect_error', (error) => {
    console.error('Connection error:', error.message);
    isInitializing = false;
  });

  socket.on('error', (error) => {
    console.error('Socket error:', error);
  });

  return socket;
};

export const getSocket = (): Socket | null => {
  return socket;
};

export const closeSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};
