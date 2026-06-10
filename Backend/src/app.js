import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import pinoHttp from "pino-http";

import { env } from "./config/env.js";
import { logger } from "./config/logger.js";
import { notFound, errorHandler } from "./middleware/error.js";

import conversationRoutes from "./routes/conversation.routes.js";
import chatRoutes from "./routes/chat.routes.js";
import metaRoutes from "./routes/meta.routes.js";

export function createApp() {
  const app = express();

  // API is consumed cross-origin (frontend may live on Vercel), so don't
  // let helmet's resource policy block it.
  app.use(helmet({ crossOriginResourcePolicy: false }));
  app.use(
    cors({
      origin: env.CORS_ORIGIN.split(",").map((s) => s.trim()),
      credentials: true,
    })
  );
  app.use(express.json({ limit: "1mb" }));
  app.use(pinoHttp({ logger, autoLogging: { ignore: (req) => req.url === "/api/health" } }));

  // throttle the expensive chat endpoint
  app.use(
    "/api/chat",
    rateLimit({ windowMs: 60_000, max: 40, standardHeaders: true, legacyHeaders: false })
  );

  app.use("/api/conversations", conversationRoutes);
  app.use("/api/chat", chatRoutes);
  app.use("/api", metaRoutes);

  app.get("/", (_req, res) => res.json({ name: "SigmaGPT API", status: "running" }));

  app.use(notFound);
  app.use(errorHandler);

  return app;
}
