const rateLimit = require('express-rate-limit');

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { message: 'Too many login attempts, try again later' },
});

const apiLimiter = rateLimit({ windowMs: 60 * 1000, max: 120 });

module.exports = { loginLimiter, apiLimiter };
