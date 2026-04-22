import { Router } from "express";
import UrlController from "../controllers/UrlController.js";
import { validateRequest } from "../middlewares/validate.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import {
  createUrlSchema,
  deleteUrlSchema,
  redirectUrlSchema,
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
  validateRequest(paginationQuerySchema, "query"),
  authMiddleware,
  UrlController.getUrls.bind(UrlController),
);
router.delete(
  "/:id",
  UrlLimiter,
  validateRequest(deleteUrlSchema, "params"),
  authMiddleware,
  UrlController.delete.bind(UrlController),
);
router.get(
  "/:hashedUrl",
  UrlLimiter,
  validateRequest(redirectUrlSchema, "params"),
  UrlController.redirect.bind(UrlController),
);

export default router;
