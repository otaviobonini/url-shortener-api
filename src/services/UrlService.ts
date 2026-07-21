import { prisma } from "../database/prisma.js";
import { Prisma } from "@prisma/client";
import { nanoid } from "nanoid";
import { CreateUrl, DeleteUrl, GetUrl } from "../types/url.js";
import { AppError } from "../common/AppError.js";
import { redis } from "../database/redis.js";

export default class UrlService {
  async createShortUrl({ userId, originalUrl, expires }: CreateUrl) {
    for (let i = 0; i < 5; i++) {
      try {
        const hashedUrl = nanoid(8);
        const url = await prisma.url.create({
          data: { userId, originalUrl, hashedUrl, expires },
        });
        return url;
      } catch (error) {
        if (
          error instanceof Prisma.PrismaClientKnownRequestError &&
          error.code === "P2002"
        ) {
          //If url already exists in the database we retry to create the url in 5 attempts.
          continue;
        }
        throw new AppError(500, "Failed to create URL");
      }
    }
    throw new AppError(
      500,
      "Failed to generate unique URL after multiple attempts",
    );
  }

  async deleteShortUrl({ userId, urlId }: DeleteUrl) {
  const target = await prisma.url.findFirst({
    where: { id: urlId, userId },
    select: { hashedUrl: true },
  });

  const deleted = await prisma.url.deleteMany({ where: { id: urlId, userId } });
  if (deleted.count === 0) {
    throw new AppError(403, "URL not found or Unauthorized");
  }

  if (target) await redis.del(`url:${target.hashedUrl}`).catch(() => {});
  return deleted;
}

  async getUserUrls({ userId, page = 1, limit = 10 }: GetUrl) {
    const where = { userId };

    const [data, total] = await Promise.all([
      prisma.url.findMany({
        where,
        take: limit,
        skip: (page - 1) * limit,
        orderBy: { createdAt: "desc" },
      }),
      prisma.url.count({ where }),
    ]);

    return { data, page, limit, total };
  }
  async getUrlForRedirect(hashedUrl: string) {
  const cacheKey = `url:${hashedUrl}`;

  // cache best-effort
  try {
    const cached = await redis.get(cacheKey);
    if (cached) {
      const { originalUrl, expires } = JSON.parse(cached) as {
        originalUrl: string;
        expires: string | null;
      };

      if (expires && new Date(expires) < new Date()) {
        await redis.del(cacheKey).catch(() => {});
        await prisma.url.delete({ where: { hashedUrl } });
        throw new AppError(410, "URL has expired and has been deleted");
      }

      // Increment the counter in the database asynchronously.
      // The .catch() is mandatory: with no handler, a failed update becomes an
      // unhandled rejection, which terminates the process on Node 18+.
      prisma.url
        .update({ where: { hashedUrl }, data: { counter: { increment: 1 } } })
        .catch(() => {});

      return { originalUrl };
    }
  } catch (err) {
    if (err instanceof AppError) throw err; //
    
  }

  // cache miss
  const existingUrl = await prisma.url.findUnique({ where: { hashedUrl } });
  if (!existingUrl) throw new AppError(404, "URL not found");

  const { protocol } = new URL(existingUrl.originalUrl);
  if (!["http:", "https:"].includes(protocol)) {
    throw new AppError(400, "Invalid URL protocol");
  }

  if (existingUrl.expires && existingUrl.expires < new Date()) {
    await prisma.url.delete({ where: { hashedUrl } });
    throw new AppError(410, "URL has expired and has been deleted");
  }

  // only cache if the URL is valid and not expired
  await redis
    .set(cacheKey, JSON.stringify({
      originalUrl: existingUrl.originalUrl,
      expires: existingUrl.expires,
    }), "EX", 3600)
    .catch(() => {});

  return prisma.url.update({
    where: { hashedUrl },
    data: { counter: { increment: 1 } },
  });
  }
}
