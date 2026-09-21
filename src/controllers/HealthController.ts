import { prisma } from "../database/prisma.js";
import { redis } from "../database/redis.js";
import { Request, Response } from "express";

type status = "ok" | "degraded";
type dependecies = "ok" | "error";

// Liveness: só responde que o processo está de pé. NÃO toca no banco.
//
// É este o endpoint que o HEALTHCHECK do Docker chama em loop. Consultar o
// Postgres aqui mantinha o banco acordado 24/7: provedores serverless (Neon,
// Supabase) suspendem o compute quando fica ocioso, e uma query a cada 30s
// impedia essa suspensão — a cota mensal ia embora sem ninguém usar a API.
export function liveness(req: Request, res: Response) {
  return res.status(200).json({ status: "ok" as status });
}

// Readiness: confere as dependências de verdade. Custa uma query, então é para
// uso pontual (deploy, monitoramento externo), nunca em loop curto.
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