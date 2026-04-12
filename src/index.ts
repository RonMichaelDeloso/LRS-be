import { serve } from '@hono/node-server';
import { serveStatic } from '@hono/node-server/serve-static';
import { Hono } from 'hono';
import authRoutes from './routes/auth.routes.js';
import bookRoutes from './routes/book.routes.js';
import dotenv from 'dotenv';
import loanRoutes from './routes/loan.routes.js';
import reservationRoutes from './routes/reservation.routes.js';
import notificationRoutes from './routes/notification.routes.js';
import { cors } from 'hono/cors';
import fs from 'fs';
import path from 'path';

import pool from './config/db.js';

dotenv.config();

const uploadsDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
}

// Auto-migrate: ensure 'type' column exists in notifications table
async function runMigrations() {
  try {
    await pool.query(`
      ALTER TABLE notifications 
      ADD COLUMN IF NOT EXISTS \`type\` VARCHAR(50) DEFAULT 'general'
    `);
    console.log('✅ Migration: notifications.type column ready.');
  } catch (err: any) {
    // Column may already exist in some MySQL versions that don't support IF NOT EXISTS
    if (!err.message?.includes('Duplicate column')) {
      console.error('Migration warning:', err.message);
    }
  }
}
runMigrations();

const app = new Hono()

app.use('/uploads/*', serveStatic({ root: './' }))

app.use('*', cors({
  origin: (origin) => origin,
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
}));

app.route("/api/auth", authRoutes);
app.route("/api/books", bookRoutes);
app.route("/api/loans", loanRoutes);
app.route("/api/reservations", reservationRoutes);
app.route("/api/notifications", notificationRoutes);

app.get('/', (c) => {
  return c.text('Hello Hono!');
});

serve({
  fetch: app.fetch,
  port: 3000
}, (info) => {
  console.log(`Server is running on http://localhost:${info.port}`)
})
