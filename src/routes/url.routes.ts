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
import { rateLimit } from "express-rate-limit";

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: "Too many requests, please try again later.",
});

const router = Router();

router.post(
  "/",
  authMiddleware,
  limiter,
  validateRequest(createUrlSchema),
  UrlController.shorten,
);
router.get(
  "/",
  validateRequest(paginationQuerySchema, "query"),
  authMiddleware,
  UrlController.getUrls,
);
router.delete(
  "/:id",
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
