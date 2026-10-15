import { app } from "./app.js";
import { sequelize } from "./config/database.js";
import { User } from "./models/user.model.js";

const PORT = Number(process.env.PORT) || 5000;

const startServer = async (): Promise<void> => {
  try {
    await sequelize.authenticate();

    console.log("PostgreSQL connected successfully");

    await User.sync();

    console.log("Users table synchronized successfully");

    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Unable to start server:", error);
    process.exit(1);
  }
};

startServer();
