import rateLimit from "express-rate-limit";
import { HTTP_CODES } from "../common/httpCodes";

/**
 * Rate limiter for AI-powered features to prevent abuse and manage costs.
 * Limits each IP to 10 requests per 15 minutes.
 */
export const aiRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Limit each IP to 10 requests per window
  message: {
    success: false,
    statusCode: HTTP_CODES.FORBIDDEN,
    message: "Too many AI requests, please try again after 15 minutes",
    data: null,
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});
