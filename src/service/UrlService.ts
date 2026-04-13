import { prisma } from "../database/prisma";
import { CreateUrl } from "../types/url";

export default class UrlService {
  async createShortUrl(userId, originalUrl, expires): CreateUrl {
    const hashedUrl =
  }
}
