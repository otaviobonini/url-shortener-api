import { AppError } from "../common/AppError.js";
import {
  DeleteUrlInput,
  PaginationQuery,
  RedirectUrlInput,
} from "../schemas/url.schema.js";
import UrlService from "../services/UrlService.js";
import { Request, Response } from "express";

class UrlController {
  constructor(private service: UrlService) {}
  async shorten(req: Request, res: Response) {
    const { url, expires } = req.body;
    if (!req.userId) {
      throw new AppError(401, "Unauthorized");
    }
    const userId = req.userId;

    const shortUrl = await this.service.createShortUrl({
      userId,
      originalUrl: url,
      expires: expires || null,
    });
    res.status(201).json(shortUrl);
  }

  async delete(req: Request, res: Response) {
    const { id } = req.params as unknown as DeleteUrlInput;
    if (!req.userId) {
      throw new AppError(401, "Unauthorized");
    }
    const userId = req.userId;

    const deleted = await this.service.deleteShortUrl({ userId, urlId: id });
    return res.status(200).json(deleted);
  }

  async getUrls(req: Request, res: Response) {
    if (!req.userId) {
      throw new AppError(401, "Unauthorized");
    }
    const userId = req.userId;
    const { page, limit } = req.query as unknown as PaginationQuery;

    const urls = await this.service.getUserUrls({ userId, page, limit });
    return res.status(200).json(urls);
  }

  async redirect(req: Request, res: Response) {
    const { hashedUrl } = req.params as RedirectUrlInput;
    const url = await this.service.getUrlForRedirect(hashedUrl);
    return res.redirect(url.originalUrl);
  }
}

export default new UrlController(new UrlService());
