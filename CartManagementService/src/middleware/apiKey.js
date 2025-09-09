'use strict';

/**
 * Middleware to enforce presence of valid API key in header X-API-KEY.
 * Configure expected key via env API_KEY.
 */
module.exports = function apiKeyMiddleware(req, res, next) {
  const provided = req.header('X-API-KEY');
  const expected = process.env.API_KEY;

  if (!expected) {
    // If not configured, deny by default to avoid accidental exposure
    return res.status(500).json({
      code: 500,
      message: 'Server misconfiguration: API_KEY not set'
    });
  }

  if (!provided || provided !== expected) {
    return res.status(401).json({
      code: 401,
      message: 'Unauthorized - API key missing or invalid'
    });
  }

  next();
};
