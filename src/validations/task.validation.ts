import { z } from "zod";

const taskStatusEnum = z.enum(["TODO", "IN_PROGRESS", "COMPLETED", "CANCELLED"]);
const taskPriorityEnum = z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]);

export const taskIdParamSchema = z.object({
  id: z
    .string()
    .regex(/^\d+$/, "Task ID must be a positive integer")
    .transform(Number),
});

export const createTaskSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, "Title is required")
    .max(200, "Title cannot exceed 200 characters"),
  description: z.string().trim().optional().nullable(),
  status: taskStatusEnum.optional().default("TODO"),
  priority: taskPriorityEnum.optional().default("MEDIUM"),
  dueDate: z
    .string()
    .datetime({ message: "Due date must be a valid ISO 8601 date string" })
    .optional()
    .nullable()
    .transform((val) => (val ? new Date(val) : null)),
});

export const updateTaskSchema = z
  .object({
    title: z
      .string()
      .trim()
      .min(1, "Title cannot be empty")
      .max(200, "Title cannot exceed 200 characters")
      .optional(),
    description: z.string().trim().optional().nullable(),
    status: taskStatusEnum.optional(),
    priority: taskPriorityEnum.optional(),
    dueDate: z
      .string()
      .datetime({ message: "Due date must be a valid ISO 8601 date string" })
      .optional()
      .nullable()
      .transform((val) => (val === undefined ? undefined : val ? new Date(val) : null)),
  })
  .refine(
    (data) => Object.keys(data).length > 0,
    { message: "At least one field must be provided for update" },
  );

export const updateTaskStatusSchema = z.object({
  status: taskStatusEnum,
});

export const taskQuerySchema = z.object({
  page: z
    .string()
    .optional()
    .default("1")
    .transform((val) => Math.max(1, parseInt(val, 10) || 1)),
  limit: z
    .string()
    .optional()
    .default("10")
    .transform((val) => Math.min(100, Math.max(1, parseInt(val, 10) || 10))),
  status: taskStatusEnum.optional(),
  priority: taskPriorityEnum.optional(),
  search: z.string().trim().optional(),
  sortBy: z.enum(["createdAt", "updatedAt", "dueDate", "priority", "title"]).optional().default("createdAt"),
  order: z.enum(["ASC", "DESC", "asc", "desc"]).optional().default("DESC").transform((val) => val.toUpperCase() as "ASC" | "DESC"),
  userId: z
    .string()
    .regex(/^\d+$/)
    .optional()
    .transform((val) => (val ? Number(val) : undefined)),
});
