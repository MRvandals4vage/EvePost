const path = require('path');
// Load env from project root .env first, then fallback to backend/.env
require('dotenv').config({ path: path.resolve(__dirname, '..', '.env') });
require('dotenv').config({ path: path.resolve(__dirname, '.env') });
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
const apiRoutes = require("./routes");
const errorHandler = require("./middleware/errorHandler");
const { errorLogger, requestLogger, performanceMonitor, requestId } = require("./middleware/requestLogger");
const { startEventCleanupTask } = require("./utils/eventCleanup");
const Admin = require("./models/Admin");

const app = express();
const PORT = process.env.PORT || 5001;

// Connect to database
connectDB();

app.set('trust proxy', 1);
app.use(requestId);
app.use(requestLogger);
app.use(performanceMonitor);

// CORS configuration: allow specific origins (configurable via env)
// Use comma-separated list in CORS_ORIGINS, e.g. "http://localhost:3000,https://your-frontend.com"
const allowedOrigins = (process.env.CORS_ORIGINS || 'http://localhost:3000')
  .split(',')
  .map(o => o.trim())
  .filter(Boolean);

const corsOptions = {
  origin: allowedOrigins,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-ID'],
  exposedHeaders: ['X-Request-ID'],
  optionsSuccessStatus: 200 // For legacy browser support
};
app.use(cors(corsOptions));

// Body parsing middleware
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Basic security headers
app.use((req, res, next) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("X-XSS-Protection", "1; mode=block");
  res.removeHeader('X-Powered-By');
  next();
});

// Request timeout (simplified for local development)
app.use((req, res, next) => {
  req.setTimeout(30000); // 30 seconds
  next();
});

// Health check endpoint (before other middleware)
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: process.env.npm_package_version || '2.0.0',
    environment: process.env.NODE_ENV
  });
});

// API routes
app.use("/api", apiRoutes);

// Root endpoint
app.get("/", (req, res) => {
  res.json({
    message: "EvePost",
    version: "2.0.0",
    endpoints: {
      health: "/api/health",
      auth: "/api/auth",
      events: "/api/events",
      registrations: "/api/registrations",
      attendance: "/api/attendance",
      export: "/api/export",
    },
  });
});

// 404 handler with logging
app.use((req, res) => {
  console.warn(`404 Not Found: ${req.method} ${req.originalUrl}`);
  res.status(404).json({
    success: false,
    message: "Endpoint not found",
    path: req.originalUrl
  });
});

// Error logging middleware (before error handler)
app.use(errorLogger);

// Global error handler (must be last middleware)
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  console.log("🚀 STAMPED Event Management System Backend");
  console.log("=".repeat(50));
  console.log(`📍 Server running on port ${PORT}`);
  console.log(`🌐 Environment: ${process.env.NODE_ENV || "development"}`);
  console.log(`📊 API available at http://localhost:${PORT}/api`);
  console.log(`🏥 Health check at http://localhost:${PORT}/api/health`);
  console.log("=".repeat(50));
  console.log("✅ Server initialization complete");
  
  // Start event cleanup task
  startEventCleanupTask();
  
  // Create superadmin user on startup
  
  Admin.createSuperAdmin().catch(err => {
    console.error('Error creating superadmin user:', err);
  });
});
