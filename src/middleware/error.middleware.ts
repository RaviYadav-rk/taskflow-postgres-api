import { Request, Response, NextFunction } from "express";
import { ApiError } from "../utils/apiError.js";

export const notFoundHandler = (req: Request, res: Response): void => {
  res.status(404).json({
    success: false,
    message: `Cannot ${req.method} ${req.originalUrl} - Route not found`,
  });
};

export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  _next: NextFunction,
): void => {
  console.error("API Error caught:", {
    method: req.method,
    url: req.originalUrl,
    name: err?.name,
    message: err?.message,
    stack: process.env.NODE_ENV === "development" ? err?.stack : undefined,
  });

  // Handle custom ApiError
  if (err instanceof ApiError) {
    res.status(err.statusCode).json({
      success: false,
      message: err.message,
      ...(err.details ? { details: err.details } : {}),
    });
    return;
  }

  // Handle Sequelize Unique Constraint Error
  if (err?.name === "SequelizeUniqueConstraintError") {
    const fields = err.errors ? err.errors.map((e: any) => e.path).join(", ") : "Field";
    res.status(409).json({
      success: false,
      message: `${fields} already exists`,
      errors: err.errors?.map((e: any) => ({ field: e.path, message: e.message })),
    });
    return;
  }

  // Handle Sequelize Validation Error
  if (err?.name === "SequelizeValidationError") {
    res.status(400).json({
      success: false,
      message: "Database validation error",
      errors: err.errors?.map((e: any) => ({ field: e.path, message: e.message })),
    });
    return;
  }

  // Handle Sequelize Foreign Key Error
  if (err?.name === "SequelizeForeignKeyConstraintError") {
    res.status(400).json({
      success: false,
      message: "Referenced entity does not exist",
    });
    return;
  }

  // Handle JSON Syntax Error in request body
  if (err instanceof SyntaxError && "body" in err) {
    res.status(400).json({
      success: false,
      message: "Malformed JSON payload in request body",
    });
    return;
  }

  // Unhandled internal errors
  res.status(500).json({
    success: false,
    message: "Internal server error",
    ...(process.env.NODE_ENV === "development" ? { error: err?.message } : {}),
  });
};
