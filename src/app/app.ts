import express from "express";
import authRoutes from "../routes/auth.routes.js";
import urlRoutes from "../routes/url.routes.js";
import helmet from "helmet";
import { AuthLimiter } from "../utils/rateLimit.js";
import {
  errorHandler,
  prismaErrorHandler,
} from "../middlewares/errorHandler.js";

const app = express();

app.use(express.json());
app.use(helmet());

app.use("/", AuthLimiter, authRoutes);
app.use("/url", urlRoutes);

app.use(prismaErrorHandler);
app.use(errorHandler);

export default app;
