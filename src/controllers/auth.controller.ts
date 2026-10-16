import { Request, Response } from "express";
import bcrypt from "bcrypt";
import { User } from "../models/user.model.js";
import { generateToken } from "../utils/jwt.js";
import { ApiError } from "../utils/apiError.js";
import { sendSuccess } from "../utils/response.js";

export const register = async (req: Request, res: Response): Promise<void> => {
  const { name, email, password, role } = req.body;

  const existingUser = await User.findOne({ where: { email } });
  if (existingUser) {
    throw ApiError.conflict("An account with this email already exists");
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await User.create({
    name,
    email,
    password: hashedPassword,
    role: role || "user",
    isActive: true,
  });

  const token = generateToken({
    id: user.id,
    email: user.email,
    role: user.role,
    name: user.name,
  });

  sendSuccess(
    res,
    201,
    "User registered successfully",
    {
      user: user.toSafeObject(),
      token,
    },
  );
};

export const login = async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body;

  const user = await User.findOne({ where: { email } });
  if (!user) {
    throw ApiError.unauthorized("Invalid email or password");
  }

  if (!user.isActive) {
    throw ApiError.forbidden("Your account has been deactivated. Please contact support.");
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    throw ApiError.unauthorized("Invalid email or password");
  }

  const token = generateToken({
    id: user.id,
    email: user.email,
    role: user.role,
    name: user.name,
  });

  sendSuccess(
    res,
    200,
    "Login successful",
    {
      user: user.toSafeObject(),
      token,
    },
  );
};

export const getProfile = async (req: Request, res: Response): Promise<void> => {
  const userId = req.user!.id;

  const user = await User.findByPk(userId);
  if (!user) {
    throw ApiError.notFound("User not found");
  }

  sendSuccess(res, 200, "Profile fetched successfully", user.toSafeObject());
};

export const updateProfile = async (req: Request, res: Response): Promise<void> => {
  const userId = req.user!.id;
  const { name, email } = req.body;

  const user = await User.findByPk(userId);
  if (!user) {
    throw ApiError.notFound("User not found");
  }

  if (email && email !== user.email) {
    const existing = await User.findOne({ where: { email } });
    if (existing) {
      throw ApiError.conflict("Email is already taken by another account");
    }
    user.email = email;
  }

  if (name) {
    user.name = name;
  }

  await user.save();

  sendSuccess(res, 200, "Profile updated successfully", user.toSafeObject());
};

export const changePassword = async (req: Request, res: Response): Promise<void> => {
  const userId = req.user!.id;
  const { currentPassword, newPassword } = req.body;

  const user = await User.findByPk(userId);
  if (!user) {
    throw ApiError.notFound("User not found");
  }

  const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
  if (!isPasswordValid) {
    throw ApiError.badRequest("Current password is incorrect");
  }

  const hashedNewPassword = await bcrypt.hash(newPassword, 10);
  user.password = hashedNewPassword;
  await user.save();

  sendSuccess(res, 200, "Password changed successfully");
};
