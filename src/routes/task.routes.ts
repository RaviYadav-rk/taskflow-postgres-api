import { Router } from "express";
import {
  createTask,
  getTasks,
  getTaskById,
  updateTask,
  updateTaskStatus,
  deleteTask,
  getTaskStats,
} from "../controllers/task.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";
import { validate } from "../middleware/validate.middleware.js";
import {
  createTaskSchema,
  updateTaskSchema,
  updateTaskStatusSchema,
  taskQuerySchema,
  taskIdParamSchema,
} from "../validations/task.validation.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const taskRouter = Router();

// All task routes require authentication
taskRouter.use(authenticate);

// Task analytics and summary metrics
taskRouter.get("/stats", asyncHandler(getTaskStats));

// Create a new task
taskRouter.post("/", validate({ body: createTaskSchema }), asyncHandler(createTask));

// Get list of tasks (filtered by user unless admin)
taskRouter.get("/", validate({ query: taskQuerySchema }), asyncHandler(getTasks));

// Get single task by ID
taskRouter.get("/:id", validate({ params: taskIdParamSchema }), asyncHandler(getTaskById));

// Update task
taskRouter.put(
  "/:id",
  validate({ params: taskIdParamSchema, body: updateTaskSchema }),
  asyncHandler(updateTask),
);

// Quick status update
taskRouter.patch(
  "/:id/status",
  validate({ params: taskIdParamSchema, body: updateTaskStatusSchema }),
  asyncHandler(updateTaskStatus),
);

// Delete task
taskRouter.delete("/:id", validate({ params: taskIdParamSchema }), asyncHandler(deleteTask));
