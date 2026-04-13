import UrlService from "../service/UrlService.js";
import { Request, Response } from "express";
const service = new UrlService();

class UrlController {
  async shorten(req: Request, res: Response) {
    const { url, expires } = req.body;
    const userId = req.userId!;
    try {
      const shortUrl = await service.createShortUrl({
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
    const { id } = req.params as { id: string };
    const userId = req.userId!;
    const urlId = parseInt(id);
    try {
      const deleted = await service.deleteShortUrl({ userId, urlId });
      return res.status(200).json(deleted);
    } catch (error) {
      if (error instanceof Error)
        return res.status(400).json({ error: error.message });
    }
    return res.status(400).json({ error: "Unknown error" });
  }

  async getUrls(req: Request, res: Response) {
    const userId = req.userId!;
    try {
      const urls = await service.getUserUrls(userId);
      return res.status(200).json(urls);
    } catch (error) {
      if (error instanceof Error) {
        return res.status(400).json({ error: error.message });
      }
      return res.status(400).json({ error: "Unknown error" });
    }
  }
  async redirect(req: Request, res: Response) {
    const { hashedUrl } = req.params as { hashedUrl: string };
    try {
      const url = await service.getUrlForRedirect(hashedUrl);
      return res.redirect(url.originalUrl);
    } catch (error) {
      if (error instanceof Error) {
        return res.status(400).json({ error: error.message });
      }
      return res.status(400).json({ error: "Unknown error" });
    }
  }
}

export default new UrlController();
