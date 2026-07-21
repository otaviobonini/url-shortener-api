import { Router } from "express";
import UrlController from "../controllers/UrlController.js";
import { validateRequest } from "../middlewares/validate.js";
import { redirectUrlSchema } from "../schemas/url.schema.js";
import { UrlLimiter } from "../utils/rateLimit.js";

const router = Router();


router.get(
  "/:hashedUrl",
  UrlLimiter,
  validateRequest(redirectUrlSchema, "params"),
  UrlController.redirect.bind(UrlController),
);

export default router;
