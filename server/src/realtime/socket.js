const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');

let io;

function initSocket(httpServer) {
  io = new Server(httpServer, { 
    cors: { 
      origin: [
        process.env.FRONTEND_URL,
        "http://localhost:5173",
        "http://127.0.0.1:5173"
      ].filter(Boolean)
    } 
  });

  io.use((socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      const payload = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
      socket.userId = payload.sub;
      next();
    } catch {
      next(new Error('Unauthorized'));
    }
  });

  io.on('connection', (socket) => {
    socket.join(`user:${socket.userId}`);
    socket.on('disconnect', () => {});
  });

  return io;
}

module.exports = { initSocket, get io() { return io; } };
