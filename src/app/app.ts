import express from "express";
import authRoutes from "../routes/auth.routes.js";
import urlRoutes from "../routes/url.routes.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";

const app = express();

app.use(express.json());
app.use("/", authRoutes);
app.use(authMiddleware);
app.use("/link", urlRoutes);

export default app;
