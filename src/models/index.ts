import { User } from "./user.model.js";
import { Task } from "./task.model.js";
import { sequelize } from "../config/database.js";

// Setup associations
User.hasMany(Task, {
  foreignKey: "userId",
  as: "tasks",
  onDelete: "CASCADE",
});

Task.belongsTo(User, {
  foreignKey: "userId",
  as: "user",
});

export { User, Task, sequelize };
