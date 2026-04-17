/**
 * Global error handler middleware.
 * Returns consistent JSON error shape per PRD Section 5.1.
 */
const errorHandler = (err, req, res, _next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  const response = {
    success: false,
    message,
  };

  // Only expose stack/technical detail in development
  if (process.env.NODE_ENV === 'development') {
    response.error = err.stack;
  }

  console.error(`❌ [${statusCode}] ${message}`);

  res.status(statusCode).json(response);
};

/**
 * Custom AppError class for throwing HTTP errors from controllers/services.
 */
class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = { errorHandler, AppError };
