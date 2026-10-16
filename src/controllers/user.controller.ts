import { Request, Response } from "express";
import bcrypt from "bcrypt";
import { Op } from "sequelize";
import { User } from "../models/user.model.js";
import { Task } from "../models/task.model.js";
import { ApiError } from "../utils/apiError.js";
import { sendPaginated, sendSuccess } from "../utils/response.js";

export const createUser = async (req: Request, res: Response): Promise<void> => {
  const { name, email, password, role } = req.body;

  const existingUser = await User.findOne({ where: { email } });
  if (existingUser) {
    throw ApiError.conflict("Email already registered");
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await User.create({
    name,
    email,
    password: hashedPassword,
    role: role || "user",
    isActive: true,
  });

  sendSuccess(res, 201, "User created successfully", user.toSafeObject());
};

export const getUsers = async (req: Request, res: Response): Promise<void> => {
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;
  const search = req.query.search as string | undefined;
  const role = req.query.role as string | undefined;
  const isActive =
    req.query.isActive !== undefined
      ? String(req.query.isActive) === "true"
      : undefined;

  const whereClause: any = {};

  if (role) {
    whereClause.role = role;
  }

  if (isActive !== undefined) {
    whereClause.isActive = isActive;
  }

  if (search) {
    whereClause[Op.or] = [
      { name: { [Op.iLike]: `%${search}%` } },
      { email: { [Op.iLike]: `%${search}%` } },
    ];
  }

  const offset = (page - 1) * limit;

  const { count, rows } = await User.findAndCountAll({
    where: whereClause,
    attributes: ["id", "name", "email", "role", "isActive", "createdAt", "updatedAt"],
    limit,
    offset,
    order: [["createdAt", "DESC"]],
  });

  const totalPages = Math.ceil(count / limit) || 1;

  sendPaginated(res, "Users fetched successfully", rows, {
    page,
    limit,
    totalItems: count,
    totalPages,
    hasNext: page < totalPages,
    hasPrev: page > 1,
  });
};

export const getUserById = async (req: Request, res: Response): Promise<void> => {
  const id = Number(req.params.id);

  const user = await User.findByPk(id, {
    attributes: ["id", "name", "email", "role", "isActive", "createdAt", "updatedAt"],
    include: [
      {
        model: Task,
        as: "tasks",
        attributes: ["id", "title", "status", "priority", "dueDate"],
      },
    ],
  });

  if (!user) {
    throw ApiError.notFound("User not found");
  }

  sendSuccess(res, 200, "User fetched successfully", user);
};

export const updateUser = async (req: Request, res: Response): Promise<void> => {
  const id = Number(req.params.id);
  const { name, email, role, isActive } = req.body;

  const user = await User.findByPk(id);
  if (!user) {
    throw ApiError.notFound("User not found");
  }

  if (email && email !== user.email) {
    const existing = await User.findOne({ where: { email } });
    if (existing) {
      throw ApiError.conflict("Email already in use by another user");
    }
    user.email = email;
  }

  if (name !== undefined) user.name = name;
  if (role !== undefined) user.role = role;
  if (isActive !== undefined) user.isActive = isActive;

  await user.save();

  sendSuccess(res, 200, "User updated successfully", user.toSafeObject());
};

export const deleteUser = async (req: Request, res: Response): Promise<void> => {
  const id = Number(req.params.id);

  if (req.user?.id === id) {
    throw ApiError.badRequest("You cannot delete your own account via this endpoint");
  }

  const user = await User.findByPk(id);
  if (!user) {
    throw ApiError.notFound("User not found");
  }

  await user.destroy();

  sendSuccess(res, 200, "User and associated tasks deleted successfully");
};
