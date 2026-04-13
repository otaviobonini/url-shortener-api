import express from "express";
import authRoutes from "../routes/auth.routes.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";

const app = express();

app.use(express.json());
app.use("/", authRoutes);
app.use(authMiddleware);

export default app;
