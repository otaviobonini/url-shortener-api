import express from "express";
import authRoutes from "../routes/auth.routes.js";
import urlRoutes from "../routes/url.routes.js";
import helmet from "helmet";
import rateLimit from "express-rate-limit";

const app = express();

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 50,
  message: "Too many requests, please try again later.",
});

app.use(express.json());
app.use(helmet());

app.use("/", limiter, authRoutes);
app.use("/url", limiter, urlRoutes);

export default app;
