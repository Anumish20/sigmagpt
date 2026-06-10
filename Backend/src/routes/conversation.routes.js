import { Router } from "express";
import { z } from "zod";
import { validate } from "../middleware/validate.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import * as service from "../services/conversation.service.js";

const router = Router();

const createSchema = z.object({
  title: z.string().max(120).optional(),
  model: z.string().optional(),
  systemPrompt: z.string().max(4000).optional(),
});

const patchSchema = z.object({
  title: z.string().min(1).max(120).optional(),
  pinned: z.boolean().optional(),
  systemPrompt: z.string().max(4000).optional(),
  model: z.string().optional(),
});

router.get(
  "/",
  asyncHandler(async (_req, res) => {
    res.json({ conversations: await service.listConversations() });
  })
);

router.post(
  "/",
  validate(createSchema),
  asyncHandler(async (req, res) => {
    res.status(201).json(await service.createConversation(req.body));
  })
);

router.get(
  "/:id/messages",
  asyncHandler(async (req, res) => {
    res.json({ messages: await service.getMessages(req.params.id) });
  })
);

router.patch(
  "/:id",
  validate(patchSchema),
  asyncHandler(async (req, res) => {
    res.json(await service.updateConversation(req.params.id, req.body));
  })
);

router.delete(
  "/:id",
  asyncHandler(async (req, res) => {
    res.json(await service.deleteConversation(req.params.id));
  })
);

export default router;
