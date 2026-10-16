import { Request, Response } from "express";
import { Op } from "sequelize";
import { Task } from "../models/task.model.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/apiError.js";
import { sendPaginated, sendSuccess } from "../utils/response.js";
import { TaskPriority, TaskStatus } from "../types/index.js";

export const createTask = async (req: Request, res: Response): Promise<void> => {
  const { title, description, status, priority, dueDate } = req.body;
  const userId = req.user!.id;

  const task = await Task.create({
    title,
    description: description || null,
    status: status || "TODO",
    priority: priority || "MEDIUM",
    dueDate: dueDate ? new Date(dueDate) : null,
    userId,
  });

  sendSuccess(res, 201, "Task created successfully", task);
};

export const getTasks = async (req: Request, res: Response): Promise<void> => {
  const user = req.user!;
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;
  const status = req.query.status as TaskStatus | undefined;
  const priority = req.query.priority as TaskPriority | undefined;
  const search = req.query.search as string | undefined;
  const sortBy = (req.query.sortBy as string) || "createdAt";
  const order = ((req.query.order as string) || "DESC").toUpperCase() === "ASC" ? "ASC" : "DESC";

  const whereClause: any = {};

  // Ownership check: regular user can only view their own tasks
  if (user.role !== "admin") {
    whereClause.userId = user.id;
  } else if (req.query.userId) {
    whereClause.userId = Number(req.query.userId);
  }

  if (status) {
    whereClause.status = status;
  }

  if (priority) {
    whereClause.priority = priority;
  }

  if (search) {
    whereClause[Op.or] = [
      { title: { [Op.iLike]: `%${search}%` } },
      { description: { [Op.iLike]: `%${search}%` } },
    ];
  }

  const offset = (page - 1) * limit;

  const { count, rows } = await Task.findAndCountAll({
    where: whereClause,
    limit,
    offset,
    order: [[sortBy, order]],
    include: [
      {
        model: User,
        as: "user",
        attributes: ["id", "name", "email"],
      },
    ],
  });

  const totalPages = Math.ceil(count / limit) || 1;

  sendPaginated(res, "Tasks retrieved successfully", rows, {
    page,
    limit,
    totalItems: count,
    totalPages,
    hasNext: page < totalPages,
    hasPrev: page > 1,
  });
};

export const getTaskById = async (req: Request, res: Response): Promise<void> => {
  const id = Number(req.params.id);
  const user = req.user!;

  const task = await Task.findByPk(id, {
    include: [
      {
        model: User,
        as: "user",
        attributes: ["id", "name", "email"],
      },
    ],
  });

  if (!task) {
    throw ApiError.notFound("Task not found");
  }

  if (user.role !== "admin" && task.userId !== user.id) {
    throw ApiError.forbidden("You do not have permission to view this task");
  }

  sendSuccess(res, 200, "Task retrieved successfully", task);
};

export const updateTask = async (req: Request, res: Response): Promise<void> => {
  const id = Number(req.params.id);
  const user = req.user!;
  const { title, description, status, priority, dueDate } = req.body;

  const task = await Task.findByPk(id);
  if (!task) {
    throw ApiError.notFound("Task not found");
  }

  if (user.role !== "admin" && task.userId !== user.id) {
    throw ApiError.forbidden("You do not have permission to modify this task");
  }

  if (title !== undefined) task.title = title;
  if (description !== undefined) task.description = description;
  if (status !== undefined) task.status = status;
  if (priority !== undefined) task.priority = priority;
  if (dueDate !== undefined) task.dueDate = dueDate ? new Date(dueDate) : null;

  await task.save();

  sendSuccess(res, 200, "Task updated successfully", task);
};

export const updateTaskStatus = async (req: Request, res: Response): Promise<void> => {
  const id = Number(req.params.id);
  const user = req.user!;
  const { status } = req.body;

  const task = await Task.findByPk(id);
  if (!task) {
    throw ApiError.notFound("Task not found");
  }

  if (user.role !== "admin" && task.userId !== user.id) {
    throw ApiError.forbidden("You do not have permission to modify this task");
  }

  task.status = status;
  await task.save();

  sendSuccess(res, 200, "Task status updated successfully", task);
};

export const deleteTask = async (req: Request, res: Response): Promise<void> => {
  const id = Number(req.params.id);
  const user = req.user!;

  const task = await Task.findByPk(id);
  if (!task) {
    throw ApiError.notFound("Task not found");
  }

  if (user.role !== "admin" && task.userId !== user.id) {
    throw ApiError.forbidden("You do not have permission to delete this task");
  }

  await task.destroy();

  sendSuccess(res, 200, "Task deleted successfully");
};

export const getTaskStats = async (req: Request, res: Response): Promise<void> => {
  const user = req.user!;
  const isGlobal = user.role === "admin" && req.query.global === "true";

  const whereClause: any = {};
  if (!isGlobal) {
    whereClause.userId = user.id;
  }

  const tasks = await Task.findAll({
    where: whereClause,
    attributes: ["status", "priority", "dueDate"],
  });

  const now = new Date();

  const stats = {
    totalTasks: tasks.length,
    byStatus: {
      TODO: 0,
      IN_PROGRESS: 0,
      COMPLETED: 0,
      CANCELLED: 0,
    },
    byPriority: {
      LOW: 0,
      MEDIUM: 0,
      HIGH: 0,
      URGENT: 0,
    },
    overdueTasks: 0,
    completionRate: 0,
  };

  tasks.forEach((t) => {
    if (t.status in stats.byStatus) {
      stats.byStatus[t.status]++;
    }
    if (t.priority in stats.byPriority) {
      stats.byPriority[t.priority]++;
    }
    if (
      t.dueDate &&
      new Date(t.dueDate) < now &&
      t.status !== "COMPLETED" &&
      t.status !== "CANCELLED"
    ) {
      stats.overdueTasks++;
    }
  });

  stats.completionRate =
    stats.totalTasks > 0
      ? Math.round((stats.byStatus.COMPLETED / stats.totalTasks) * 100)
      : 0;

  sendSuccess(res, 200, "Task statistics calculated successfully", stats);
};
