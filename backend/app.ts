import express from "express";
import cors from "cors";
import router from "./routes/allRoutes"; // main router
import { ApiError } from "./utils/ApiError";
import cookieParser from "cookie-parser";
const app = express();

// Middlewares
app.use(
  cors({
    origin: ["http://localhost:5173", "http://localhost:3000"],
    credentials: true,
  }),
);

app.use(express.json());
app.use(cookieParser());
// Routes
app.use("/api", router);

// Centralized error handler
app.use((err: any, req: any, res: any, next: any) => {
  console.log(err);
  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
    });
  }
  res.status(500).json({
    success: false,
    message: "Internal Server Error",
  });
});

export default app;
