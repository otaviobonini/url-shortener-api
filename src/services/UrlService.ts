import { prisma } from "../database/prisma.js";
import { Prisma } from "@prisma/client";
import { nanoid } from "nanoid";
import { CreateUrl, DeleteUrl, GetUrl } from "../types/url.js";

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
          //Se a url ja existe no banco, tentamos denovo gerar a url em até 5 tentativas.
          continue;
        }
        throw new Error("Failed to create URL");
      }
    }
    throw new Error("Failed to generate unique URL after multiple attempts");
  }

  async deleteShortUrl({ userId, urlId }: DeleteUrl) {
    const url = await prisma.url.findUnique({ where: { id: urlId } });
    if (!url) {
      throw new Error("URL not found or Unauthorized");
    }
    if (url.userId !== userId) {
      throw new Error("URL not found or Unauthorized");
    }
    const deletedUrl = await prisma.url.delete({ where: { id: urlId } });
    return deletedUrl;
  }

  async getUserUrls({ userId, page = 1, limit = 10 }: GetUrl) {
    const urls = await prisma.url.findMany({
      where: { userId },
      take: limit,
      skip: (page - 1) * limit,
      orderBy: { createdAt: "desc" },
    });
    return urls;
  }
  async getUrlForRedirect(hashedUrl: string) {
    const existingUrl = await prisma.url.findUnique({
      where: { hashedUrl },
    });
    if (!existingUrl) {
      throw new Error("URL not found");
    }

    const isExpired = existingUrl.expires && existingUrl.expires < new Date();

    if (isExpired) {
      await prisma.url.delete({
        where: { hashedUrl },
      });
      throw new Error("URL has expired and has been deleted");
    }

    const url = await prisma.url.update({
      where: { hashedUrl },
      data: { counter: { increment: 1 } },
    });
    return url;
  }
}
