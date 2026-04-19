import rateLimit from "express-rate-limit";

export const AuthLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 50,
  message: "Too many requests, please try again later.",
});

export const UrlLimiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  max: 50,
  message: "Too many requests, please try again later.",
});
