export type UserRole = "user" | "admin";

export type TaskStatus = "TODO" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED";

export type TaskPriority = "LOW" | "MEDIUM" | "HIGH" | "URGENT";

export interface JwtUserPayload {
  id: number;
  email: string;
  role: UserRole;
  name: string;
}

export interface PaginationParams {
  page: number;
  limit: number;
  offset: number;
  sortBy: string;
  order: "ASC" | "DESC";
}

declare global {
  namespace Express {
    interface Request {
      user?: JwtUserPayload;
    }
  }
}
