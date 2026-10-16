import { Request, Response, NextFunction } from "express";
import { ZodError, ZodType } from "zod";

interface RequestValidators {
  body?: ZodType;
  query?: ZodType;
  params?: ZodType;
}

export const validate = (validators: RequestValidators | ZodType) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if ("parseAsync" in validators && typeof validators.parseAsync === "function") {
        // If a single Zod schema was passed, validate body by default
        req.body = await validators.parseAsync(req.body);
        return next();
      }

      const composite = validators as RequestValidators;

      if (composite.params) {
        req.params = (await composite.params.parseAsync(req.params)) as Record<string, string>;
      }

      if (composite.query) {
        req.query = (await composite.query.parseAsync(req.query)) as Record<string, any>;
      }

      if (composite.body) {
        req.body = await composite.body.parseAsync(req.body);
      }

      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const formattedErrors = error.issues.map((err) => ({
          field: err.path.join("."),
          message: err.message,
        }));

        res.status(400).json({
          success: false,
          message: "Validation failed",
          errors: formattedErrors,
        });
        return;
      }

      next(error);
    }
  };
};
