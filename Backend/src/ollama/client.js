import axios from "axios";
import { env } from "../config/env.js";
import { logger } from "../config/logger.js";
import { TITLE_PROMPT } from "./prompts.js";

const http = axios.create({ baseURL: env.OLLAMA_BASE_URL, timeout: 0 });

/** List installed models from Ollama. */
export async function listModels() {
  const { data } = await http.get("/api/tags", { timeout: 5000 });
  return (data.models || []).map((m) => ({
    name: m.name,
    size: m.size,
    family: m.details?.family,
    parameterSize: m.details?.parameter_size,
    modifiedAt: m.modified_at,
  }));
}

/** Quick reachability + version check for /api/health. */
export async function ping() {
  const { data } = await http.get("/api/version", { timeout: 3000 });
  return data?.version || "unknown";
}

/**
 * Stream a chat completion. Calls onToken(text) for each chunk.
 * Returns { content, promptTokens, completionTokens }. Honors an AbortSignal.
 */
export async function streamChat({ model, messages, options, signal, onToken }) {
  const response = await http.post(
    "/api/chat",
    { model, messages, stream: true, options },
    { responseType: "stream", signal }
  );

  let content = "";
  let promptTokens = 0;
  let completionTokens = 0;
  let buffer = "";

  await new Promise((resolve, reject) => {
    response.data.on("data", (chunk) => {
      buffer += chunk.toString();
      const lines = buffer.split("\n");
      buffer = lines.pop(); // keep partial line

      for (const line of lines) {
        if (!line.trim()) continue;
        try {
          const json = JSON.parse(line);
          if (json.message?.content) {
            content += json.message.content;
            onToken?.(json.message.content);
          }
          if (json.done) {
            promptTokens = json.prompt_eval_count || 0;
            completionTokens = json.eval_count || 0;
          }
        } catch (err) {
          logger.warn({ line }, "Failed to parse Ollama chunk");
        }
      }
    });
    response.data.on("end", resolve);
    response.data.on("error", reject);
  });

  return { content, promptTokens, completionTokens };
}

/** Non-streaming helper used to auto-generate a conversation title. */
export async function generateTitle({ model, userText, assistantText }) {
  const { data } = await http.post(
    "/api/chat",
    {
      model,
      stream: false,
      options: { temperature: 0.2, num_predict: 20 },
      messages: [
        { role: "system", content: TITLE_PROMPT },
        {
          role: "user",
          content: `User: ${userText}\nAssistant: ${assistantText}`,
        },
      ],
    },
    { timeout: 20000 }
  );

  return (data.message?.content || "")
    .replace(/^["'\s]+|["'\s.]+$/g, "")
    .slice(0, 60)
    .trim();
}
