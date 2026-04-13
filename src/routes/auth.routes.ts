import { Router } from "express";
import AuthController from "../controllers/AuthController.js";
import { validateRequest } from "../middlewares/validate.js";
import { createUserSchema, loginUserSchema } from "../schemas/auth.schema.js";

const router = Router();

router.post(
  "/register",
  validateRequest(createUserSchema),
  AuthController.register,
);
router.post("/login", validateRequest(loginUserSchema), AuthController.login);

export default router;
