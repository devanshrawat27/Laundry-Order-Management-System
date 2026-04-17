const { AppError } = require('./errorHandler');

/**
 * Basic Auth Middleware
 * Protects endpoints based on Authorization: Basic base64(user:pass)
 * Requires AUTH_USERNAME and AUTH_PASSWORD in .env
 */
const basicAuth = (req, res, next) => {
  const authHeader = req.headers['authorization'] || req.headers['Authorization'];

  if (!authHeader) {
    res.setHeader('WWW-Authenticate', 'Basic realm="Laundry OMS"');
    return next(new AppError('Authentication required', 401));
  }

  const [type, credentials] = authHeader.split(' ');

  if (type !== 'Basic' || !credentials) {
    return next(new AppError('Invalid authentication format', 400));
  }

  const decoded = Buffer.from(credentials, 'base64').toString('utf8');
  const [username, password] = decoded.split(':');

  const expectedUsername = process.env.AUTH_USERNAME || 'admin';
  const expectedPassword = process.env.AUTH_PASSWORD || 'admin123';

  if (username !== expectedUsername || password !== expectedPassword) {
    return next(new AppError('Invalid username or password', 401));
  }

  // Authentication successful
  next();
};

module.exports = basicAuth;
