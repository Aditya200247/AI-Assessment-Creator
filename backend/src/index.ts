import 'dotenv/config';
import http from 'http';
import express from 'express';
import cors from 'cors';
import { Server as SocketIOServer } from 'socket.io';
import { connectDB } from './config/db';
import { getRedis } from './config/redis';
import { jobEmitter, JOB_EVENTS } from './events/emitter';
import assignmentRoutes from './routes/assignments';
import { startWorker } from './worker';

const PORT = Number(process.env.PORT) || 5000;
const CORS_ORIGIN = process.env.CORS_ORIGIN || 'http://localhost:3000';

async function bootstrap() {
  await connectDB();

  // Initialize Redis connection
  getRedis();

  const app = express();
  app.use(cors({ origin: CORS_ORIGIN, credentials: true }));
  app.use(express.json({ limit: '1mb' }));
  app.use(express.urlencoded({ extended: true }));

  app.get('/health', (_req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  app.use('/api/assignments', assignmentRoutes);

  app.use((_req, res) => {
    res.status(404).json({ error: 'Route not found' });
  });

  const httpServer = http.createServer(app);

  // Socket.io setup
  const io = new SocketIOServer(httpServer, {
    cors: {
      origin: CORS_ORIGIN,
      methods: ['GET', 'POST'],
      credentials: true,
    },
    transports: ['websocket', 'polling'],
  });

  io.on('connection', (socket) => {
    console.log(`Client connected: ${socket.id}`);

    socket.on('join:assignment', (assignmentId: string) => {
      socket.join(`assignment:${assignmentId}`);
    });

    socket.on('disconnect', () => {
      console.log(`Client disconnected: ${socket.id}`);
    });
  });

  // Forward worker events to socket rooms
  jobEmitter.on(JOB_EVENTS.PROGRESS, (data: { assignmentId: string; progress: number; message: string }) => {
    io.to(`assignment:${data.assignmentId}`).emit('job:progress', data);
  });

  jobEmitter.on(JOB_EVENTS.COMPLETE, (data: { assignmentId: string; questionPaper: unknown }) => {
    io.to(`assignment:${data.assignmentId}`).emit('job:complete', data);
    io.emit('assignment:updated', { assignmentId: data.assignmentId, status: 'completed' });
  });

  jobEmitter.on(JOB_EVENTS.ERROR, (data: { assignmentId: string; error: string }) => {
    io.to(`assignment:${data.assignmentId}`).emit('job:error', data);
    io.emit('assignment:updated', { assignmentId: data.assignmentId, status: 'failed' });
  });

  // Start BullMQ worker in-process
  startWorker();

  httpServer.listen(PORT, () => {
    console.log(`\nVedaAI Backend running on http://localhost:${PORT}`);
    console.log(`WebSocket ready on ws://localhost:${PORT}`);
    console.log(`Health check: http://localhost:${PORT}/health\n`);
  });
}

bootstrap().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
