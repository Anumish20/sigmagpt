import { createApp } from "./app.js";
import { connectDB } from "./config/db.js";
import { env } from "./config/env.js";
import { logger } from "./config/logger.js";

async function start() {
  await connectDB();
  const app = createApp();

  app.listen(env.PORT, () => {
    logger.info(`🚀 SigmaGPT API on http://localhost:${env.PORT}`);
  });
}

start();

process.on("unhandledRejection", (err) => logger.error({ err }, "unhandledRejection"));
process.on("uncaughtException", (err) => logger.error({ err }, "uncaughtException"));
