import http from 'http';
import dotenv from 'dotenv';
import { Server as SocketIOServer } from 'socket.io';
import app from './app';
import { connectDB } from './config/db';
import { ensureSuperAdmin } from './seeds/ensureSuperAdmin';

dotenv.config();

const PORT = process.env.PORT || 5000;

const server = http.createServer(app);

const io = new SocketIOServer(server, {
  cors: {
    origin: process.env.CLIENT_URL || '*',
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  },
});

io.on('connection', (socket) => {
  console.log(`[Socket.io] Client connected: ${socket.id}`);

  socket.on('join_user', (userId: string) => {
    socket.join(`user_${userId}`);
    console.log(`[Socket.io] Socket ${socket.id} joined user_${userId}`);
  });

  socket.on('disconnect', () => {
    console.log(`[Socket.io] Client disconnected: ${socket.id}`);
  });
});

export { io };

connectDB().then(async () => {
  // Production Safe Startup Check: Ensure Super Admin & Page permissions exist
  await ensureSuperAdmin();

  server.listen(PORT, () => {
    console.log(`[Server] Campaign Command Center Backend running on port ${PORT}`);
  });
});
