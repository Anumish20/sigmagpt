# SigmaGPT backend — runs the Express API *and* Ollama in one container,
# so a single deploy gives you a working chat endpoint.
FROM node:20-slim

# Ollama + curl (curl is also used by the healthcheck/entrypoint)
RUN apt-get update \
  && apt-get install -y --no-install-recommends curl ca-certificates \
  && curl -fsSL https://ollama.com/install.sh | sh \
  && apt-get clean \
  && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# install production deps only
COPY package*.json ./
RUN npm install --omit=dev

COPY . .

ENV NODE_ENV=production \
    PORT=8080 \
    OLLAMA_BASE_URL=http://localhost:11434 \
    DEFAULT_MODEL=phi3

EXPOSE 8080

# models persist here — mount a volume at this path on your host
VOLUME ["/root/.ollama"]

COPY docker-entrypoint.sh /usr/local/bin/entrypoint.sh
RUN chmod +x /usr/local/bin/entrypoint.sh

HEALTHCHECK --interval=30s --timeout=5s --start-period=120s \
  CMD curl -sf http://localhost:8080/api/health || exit 1

ENTRYPOINT ["/usr/local/bin/entrypoint.sh"]
