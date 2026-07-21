import { prisma } from "../database/prisma.js";
import { redis } from "../database/redis.js";
import { Request, Response } from "express";

type status = "ok" | "degraded";
type dependecies = "ok" | "error";

export async function healthCheck(req: Request, res: Response) {
  const checks = {
    status: "ok" as status,
    database: "ok" as dependecies,
    redis: "ok" as dependecies,
  };

  try {
    await prisma.$queryRaw`SELECT 1`;
  } catch {
    checks.status = "degraded";
    checks.database = "error";
  }
  try {
    const pong = await redis.ping();
    if (pong !== "PONG") throw new Error("Unexpected response");
  } catch {
    checks.status = "degraded";
    checks.redis = "error";
  }

  const httpStatus = checks.status === "ok" ? 200 : 503;
  return res.status(httpStatus).json(checks);
}