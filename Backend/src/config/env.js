import "dotenv/config";
import { z } from "zod";

/**
 * Validate environment at boot. Fail fast with a readable error
 * instead of discovering a missing var deep in a request handler.
 */
const schema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  PORT: z.coerce.number().default(8080),
  MONGODB_URI: z.string().default("mongodb://127.0.0.1:27017/sigmagpt"),
  OLLAMA_BASE_URL: z.string().default("http://localhost:11434"),
  DEFAULT_MODEL: z.string().default("phi3"),
  CORS_ORIGIN: z.string().default("http://localhost:5173"),
});

const parsed = schema.safeParse(process.env);

if (!parsed.success) {
  console.error("❌ Invalid environment configuration:");
  console.error(parsed.error.flatten().fieldErrors);
  process.exit(1);
}

export const env = parsed.data;
export const isProd = env.NODE_ENV === "production";
