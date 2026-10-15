import express from "express";
import { router } from "./routes/user.routes.js";

export const app = express();

app.use(express.json());

app.use("/api/users", router);

app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "TaskFlow API is running",
  });
});
