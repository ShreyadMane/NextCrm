import { io } from 'socket.io-client';

export function connectSocket(accessToken) {
  return io(import.meta.env.VITE_API_URL, { auth: { token: accessToken } });
}
