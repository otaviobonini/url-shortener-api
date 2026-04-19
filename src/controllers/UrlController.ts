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
      return res.status(401).json({ error: "Unauthorized" });
    }
    const userId = req.userId;
    try {
      const shortUrl = await this.service.createShortUrl({
        userId,
        originalUrl: url,
        expires: expires || null,
      });
      res.status(201).json(shortUrl);
    } catch (error) {
      if (error instanceof Error)
        return res.status(400).json({ error: error.message });
    }
    return res.status(400).json({ error: "Unknown error" });
  }

  async delete(req: Request, res: Response) {
    const { id } = req.params as DeleteUrlInput;
    if (!req.userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    const userId = req.userId;
    try {
      const deleted = await this.service.deleteShortUrl({ userId, urlId: id });
      return res.status(200).json(deleted);
    } catch (error) {
      if (error instanceof Error)
        return res.status(400).json({ error: error.message });
    }
    return res.status(400).json({ error: "Unknown error" });
  }

  async getUrls(req: Request, res: Response) {
    if (!req.userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    const userId = req.userId;
    const { page, limit } = req.query as PaginationQuery;

    try {
      const urls = await this.service.getUserUrls({ userId, page, limit });
      return res.status(200).json(urls);
    } catch (error) {
      if (error instanceof Error) {
        return res.status(400).json({ error: error.message });
      }
      return res.status(400).json({ error: "Unknown error" });
    }
  }
  async redirect(req: Request, res: Response) {
    const { hashedUrl } = req.params as RedirectUrlInput;
    try {
      const url = await this.service.getUrlForRedirect(hashedUrl);
      return res.redirect(url.originalUrl);
    } catch (error) {
      if (error instanceof Error) {
        return res.status(400).json({ error: error.message });
      }
      return res.status(400).json({ error: "Unknown error" });
    }
  }
}

export default new UrlController(new UrlService());
