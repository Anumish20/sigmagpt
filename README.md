# SigmaGPT

A fast, private ChatGPT-style assistant that runs entirely on your own machine using [Ollama](https://ollama.com). No accounts, no cloud, no data leaving your computer — your conversations stay yours.

Built with React, TypeScript, Express and MongoDB, with real token-by-token streaming so it feels just like the apps you already use.

## Features

- **Streaming replies** — responses type out token by token over Server-Sent Events
- **Conversation history** — pin, rename, search and delete chats; auto-generated titles
- **Command palette** — `⌘K` to jump between chats and actions
- **Clean dark UI** — keyboard shortcuts, smooth animations, mobile responsive
- **Model picker** — switch between any models you've pulled in Ollama
- **Tunable** — adjust temperature and a per-chat system prompt from the side panel
- **Markdown + code** — syntax-highlighted code blocks with copy buttons

## Tech stack

| Layer | Tech |
|-------|------|
| Frontend | React 18, TypeScript, Tailwind CSS, Framer Motion, Zustand, TanStack Query |
| Backend | Node.js, Express, MongoDB (Mongoose), Server-Sent Events |
| AI | Ollama (local LLM — default `phi3`) |

## Getting started

### Prerequisites
- Node.js 18+
- [MongoDB](https://www.mongodb.com/try/download/community) running locally
- [Ollama](https://ollama.com) with a model pulled:
  ```bash
  ollama pull phi3
  ```

### Run it
```bash
# install dependencies for both apps
npm run install:all

# copy the example env file
cp Backend/.env.example Backend/.env

# start the backend and frontend together
npm run dev
```

Open **http://localhost:5173** and start chatting.

### Scripts
| Command | Description |
|---------|-------------|
| `npm run dev` | Run backend (`:8080`) and frontend (`:5173`) together |
| `npm run build` | Production build of the frontend |
| `npm start` | Run in production mode |
| `npm run install:all` | Install all dependencies |

## Keyboard shortcuts
`⌘K` command palette · `⌘N` new chat · `⌘B` toggle sidebar · `⌘.` settings panel

## Project structure
```
SigmaGPT/
├── Backend/    Express API — streaming chat, conversations, Ollama integration
└── Frontend/   React + TypeScript single-page app
```

## Deployment
See [DEPLOYMENT.md](./DEPLOYMENT.md). The frontend can be hosted on Vercel, with the
backend + Ollama running on a server you control (the LLM needs a real machine, not serverless).

## License
MIT
