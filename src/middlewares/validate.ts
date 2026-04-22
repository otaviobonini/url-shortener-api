import { Request, Response, NextFunction } from "express";
import { z, ZodError } from "zod";

type validateRequestOption = "body" | "query" | "params" | "headers";

export const validateRequest = (
  schema: z.ZodType,
  option: validateRequestOption = "body",
) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = schema.parse(req[option]);
      Object.defineProperty(req, option, {
        value: data,
        writable: true,
        configurable: true,
      });
      return next();
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ error: error.issues[0].message });
      }
      return res.status(400).json({
        error: error instanceof Error ? error.message : "Invalid Message",
      });
    }
  };
};
