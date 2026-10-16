import { Response } from "express";

export interface PaginationMeta {
  page: number;
  limit: number;
  totalItems: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export const sendSuccess = <T>(
  res: Response,
  statusCode = 200,
  message = "Operation successful",
  data?: T,
) => {
  return res.status(statusCode).json({
    success: true,
    message,
    ...(data !== undefined && { data }),
  });
};

export const sendPaginated = <T>(
  res: Response,
  message = "Data fetched successfully",
  data: T[],
  pagination: PaginationMeta,
) => {
  return res.status(200).json({
    success: true,
    message,
    data,
    pagination,
  });
};
