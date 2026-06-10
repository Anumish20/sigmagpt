import { Router } from "express";
import { asyncHandler } from "../utils/asyncHandler.js";
import { listModels, ping } from "../ollama/client.js";
import { env } from "../config/env.js";

const router = Router();

router.get(
  "/health",
  asyncHandler(async (_req, res) => {
    let ollama = { reachable: false };
    try {
      const version = await ping();
      ollama = { reachable: true, version };
    } catch {
      ollama = { reachable: false };
    }
    res.json({ status: "ok", ollama, defaultModel: env.DEFAULT_MODEL });
  })
);

router.get(
  "/models",
  asyncHandler(async (_req, res) => {
    try {
      const models = await listModels();
      res.json({ models, default: env.DEFAULT_MODEL });
    } catch {
      res.json({ models: [], default: env.DEFAULT_MODEL });
    }
  })
);

export default router;
