import { Conversation } from "../models/Conversation.js";
import { Message } from "../models/Message.js";
import { ApiError } from "../utils/ApiError.js";
import { env } from "../config/env.js";

const USER = "local";

export async function listConversations() {
  const items = await Conversation.find({ userId: USER, isDeleted: false })
    .sort({ pinned: -1, lastMessageAt: -1 })
    .limit(200)
    .lean();

  return items.map(serialize);
}

export async function createConversation({ title, model, systemPrompt } = {}) {
  const conv = await Conversation.create({
    userId: USER,
    title: title || "New chat",
    model: model || env.DEFAULT_MODEL,
    systemPrompt: systemPrompt || "",
  });
  return serialize(conv);
}

export async function getByPublicId(publicId) {
  const conv = await Conversation.findOne({ publicId, isDeleted: false });
  if (!conv) throw ApiError.notFound("Conversation not found");
  return conv;
}

export async function getMessages(publicId) {
  const conv = await getByPublicId(publicId);
  const messages = await Message.find({ conversationId: conv._id })
    .sort({ createdAt: 1 })
    .lean();
  return messages.map(serializeMessage);
}

export async function updateConversation(publicId, patch) {
  const allowed = {};
  if (typeof patch.title === "string") {
    allowed.title = patch.title;
    allowed.titleAuto = false;
  }
  if (typeof patch.pinned === "boolean") allowed.pinned = patch.pinned;
  if (typeof patch.systemPrompt === "string") allowed.systemPrompt = patch.systemPrompt;
  if (typeof patch.model === "string") allowed.model = patch.model;

  const conv = await Conversation.findOneAndUpdate(
    { publicId, isDeleted: false },
    { $set: allowed },
    { new: true }
  );
  if (!conv) throw ApiError.notFound("Conversation not found");
  return serialize(conv);
}

export async function deleteConversation(publicId) {
  const conv = await Conversation.findOneAndUpdate(
    { publicId },
    { $set: { isDeleted: true } },
    { new: true }
  );
  if (!conv) throw ApiError.notFound("Conversation not found");
  return { success: true };
}

export function serialize(c) {
  return {
    id: c.publicId,
    title: c.title,
    titleAuto: c.titleAuto,
    model: c.model,
    systemPrompt: c.systemPrompt,
    pinned: c.pinned,
    messageCount: c.messageCount,
    lastMessageAt: c.lastMessageAt,
    createdAt: c.createdAt,
  };
}

export function serializeMessage(m) {
  return {
    id: String(m._id),
    role: m.role,
    content: m.content,
    status: m.status,
    createdAt: m.createdAt,
  };
}
