import mongoose from "mongoose";

const MessageSchema = new mongoose.Schema(
  {
    conversationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Conversation",
      required: true,
      index: true,
    },
    role: { type: String, enum: ["user", "assistant", "system"], required: true },
    content: { type: String, default: "" },

    model: { type: String },
    tokens: {
      prompt: { type: Number, default: 0 },
      completion: { type: Number, default: 0 },
    },
    latencyMs: { type: Number },

    // parentId enables edit/branch trees later
    parentId: { type: mongoose.Schema.Types.ObjectId, ref: "Message" },
    status: {
      type: String,
      enum: ["complete", "streaming", "error"],
      default: "complete",
    },
  },
  { timestamps: true }
);

// cursor pagination within a conversation
MessageSchema.index({ conversationId: 1, createdAt: 1 });

export const Message = mongoose.model("Message", MessageSchema);
