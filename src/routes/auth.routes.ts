import { Router } from "express";
import AuthController from "../controllers/AuthController.js";
import { validateRequest } from "../middlewares/validate.js";
import { createUserSchema, loginUserSchema } from "../schemas/auth.schema.js";

const router = Router();

router.post(
  "/register",
  validateRequest(createUserSchema),
  AuthController.register.bind(AuthController),
);
router.post(
  "/login",
  validateRequest(loginUserSchema),
  AuthController.login.bind(AuthController),
);

export default router;
