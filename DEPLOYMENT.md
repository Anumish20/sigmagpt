# Deploying SigmaGPT

SigmaGPT is split into a **static frontend** and a **stateful backend that talks to Ollama**.
The frontend deploys cleanly to Vercel. The backend **cannot** run on Vercel — it needs a
persistent Ollama process and long-lived streaming — so host it on a real server.

```
┌────────────┐      HTTPS / SSE      ┌──────────────────────────────┐
│  Vercel    │  ───────────────────▶ │  Backend host (Railway/VPS)  │
│  (frontend)│   VITE_API_URL        │  Express + Ollama + (Atlas)  │
└────────────┘                       └──────────────────────────────┘
```

---

## 1. MongoDB → Atlas

1. Create a free cluster at [mongodb.com/atlas](https://www.mongodb.com/atlas).
2. Add a database user and allow your backend host's IP (or `0.0.0.0/0` to start).
3. Copy the connection string → it becomes `MONGODB_URI`.

## 2. Backend + Ollama → a hosted server (Docker, one container)

`Backend/Dockerfile` bundles **the Express API + Ollama in a single image**. On boot it starts
Ollama, pulls `DEFAULT_MODEL`, then starts the API — so one deploy gives a working chat endpoint.

> ⚠️ **RAM matters.** `phi3` (3.8B) needs roughly **4 GB RAM** to run. Free tiers (512 MB) will
> **not** work — pick a paid instance (Railway "Pro" usage / Render **Standard** or larger). Bigger
> models want a GPU host.

### Option A — Railway
1. New Project → **Deploy from GitHub repo**.
2. Settings → **Root Directory = `Backend`** (so it finds `Dockerfile` + `railway.json`).
3. Add a **Volume** mounted at `/root/.ollama` (persists the model across restarts).
4. Variables:
   ```
   MONGODB_URI = <your Atlas URI>
   CORS_ORIGIN = https://your-app.vercel.app
   DEFAULT_MODEL = phi3
   NODE_ENV = production
   ```
5. Deploy. First boot is slow (it downloads the model once).

### Option B — Render
Render auto-detects `render.yaml` (a Blueprint). Push the repo → **New → Blueprint** → set
`MONGODB_URI` and `CORS_ORIGIN` in the dashboard → deploy. The disk + plan are already declared.

### Option C — any VPS (DigitalOcean / Hetzner)
```bash
git clone <your-repo> && cd sigmagpt/Backend
docker build -t sigmagpt-backend .
docker run -d -p 8080:8080 \
  -e MONGODB_URI="<atlas-uri>" \
  -e CORS_ORIGIN="https://your-app.vercel.app" \
  -v ollama-models:/root/.ollama \
  sigmagpt-backend
```

Whichever you pick, your backend URL becomes `https://…/api` → that's the `VITE_API_URL` for Vercel.

## 3. Frontend → Vercel

1. Push this repo to GitHub.
2. In Vercel: **New Project → import the repo → set Root Directory to `Frontend/`**.
   (`Frontend/vercel.json` already sets the Vite framework, build command, and SPA rewrite.)
3. Add an environment variable:
   ```
   VITE_API_URL = https://your-backend-host.com/api
   ```
4. Deploy. Vercel builds `dist/` and serves it on the CDN.

## 4. Connect them

- Make sure the backend's `CORS_ORIGIN` matches your exact Vercel URL (including `https://`).
- Open your Vercel URL — it should stream responses from your hosted Ollama.
- Health check: `https://your-backend-host.com/api/health`.

---

## Cost / reality check

- Vercel frontend: free tier is fine.
- Backend + Ollama: needs an always-on server (~$5–20/mo CPU box for small models; GPU for big ones).
- This is **no longer "fully local/private"** — your prompts now travel to your server. If privacy
  is the priority, prefer the **local-first** workflow in the README (clone + `npm run dev`).
