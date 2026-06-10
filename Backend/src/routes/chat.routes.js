import { Router } from "express";
import { z } from "zod";
import { validate } from "../middleware/validate.js";
import { runChatTurn } from "../services/chat.service.js";
import { logger } from "../config/logger.js";

const router = Router();

const chatSchema = z.object({
  conversationId: z.string().min(1),
  message: z.string().min(1).max(8000),
  options: z
    .object({
      temperature: z.number().min(0).max(2).optional(),
      top_p: z.number().min(0).max(1).optional(),
      num_predict: z.number().int().min(1).max(4096).optional(),
    })
    .optional(),
});

/**
 * POST /api/chat — Server-Sent Events stream.
 * Emits: event:token  data:{token}
 *        event:title  data:{title}
 *        event:done   data:{content}
 *        event:error  data:{message}
 */
router.post("/", validate(chatSchema), async (req, res) => {
  const { conversationId, message, options } = req.body;

  res.writeHead(200, {
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache, no-transform",
    Connection: "keep-alive",
    "X-Accel-Buffering": "no",
  });
  res.flushHeaders?.();

  const controller = new AbortController();
  // if the client navigates away / hits stop, abort the upstream request
  req.on("close", () => controller.abort());

  const send = (event, data) =>
    res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);

  try {
    const { title } = await runChatTurn({
      publicId: conversationId,
      message,
      options,
      signal: controller.signal,
      onToken: (token) => send("token", { token }),
    });

    if (title) send("title", { title });
    send("done", { ok: true });
  } catch (err) {
    if (controller.signal.aborted) {
      logger.info("chat stream aborted by client");
    } else {
      logger.error({ err }, "chat stream failed");
      send("error", {
        message:
          err?.code === "NOT_FOUND"
            ? "Conversation not found"
            : "The model failed to respond. Is Ollama running?",
      });
    }
  } finally {
    res.end();
  }
});

export default router;
