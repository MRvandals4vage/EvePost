// Simple error handling without external logger

/**
 * Global error handling middleware
 * Handles different types of errors and returns consistent error responses
 */
const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // Log error
  console.error(`❌ ${err.name}: ${err.message}`);
  if (process.env.NODE_ENV === 'development') {
    console.error(`Stack: ${err.stack}`);
    console.error(`URL: ${req.method} ${req.originalUrl}`);
    console.error(`IP: ${req.ip}`);
  }

  // Mongoose bad ObjectId
  if (err.name === 'CastError') {
    const message = 'Resource not found';
    error = { message, statusCode: 404 };
  }

  // Mongoose duplicate key error
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    const value = err.keyValue[field];
    const message = `Duplicate value for ${field}: ${value}. Please use another value.`;
    error = { message, statusCode: 409 };
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map(val => {
      let message = val.message;
      
      // Customize validation messages for better user experience
      if (val.kind === 'required') {
        message = `${val.path} is required`;
      } else if (val.kind === 'unique') {
        message = `${val.path} must be unique`;
      } else if (val.kind === 'min') {
        message = `${val.path} must be at least ${val.properties.min}`;
      } else if (val.kind === 'max') {
        message = `${val.path} must be at most ${val.properties.max}`;
      } else if (val.kind === 'minlength') {
        message = `${val.path} must be at least ${val.properties.minlength} characters long`;
      } else if (val.kind === 'maxlength') {
        message = `${val.path} must be at most ${val.properties.maxlength} characters long`;
      } else if (val.kind === 'enum') {
        message = `${val.path} must be one of: ${val.properties.enumValues.join(', ')}`;
      }
      
      return {
        field: val.path,
        message: message,
        value: val.value
      };
    });
    
    const message = 'Validation failed';
    error = { message, statusCode: 400, errors };
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    const message = 'Invalid token. Please log in again.';
    error = { message, statusCode: 401 };
  }

  if (err.name === 'TokenExpiredError') {
    const message = 'Token expired. Please log in again.';
    error = { message, statusCode: 401 };
  }

  // Rate limiting error
  if (err.status === 429) {
    const message = 'Too many requests. Please try again later.';
    error = { message, statusCode: 429 };
  }

  // Default to 500 server error
  const statusCode = error.statusCode || 500;
  const message = error.message || 'Internal server error';

  // Prepare error response
  const errorResponse = {
    success: false,
    message
  };

  // Add validation errors if present
  if (error.errors) {
    errorResponse.errors = error.errors;
  }

  // Add stack trace in development
  if (process.env.NODE_ENV === 'development') {
    errorResponse.stack = err.stack;
  }

  res.status(statusCode).json(errorResponse);
};

module.exports = errorHandler;