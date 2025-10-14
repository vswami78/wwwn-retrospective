import rateLimit from 'express-rate-limit';

export const itemCreationLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 60, // 60 requests per minute per IP
  message: 'Too many items created, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
});
