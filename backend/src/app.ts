import express from "express";
import cors from "cors";
import helmet from "helmet";
import { NotfoundHandler } from "./utils/notFoundErrorHandler.js";
import { errorHandler } from "./utils/errorHandler.js";
import { startSendOtpConsumer } from "./queues/consumers/consumer.js";
import userRoute from "./routes/user/user.route.js";
import dotenv from "dotenv";
dotenv.config();

export function createApp() {
  const app = express();
  //   app.use(clerkMiddleware());

  app.use(helmet());

  app.use(
    cors({
      origin: ["http://localhost:3000"],
      credentials: true,
    })
  );

  app.use(express.json());

  //   app.use("/api", apiRouter);

  app.use("/api/v1",userRoute)
  startSendOtpConsumer();
  
  app.use(NotfoundHandler);
  app.use(errorHandler);
  return app;
}
