// Minimal Socket.IO client used by Result/Probability pages
import { io } from 'socket.io-client';

const BASE = process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000';

export const socket = io(BASE, {
  withCredentials: true,
  transports: ['websocket'], // prefer websocket
});
