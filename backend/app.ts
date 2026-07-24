import express from "express";
import cors from "cors";
import router from "./routes/allRoutes"; // main router
import { ApiError } from "./utils/ApiError";
import cookieParser from "cookie-parser";
const app = express();

// Middlewares
app.use(
  cors({
    origin: [
      // Web frontends
      "http://localhost:5173",
      "http://localhost:3000",
      // Expo
      "exp://192.168.0.103:8081",
      "http://localhost:8081",
      // Android emulator (accessing host machine)
      "http://10.0.2.2:5000",
      // Real device on same network (replace with your PC's local IP)
      // "http://192.168.0.103:5000",
    ],
    credentials: true,
  }),
);

app.use("/api/ecom/stripe/webhook", express.raw({ type: "application/json" }));
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
