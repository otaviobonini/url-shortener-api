import { Redis } from 'ioredis';
import { env } from '../schemas/env.schema.js';

export const redis = new Redis(env.REDIS_URL);
