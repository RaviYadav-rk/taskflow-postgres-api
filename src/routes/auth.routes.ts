import { Router } from "express";
import {
  register,
  login,
  getProfile,
  updateProfile,
  changePassword,
} from "../controllers/auth.controller.js";
import { validate } from "../middleware/validate.middleware.js";
import { authenticate } from "../middleware/auth.middleware.js";
import {
  registerSchema,
  loginSchema,
  updateProfileSchema,
  changePasswordSchema,
} from "../validations/auth.validation.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const authRouter = Router();

authRouter.post("/register", validate({ body: registerSchema }), asyncHandler(register));
authRouter.post("/login", validate({ body: loginSchema }), asyncHandler(login));
authRouter.get("/me", authenticate, asyncHandler(getProfile));
authRouter.put(
  "/profile",
  authenticate,
  validate({ body: updateProfileSchema }),
  asyncHandler(updateProfile),
);
authRouter.put(
  "/change-password",
  authenticate,
  validate({ body: changePasswordSchema }),
  asyncHandler(changePassword),
);
