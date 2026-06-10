#!/bin/sh
set -e

# 1. start Ollama in the background
ollama serve &

# 2. wait for it to accept connections
echo "⏳ Waiting for Ollama to start…"
until curl -sf http://localhost:11434/api/version >/dev/null 2>&1; do
  sleep 1
done
echo "✅ Ollama is up"

# 3. pull the default model if it isn't already present (first boot only)
MODEL="${DEFAULT_MODEL:-phi3}"
echo "⬇️  Ensuring model '$MODEL' is available…"
ollama pull "$MODEL" || echo "⚠️  Could not pull $MODEL (continuing)"

# 4. hand off to the API server (PID 1)
echo "🚀 Starting SigmaGPT API"
exec node src/server.js
