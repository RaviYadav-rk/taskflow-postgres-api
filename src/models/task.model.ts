import { DataTypes, Model, Optional } from "sequelize";
import { sequelize } from "../config/database.js";
import { TaskPriority, TaskStatus } from "../types/index.js";

export interface TaskAttributes {
  id: number;
  title: string;
  description?: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate?: Date | null;
  userId: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface TaskCreationAttributes extends Optional<
  TaskAttributes,
  | "id"
  | "description"
  | "status"
  | "priority"
  | "dueDate"
  | "createdAt"
  | "updatedAt"
> {}

export class Task
  extends Model<TaskAttributes, TaskCreationAttributes>
  implements TaskAttributes
{
  public id!: number;
  public title!: string;
  public description!: string | null;
  public status!: TaskStatus;
  public priority!: TaskPriority;
  public dueDate!: Date | null;
  public userId!: number;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Task.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    title: {
      type: DataTypes.STRING(200),
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM("TODO", "IN_PROGRESS", "COMPLETED", "CANCELLED"),
      defaultValue: "TODO",
      allowNull: false,
    },
    priority: {
      type: DataTypes.ENUM("LOW", "MEDIUM", "HIGH", "URGENT"),
      defaultValue: "MEDIUM",
      allowNull: false,
    },
    dueDate: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "users",
        key: "id",
      },
      onDelete: "CASCADE",
    },
  },
  {
    sequelize,
    tableName: "tasks",
    timestamps: true,
  },
);
