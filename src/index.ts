import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import authRoutes from './routes/auth.routes.js';
import bookRoutes from './routes/book.routes.js';
import dotenv from 'dotenv';
import loanRoutes from './routes/loan.routes.js';
import reservationRoutes from './routes/reservation.routes.js';
import { cors } from 'hono/cors';
dotenv.config();

const app = new Hono()

app.use('*', cors({
  origin: (origin) => origin,
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
}));

app.route("/api/auth", authRoutes);
app.route("/api/books", bookRoutes);
app.route("/api/loans", loanRoutes);
app.route("/api/reservations", reservationRoutes);

app.get('/', (c) => {
  return c.text('Hello Hono!');
});

serve({
  fetch: app.fetch,
  port: 3000
}, (info) => {
  console.log(`Server is running on http://localhost:${info.port}`)
})
