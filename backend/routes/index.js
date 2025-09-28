const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();

// Import route modules
const authRoutes = require('./auth');
const eventRoutes = require('./events');
const registrationRoutes = require('./registrations');
const attendanceRoutes = require('./attendance');
const dashboardRoutes = require('./dashboard');

// Health check endpoint
router.get('/health', async (req, res) => {
  try {
    // Check database connection status
    const dbStatus = mongoose.connection.readyState;
    const dbStatusMap = {
      0: 'disconnected',
      1: 'connected',
      2: 'connecting',
      3: 'disconnecting'
    };

    // Get database connection details
    const dbInfo = {
      status: dbStatusMap[dbStatus] || 'unknown',
      host: mongoose.connection.host || 'unknown',
      name: mongoose.connection.name || 'unknown',
      readyState: dbStatus
    };

    // Perform a simple database operation to verify connectivity
    let dbHealthy = false;
    let dbError = null;
    
    if (dbStatus === 1) {
      try {
        // Simple ping to verify database is responsive
        await mongoose.connection.db.admin().ping();
        dbHealthy = true;
      } catch (error) {
        dbError = error.message;
      }
    }

    // Get system information
    const systemInfo = {
      uptime: process.uptime(),
      memory: {
        used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
        total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
        external: Math.round(process.memoryUsage().external / 1024 / 1024)
      },
      nodeVersion: process.version,
      platform: process.platform,
      environment: process.env.NODE_ENV || 'development'
    };

    // Determine overall health status
    const isHealthy = dbHealthy && dbStatus === 1;
    const httpStatus = isHealthy ? 200 : 503;

    const healthResponse = {
      success: isHealthy,
      status: isHealthy ? 'healthy' : 'unhealthy',
      message: 'EvePost Event Management API Health Check',
      timestamp: new Date().toISOString(),
      version: '2.0.0',
      database: {
        ...dbInfo,
        healthy: dbHealthy,
        error: dbError
      },
      system: systemInfo,
      services: {
        api: 'operational',
        database: dbHealthy ? 'operational' : 'degraded'
      }
    };

    res.status(httpStatus).json(healthResponse);
  } catch (error) {
    // Handle any unexpected errors in health check
    res.status(500).json({
      success: false,
      status: 'unhealthy',
      message: 'Health check failed',
      timestamp: new Date().toISOString(),
      version: '2.0.0',
      error: error.message,
      database: {
        status: 'unknown',
        healthy: false,
        error: 'Health check error'
      },
      system: {
        uptime: process.uptime(),
        environment: process.env.NODE_ENV || 'development'
      }
    });
  }
});

// API routes
router.use('/auth', authRoutes);
router.use('/events', eventRoutes);
router.use('/registrations', registrationRoutes);
router.use('/attendance', attendanceRoutes);
router.use('/dashboard', dashboardRoutes);

module.exports = router;