import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { connectDB } from './configs/db.js';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import UserRouter from './routes/user.routes.js';
import { clerkMiddleware } from '@clerk/express';
import pipelineRoutes from './routes/pipelineRoutes.js';
import deploymentRoutes from './routes/deploymentRoutes.js';
import metricsRoutes from './routes/metricsRoutes.js';
import dashboardRoutes from './routes/dashboardRoutes.js';
import sonarqubeRoutes from "./routes/sonarqubeRoutes.js";
import githubRoutes from './routes/githubRoutes.js';
import jenkinsRoutes from './routes/jenkinsRoutes.js';
import integrationRoutes from './routes/integrationRoutes.js';
import { loadEncryptedSecretsIntoEnv } from './utils/secretVault.js';
import grafanaRoutes from "./routes/grafanaRoutes.js";

// Middleware imports
import { notFound, errorHandler } from './middlewares/errorMiddleware.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '.env') });
loadEncryptedSecretsIntoEnv();

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
app.use(express.json({ limit: '1mb', verify: (req, res, buf) => { req.rawBody = Buffer.from(buf); } }));           // Parse JSON bodies and keep raw payload for webhook signatures
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
app.use('/api/v1/dashboard', dashboardRoutes);
app.use('/api/v1/grafana', grafanaRoutes);
app.use('/api/v1/sonarqube', sonarqubeRoutes);
app.use('/api/v1/github', githubRoutes);
app.use('/api/v1/jenkins', jenkinsRoutes);
app.use('/api/v1/integrations', integrationRoutes);
app.use('/api/v1/pipelines', pipelineRoutes);
app.use('/api/v1/deployments', deploymentRoutes);
app.use('/api/v1/metrics', metricsRoutes);

// ─── Error Handling Middleware ────────────────────────────────
// These must be LAST — after all routes
app.use(notFound);      // 404 handler for unmatched routes
app.use(errorHandler);  // Global error handler

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

// ─── Graceful Shutdown ────────────────────────────────────────
// Handles SIGTERM (sent by Docker/Kubernetes on shutdown)
// and SIGINT (Ctrl+C) to close connections cleanly
process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting down gracefully...');
  server.close(() => {
    console.log('HTTP server closed.');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('\nSIGINT received. Shutting down...');
  server.close(() => process.exit(0));
});

// Handle unhandled promise rejections (e.g., DB connection failure)
process.on('unhandledRejection', (err) => {
  console.error('UNHANDLED REJECTION:', err.message);
  server.close(() => process.exit(1));
});

export default app;