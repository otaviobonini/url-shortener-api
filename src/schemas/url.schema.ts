import { z } from "zod";

export const createUrlSchema = z.object({
  originalUrl: z.string().url("Invalid URL format"),
  expires: z.date().nullable(),
});

export const deleteUrlSchema = z.object({
  urlId: z.number().int().positive("URL ID must be a positive integer"),
});

export const redirectUrlSchema = z.object({
  hashedUrl: z.string().length(8, "Short URL must be 8 characters long"),
});
