import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';

import authRoutes from './routes/auth.routes';
import userRoutes from './routes/user.routes';
import roleRoutes from './routes/role.routes';
import permissionRoutes from './routes/permission.routes';
import pageRoutes from './routes/page.routes';
import menuRoutes from './routes/menu.routes';
import taskRoutes from './routes/task.routes';
import deliverableRoutes from './routes/deliverable.routes';
import kpiRoutes from './routes/kpi.routes';
import budgetRoutes from './routes/budget.routes';
import notificationRoutes from './routes/notification.routes';

const app: Express = express();

// Parse allowed origins dynamically from environment variable
const allowedOrigins = (process.env.ALLOWED_ORIGINS || 'http://localhost:3000')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(null, true);
    }
  },
  credentials: true,
}));

app.use(cookieParser(process.env.COOKIE_SECRET || 'cookie_secret_fallback'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Register Modules
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/roles', roleRoutes);
app.use('/api/permissions', permissionRoutes);
app.use('/api/pages', pageRoutes);
app.use('/api/menus', menuRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/deliverables', deliverableRoutes);
app.use('/api/kpis', kpiRoutes);
app.use('/api/budget', budgetRoutes);
app.use('/api/notifications', notificationRoutes);

import mongoose from 'mongoose';

// Healthcheck
app.get('/api/health', (req: Request, res: Response) => {
  const dbState = mongoose.connection.readyState;
  // 0: disconnected, 1: connected, 2: connecting, 3: disconnecting
  const isConnected = dbState === 1;

  if (!isConnected) {
    return res.status(503).json({
      success: false,
      dbConnected: false,
      dbState,
      message: 'Database connection is not ready. Service unavailable.',
      timestamp: new Date().toISOString(),
    });
  }

  res.json({
    success: true,
    dbConnected: true,
    dbState,
    system: 'Masters Expo 2026 Campaign Command Center API',
    env: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString(),
  });
});

// Global Error Handler
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error('[API Error]:', err.stack || err.message);
  res.status(500).json({
    success: false,
    message: err.message || 'Internal Server Error',
  });
});

export default app;
