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
  UrlController.shorten,
);
router.get(
  "/",
  UrlLimiter,
  validateRequest(paginationQuerySchema, "query"),
  authMiddleware,
  UrlController.getUrls,
);
router.delete(
  "/:id",
  UrlLimiter,
  validateRequest(deleteUrlSchema, "params"),
  authMiddleware,
  UrlController.delete,
);
router.get(
  "/:hashedUrl",
  validateRequest(redirectUrlSchema, "params"),
  UrlController.redirect,
);

export default router;
