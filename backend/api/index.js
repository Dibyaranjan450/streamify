import express from "express";
import serverless from "serverless-http";
import dotenv from "dotenv";
import createHttpError from "http-errors";
import cookieParser from "cookie-parser";
import cors from "cors";

import globalErrorHandler from "../utils/globalErrorHandler.js";
import authRouter from "../routes/auth.route.js";
import userRoutes from "../routes/user.route.js";
import chatRoutes from "../routes/chat.route.js";

const app = express();
dotenv.config();

// Middlewares //
app.use(express.json());
app.use(cookieParser());
app.use(cors({ origin: "http://localhost:5173", credentials: true }));

// Routes //
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/users", userRoutes);
app.use("/api/v1/chat", chatRoutes);

// Handle all Undefined Routes //
app.use((req, _, next) => {
  const messageString = `Can't find '${req.originalUrl}' ${
    req.method !== "GET" ? `with ${req.method} request` : ""
  } on this server!`;

  next(new createHttpError.NotFound(messageString));
});

// Global Error Handling Middleware //
app.use(globalErrorHandler);

export default serverless(app);

// Running locally if script is called directly //
if (process.env.ENVIRONMENT === "DEV") {
  const PORT = process.env.PORT || 5000;

  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}
