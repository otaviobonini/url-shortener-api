import type { Request, Response, NextFunction } from "express";

// No-op limiters for tests: no Redis, no counting — just call next().
const passthrough = (_req: Request, _res: Response, next: NextFunction) =>
  next();

export const AuthLimiter = passthrough;
export const UrlLimiter = passthrough;
