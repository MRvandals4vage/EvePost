// Performance monitoring middleware
const performanceMonitor = (req, res, next) => {
  const startTime = Date.now();
  
  // Store original end function
  const originalEnd = res.end;
  
  // Override end function to capture metrics
  res.end = function(...args) {
    const endTime = Date.now();
    const responseTime = endTime - startTime;
    
    // Log slow requests as warnings
    if (responseTime > 2000) {
      console.warn(`⚠️ Slow request: ${req.method} ${req.originalUrl} - ${responseTime}ms`);
    }
    
    // Log very slow requests as errors
    if (responseTime > 5000) {
      console.error(`🐌 Very slow request: ${req.method} ${req.originalUrl} - ${responseTime}ms`);
    }
    
    // Call original end function
    originalEnd.apply(this, args);
  };
  
  next();
};

// Request ID middleware for tracing
const requestId = (req, res, next) => {
  req.requestId = Math.random().toString(36).substr(2, 9);
  res.setHeader('X-Request-ID', req.requestId);
  next();
};

// Error request logging
const errorLogger = (err, req, res, next) => {
  console.error(`❌ Request error: ${err.message}`);
  if (process.env.NODE_ENV === 'development') {
    console.error(`Stack: ${err.stack}`);
    console.error(`URL: ${req.method} ${req.originalUrl}`);
    console.error(`IP: ${req.ip}`);
  }
  next(err);
};

// Simple request logger without Morgan
const createRequestLogger = () => {
  return (req, res, next) => {
    // Skip logging for health check endpoint to reduce noise
    if (req.originalUrl === '/api/health') {
      return next();
    }

    const startTime = Date.now();
    
    // Store original end function
    const originalEnd = res.end;
    
    // Override end function to log request
    res.end = function(...args) {
      const endTime = Date.now();
      const responseTime = endTime - startTime;
      
      // Simple request logging
      if (process.env.NODE_ENV === 'development') {
        console.log(`📡 ${req.method} ${req.originalUrl} ${res.statusCode} ${responseTime}ms`);
      }
      
      // Call original end function
      originalEnd.apply(this, args);
    };
    
    next();
  };
};

module.exports = {
  requestLogger: createRequestLogger(),
  performanceMonitor,
  requestId,
  errorLogger
};