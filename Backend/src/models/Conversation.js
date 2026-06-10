import mongoose from "mongoose";
import { nanoid } from "nanoid";

const ConversationSchema = new mongoose.Schema(
  {
    // public id used by the client (stable, URL-safe)
    publicId: { type: String, default: () => nanoid(16), unique: true, index: true },

    // single-user app for now; field is ready for real auth later
    userId: { type: String, default: "local", index: true },

    title: { type: String, default: "New chat" },
    titleAuto: { type: Boolean, default: true },

    model: { type: String, default: "phi3" },
    systemPrompt: { type: String, default: "" },

    pinned: { type: Boolean, default: false },
    messageCount: { type: Number, default: 0 },
    lastMessageAt: { type: Date, default: Date.now },

    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// list query: a user's most-recent, non-deleted conversations
ConversationSchema.index({ userId: 1, isDeleted: 1, lastMessageAt: -1 });
ConversationSchema.index({ title: "text" });

export const Conversation = mongoose.model("Conversation", ConversationSchema);
