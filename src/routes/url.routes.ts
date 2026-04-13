import { Router } from "express";
import UrlController from "../controllers/UrlController.js";
import { validateRequest } from "../middlewares/validate.js";
import {
  createUrlSchema,
  deleteUrlSchema,
  redirectUrlSchema,
} from "../schemas/url.schema.js";

const router = Router();

(router.post("/", validateRequest(createUrlSchema), UrlController.shorten),
  router.get("/", UrlController.getUrls));
router.delete(
  "/:id",
  validateRequest(deleteUrlSchema, "params"),
  UrlController.delete,
);
router.get(
  "/:hashedUrl",
  validateRequest(redirectUrlSchema, "params"),
  UrlController.redirect,
);

export default router;
