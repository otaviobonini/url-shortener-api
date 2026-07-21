import { Router } from "express";
import UrlController from "../controllers/UrlController.js";
import { validateRequest } from "../middlewares/validate.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import {
  createUrlSchema,
  deleteUrlSchema,
  paginationQuerySchema,
} from "../schemas/url.schema.js";
import { UrlLimiter } from "../utils/rateLimit.js";

const router = Router();

router.post(
  "/",
  UrlLimiter,
  authMiddleware,
  validateRequest(createUrlSchema),
  UrlController.shorten.bind(UrlController),
);
router.get(
  "/",
  UrlLimiter,
  authMiddleware,
  validateRequest(paginationQuerySchema, "query"),
  UrlController.getUrls.bind(UrlController),
);
router.delete(
  "/:id",
  UrlLimiter,
  authMiddleware,
  validateRequest(deleteUrlSchema, "params"),
  UrlController.delete.bind(UrlController),
);

export default router;
