import express from "express";
import cors from "cors";
import helmet from "helmet";
import { NotfoundHandler } from "./utils/notFoundErrorHandler.js";
import { errorHandler } from "./utils/errorHandler.js";
import { startSendOtpConsumer } from "./queues/consumers/consumer.js";
import userRoute from "./modules/user/user.route.js";
import threadRoute from "./modules/thread/thread.routes.js";
import dotenv from "dotenv";
dotenv.config();
import cookieParser from "cookie-parser";
import feedRoute from "./modules/feed/feed.routes.js";

export function createApp() {
  const app = express();  

  app.use(helmet());

  app.use(
    cors({
      origin: ["http://localhost:3000"],
      credentials: true,
    })
  );

  app.use(express.json());

  app.use(cookieParser());
  app.use("/api/v1/user",userRoute);
  app.use("/api/v1/thread", threadRoute)
  app.use("/api/v1/feed", feedRoute)
  startSendOtpConsumer();
  
  app.use(NotfoundHandler);
  app.use(errorHandler);
  return app;
}
