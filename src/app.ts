import express from "express";
import { apiRouter } from "./routes/index.js";
import { errorHandler, notFoundHandler } from "./middleware/error.middleware.js";

export const app = express();

// Body parser
app.use(express.json());

// API health endpoint
app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "TaskFlow API is running smoothly",
    timestamp: new Date().toISOString(),
  });
});

// Mount consolidated API routes
app.use("/api", apiRouter);

// Catch 404 for unhandled routes
app.use(notFoundHandler);

// Centralized error handling middleware
app.use(errorHandler);
