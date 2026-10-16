import { Request, Response, NextFunction } from "express";
import { verifyToken } from "../utils/jwt.js";
import { User } from "../models/user.model.js";
import { UserRole } from "../types/index.js";

export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      res.status(401).json({
        success: false,
        message: "Authentication required: Missing or invalid Bearer token",
      });
      return;
    }

    const token = authHeader.split(" ")[1];

    let payload;
    try {
      payload = verifyToken(token);
    } catch (err: any) {
      const message =
        err.name === "TokenExpiredError"
          ? "Authentication failed: Token has expired"
          : "Authentication failed: Invalid token";

      res.status(401).json({
        success: false,
        message,
      });
      return;
    }

    const user = await User.findByPk(payload.id);

    if (!user) {
      res.status(401).json({
        success: false,
        message: "Authentication failed: User no longer exists",
      });
      return;
    }

    if (!user.isActive) {
      res.status(403).json({
        success: false,
        message: "Account deactivated: Please contact support",
      });
      return;
    }

    req.user = {
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
    };

    next();
  } catch (error) {
    next(error);
  }
};

export const authorize = (...allowedRoles: UserRole[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: "Authentication required",
      });
      return;
    }

    if (allowedRoles.length > 0 && !allowedRoles.includes(req.user.role)) {
      res.status(403).json({
        success: false,
        message: `Forbidden: Requires one of [${allowedRoles.join(", ")}] permissions`,
      });
      return;
    }

    next();
  };
};
