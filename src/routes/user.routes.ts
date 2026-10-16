import { Router } from "express";
import {
  createUser,
  getUsers,
  getUserById,
  updateUser,
  deleteUser,
} from "../controllers/user.controller.js";
import { authenticate, authorize } from "../middleware/auth.middleware.js";
import { validate } from "../middleware/validate.middleware.js";
import { registerSchema } from "../validations/auth.validation.js";
import {
  userIdParamSchema,
  updateUserSchema,
  userQuerySchema,
} from "../validations/user.validation.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const userRouter = Router();

// Create user (can be used for admin user creation or public signup)
userRouter.post(
  "/",
  validate({ body: registerSchema }),
  asyncHandler(createUser),
);

// Get users list (admin only)
userRouter.get(
  "/",
  authenticate,
  authorize("admin"),
  validate({ query: userQuerySchema }),
  asyncHandler(getUsers),
);

// Get single user by ID
userRouter.get(
  "/:id",
  authenticate,
  validate({ params: userIdParamSchema }),
  asyncHandler(getUserById),
);

// Update user details or role (admin only)
userRouter.put(
  "/:id",
  authenticate,
  authorize("admin"),
  validate({ params: userIdParamSchema, body: updateUserSchema }),
  asyncHandler(updateUser),
);

// Delete user (admin only)
userRouter.delete(
  "/:id",
  authenticate,
  authorize("admin"),
  validate({ params: userIdParamSchema }),
  asyncHandler(deleteUser),
);

// Backward compatibility: export as router as well
export const router = userRouter;
