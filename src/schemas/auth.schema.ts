import { z } from "zod";

export const createUserSchema = z.object({
  email: z.string().email(),
  username: z
    .string()
    .min(2, "User name must be at least 2 characters long")
    .max(20, "User name must be at most 20 characters long"),
  password: z
    .string()
    .min(6, "Password must be at least 6 characters long")
    .max(20, "Password must be at most 20 characters long"),
});

export const loginUserSchema = z.object({
  email: z.string().email(),
  password: z
    .string()
    .min(6, "Password must be at least 6 characters long")
    .max(20, "Password must be at most 20 characters long"),
});
