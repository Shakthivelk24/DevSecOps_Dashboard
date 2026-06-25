import express from 'express';
import dotenv from 'dotenv';
import { connectDB } from './configs/db.js';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import UserRouter from './routes/user.routes.js';
import { clerkMiddleware } from '@clerk/express';

dotenv.config();

await connectDB(); // Wait for the database connection to be established

const app = express();
app.use(cors());
app.use(helmet());
// In production, restrict to specific domains
app.use(cors({
  origin: process.env.CORS_ORIGIN?.split(',') || 'http://localhost:5173',
  credentials: true,               // Allow cookies to be sent cross-origin
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json({ limit: '10kb' }));           // Parse JSON bodies (max 10KB)
app.use(express.urlencoded({ extended: true }));    // Parse URL-encoded bodies
app.use(clerkMiddleware());

// ─── HTTP Request Logger ──────────────────────────────────────
// morgan: Logs every request: METHOD URL STATUS RESPONSE_TIME
// 'dev' format: colored, compact — great for development
// Use 'combined' in production for Apache-style logs
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// ─── Health Check Endpoint ────────────────────────────────────
// Used by Docker HEALTHCHECK, Kubernetes liveness probes,
// and load balancers to verify the service is alive
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV,
    version: process.env.npm_package_version || '1.0.0',
  });
});

app.use('/api/v1/users', UserRouter);


const PORT = process.env.PORT || 5000;
app.get('/', (req, res) => {
  res.send('Server is running');
} );

// ─── Start Server ─────────────────────────────────────────────
const server = app.listen(PORT, () => {
  console.log(`
  ╔═══════════════════════════════════════════╗
  ║   DevOps Pipeline Dashboard — API Server  ║
  ║   Mode     : ${process.env.NODE_ENV?.padEnd(27)}║
  ║   Port     : ${String(PORT).padEnd(27)}║
  ║   DB       : MongoDB Connected            ║
  ╚═══════════════════════════════════════════╝
  `);
});
