import { Conversation } from "../models/Conversation.js";
import { Message } from "../models/Message.js";
import { buildContext } from "../ollama/prompts.js";
import { streamChat, generateTitle } from "../ollama/client.js";
import { getByPublicId } from "./conversation.service.js";
import { logger } from "../config/logger.js";
import { env } from "../config/env.js";

/**
 * Orchestrate one chat turn with live streaming.
 *
 * @param {object}   p
 * @param {string}   p.publicId      conversation public id
 * @param {string}   p.message       user message
 * @param {object}   p.options       ollama options (temperature, num_predict...)
 * @param {AbortSignal} p.signal     abort signal (client disconnect / stop)
 * @param {(t:string)=>void} p.onToken streamed token callback
 * @returns {Promise<{content, title?}>}
 */
export async function runChatTurn({ publicId, message, options, signal, onToken }) {
  const conv = await getByPublicId(publicId);

  // persist the user message
  await Message.create({
    conversationId: conv._id,
    role: "user",
    content: message,
  });

  // load history for context
  const history = await Message.find({ conversationId: conv._id })
    .sort({ createdAt: 1 })
    .lean();

  const messages = buildContext(history, conv.systemPrompt);

  const startedAt = Date.now();
  const { content, promptTokens, completionTokens } = await streamChat({
    model: conv.model || env.DEFAULT_MODEL,
    messages,
    options,
    signal,
    onToken,
  });

  // persist the assistant message
  await Message.create({
    conversationId: conv._id,
    role: "assistant",
    content,
    model: conv.model,
    tokens: { prompt: promptTokens, completion: completionTokens },
    latencyMs: Date.now() - startedAt,
    status: "complete",
  });

  // bump conversation counters
  conv.messageCount += 2;
  conv.lastMessageAt = new Date();

  // auto-title after the first exchange (best-effort, non-blocking failure)
  let newTitle;
  if (conv.titleAuto && conv.messageCount <= 2) {
    try {
      const title = await generateTitle({
        model: conv.model,
        userText: message,
        assistantText: content,
      });
      if (title) {
        conv.title = title;
        newTitle = title;
      }
    } catch (err) {
      logger.warn({ err }, "auto-title failed");
    }
  }

  await conv.save();

  return { content, title: newTitle };
}
