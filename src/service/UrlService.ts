import { prisma } from "../database/prisma.js";
import { nanoid } from "nanoid";
import { CreateUrl, DeleteUrl } from "../types/url.js";

export default class UrlService {
  async createShortUrl({ userId, originalUrl, expires }: CreateUrl) {
    let exists = true;
    let hashedUrl = "";
    while (exists) {
      hashedUrl = nanoid(8);
      exists = !!(await prisma.url.findUnique({
        where: { hashedUrl },
      }));
    }
    try {
      const url = await prisma.url.create({
        data: { userId, originalUrl, hashedUrl, expires },
      });

      return url;
    } catch (error) {
      throw new Error("Failed to create URL");
    }
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

  async getUserUrls(userId: number) {
    const urls = await prisma.url.findMany({
      where: { userId },
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
      const deletedUrl = await prisma.url.delete({
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
