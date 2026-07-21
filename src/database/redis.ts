import { Redis } from 'ioredis';
import { env } from '../schemas/env.schema.js';

export const redis = new Redis(env.REDIS_URL);

// Log errors from Redis
let hasLoggedError = false
redis.on("error", (err) => {
    if (hasLoggedError) return
    console.error("Redis error:", err);
    hasLoggedError = true
})
redis.on("connect", () => {
    console.log("Connected to Redis");
})
redis.on("ready", () => {
    console.log("Redis is ready to use");
})