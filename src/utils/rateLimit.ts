import rateLimit from "express-rate-limit";
import { redis } from "../database/redis.js";
import { RedisStore, RedisReply } from "rate-limit-redis";

function createRedisStore(prefix: string) {
  return new RedisStore({
    prefix,
    sendCommand: (...args: string[]) =>
      redis.call(...(args as [string, ...string[]])) as Promise<RedisReply>,
  });
}

export const AuthLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  store: createRedisStore("rl:auth"),
  max: 10,
  handler: (req, res) => {
    res.status(429).json({
      message: "Muitas tentativas de login. Tente novamente em alguns minutos.",
    });
  },
});

export const UrlLimiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  store: createRedisStore("rl:url"),
  max: 50,
  handler: (req, res) => {
    res.status(429).json({
      message: "Muitas tentativas de acesso ao URL. Tente novamente em alguns minutos.",
    });
  },
});
