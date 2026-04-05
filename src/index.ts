import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import authRoutes from './routes/auth.routes.js';
import bookRoutes from './routes/book.routes.js';
import dotenv from 'dotenv';
dotenv.config();

const app = new Hono()

app.route("/api/auth", authRoutes);
app.route("/api/books", bookRoutes);

app.get('/', (c) => {
  return c.text('Hello Hono!')
})

serve({
  fetch: app.fetch,
  port: 3000
}, (info) => {
  console.log(`Server is running on http://localhost:${info.port}`)
})
