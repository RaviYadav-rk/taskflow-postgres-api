import { z } from "zod";

export const userIdParamSchema = z.object({
  id: z
    .string()
    .regex(/^\d+$/, "User ID must be a positive integer")
    .transform(Number),
});

export const updateUserSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name cannot exceed 100 characters")
    .optional(),
  email: z
    .string()
    .trim()
    .email("Must be a valid email address")
    .toLowerCase()
    .optional(),
  role: z.enum(["user", "admin"]).optional(),
  isActive: z.boolean().optional(),
});

export const userQuerySchema = z.object({
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
  search: z.string().trim().optional(),
  role: z.enum(["user", "admin"]).optional(),
  isActive: z
    .enum(["true", "false"])
    .optional()
    .transform((val) => (val === undefined ? undefined : val === "true")),
});
