import express from "express";
import authRoutes from "../routes/auth.routes.js";
import urlRoutes from "../routes/url.routes.js";
import redirectRoutes from "../routes/redirect.routes.js";
import helmet from "helmet";
import { AuthLimiter } from "../utils/rateLimit.js";
import {
  errorHandler,
  prismaErrorHandler,
} from "../middlewares/errorHandler.js";
import swaggerUi from "swagger-ui-express";
import { swaggerSpec } from "../config/swagger.js";
import cors from "cors";
import cookieParser from "cookie-parser";
import { env } from "../schemas/env.schema.js";
import { healthCheck } from "../controllers/HealthController.js";

const app = express();
app.set("trust proxy", 1); // trust first proxy
app.use(cors({
  origin: env.CLIENT_URL,
  credentials: true,
}));

app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.get("/health", healthCheck);
app.use(express.json());
app.use(helmet());

app.use(cookieParser());

app.use("/auth", AuthLimiter, authRoutes);
app.use("/url", urlRoutes);
// Root-level short-link redirect — must be registered last so its /:hashedUrl
// catch-all doesn't shadow /auth, /url or /docs.
app.use("/", redirectRoutes);

app.use(prismaErrorHandler);
app.use(errorHandler);

export default app;
