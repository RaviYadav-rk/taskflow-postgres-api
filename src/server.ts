import { app } from "./app.js";
import { sequelize, User, Task } from "./models/index.js";
import { config } from "./config/env.js";

const startServer = async (): Promise<void> => {
  try {
    await sequelize.authenticate();
    console.log("PostgreSQL connected successfully");

    // Sync database tables with alter: true to safely adapt existing schemas
    await User.sync({ alter: true });
    console.log("Users table synchronized successfully");

    await Task.sync({ alter: true });
    console.log("Tasks table synchronized successfully");

    app.listen(config.port, () => {
      console.log(`TaskFlow Server running on http://localhost:${config.port}`);
    });
  } catch (error) {
    console.error("Unable to start server:", error);
    process.exit(1);
  }
};

startServer();
