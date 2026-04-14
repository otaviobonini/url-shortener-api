import { z } from "zod";

export const createUrlSchema = z.object({
  url: z.string().url("Invalid URL format"),
  expires: z.string().datetime().optional().nullable(),
});

export const deleteUrlSchema = z.object({
  id: z.coerce.number().int().positive("URL ID must be a positive integer"),
});

export const redirectUrlSchema = z.object({
  hashedUrl: z.string().length(8, "Short URL must be 8 characters long"),
});

export const paginationQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(10),
});
