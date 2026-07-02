# Llama Dashboard

A modern web dashboard for managing and monitoring your [llama.cpp](https://github.com/ggerganov/llama.cpp) server instance.

![Dashboard Preview](https://img.shields.io/badge/status-active-green) ![License](https://img.shields.io/badge/license-MIT-blue)

![Llama Dashboard](https://img.shields.io/badge/dynamic/json?url=https%3A%2F%2Fllm.aradhel.dev%2Fv1%2Fmodels&query=%24.data|length&prefix=Models&logo=data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjZmZmIiBzdHJva2Utd2lkdGg9IjIiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCI+PHBhdGggZD0iTTEyIDJhMjAgMjAgMCAxIDAgMjAgMjBIMjJhMjAgMjAgMCAwIDAtMjAtMjB6Ii8+PHBhdGggZD0ibTE2IDguMjE2IDQuMjQzIDQuMjQzLS45NDMuOTQzTDExLjUgOS4xMDcgNy42NTcgMTIuOTUgLjk0MyAxMi45NUw1LjI4NiA4LjcxNCAxMi41IDE0LjQ0IDE5LjcwNCA4LjcxNHoiLz48L3N2Zz4=)

## Features

- **Device Monitoring** — View GPU information including VRAM usage, compute capability, and CUDA version
- **Model Management** — List all available models, load and unload models with a single click
- **Statistics & Metrics** — Track token usage, processing times, tokens/second, and prompt vs output distribution
- **Live Chat** — Test models directly with a streaming chat interface that supports Markdown rendering
- **Health Checks** — Monitor server connectivity with automatic reconnection
- **Responsive Design** — Dark-themed UI that works on desktop and mobile

## Architecture

```
┌─────────────────────────────────┐     ┌──────────────────────────┐
│         Llama Dashboard         │     │   llama.cpp Server       │
│  ┌───────────────────────────┐  │     │  https://llm.aradhel.dev │
│  │   React Frontend (Vite)   │  │     │          /v1             │
│  │   Tailwind CSS + Lucide   │  │     │   (OpenAI-compatible)    │
│  └─────────────┬─────────────┘  │     └────────────┬─────────────┘
│                │                │                   │
│  ┌─────────────▼─────────────┐  │     ┌────────────▼─────────────┐
│  │   Express.js Backend      │  │     │   Model Inference        │
│  │   - API Proxy             │  │     │   Token Processing       │
│  │   - Stats Aggregation     │  │     │   GPU Compute            │
│  │   - Health Checks         │  │     └──────────────────────────┘
│  └───────────────────────────┘  │
└─────────────────────────────────┘
```

## Prerequisites

- **Docker** and **Docker Compose** installed on your server
- A running [llama.cpp server](https://github.com/ggerganov/llama.cpp) instance with the OpenAI-compatible API enabled
- Network access from the dashboard container to the llama.cpp server

## Installation

### 1. Clone the repository

```bash
git clone https://github.com/yourusername/llama-dashboard.git
cd llama-dashboard
```

### 2. Configure environment variables

```bash
cp .env.example .env
```

Edit `.env` and update the values:

```env
# llama.cpp Server URL (OpenAI-compatible endpoint)
LLAMACPP_URL=https://llm.aradhel.dev/v1

# API key (leave empty if no auth required)
LLAMACPP_API_KEY=your-api-key-here

# Dashboard settings
DASHBOARD_NAME=Llama Dashboard
REFRESH_INTERVAL=10000
THEME=dark

# GPU information (optional — used when server doesn't expose device info)
PRIMARY_GPU=NVIDIA RTX PRO 4000 Blackwell
VRAM=24576
CUDA_VERSION=12.x
```

### 3. Build and run with Docker

```bash
docker compose up -d --build
```

The dashboard will be available at `http://localhost:3001` (or your server's IP:3001).

### 4. Verify the deployment

```bash
# Check container status
docker compose ps

# View logs
docker compose logs -f llama-dashboard

# Test the health endpoint
curl http://localhost:3001/api/health
```

## Development

For local development without Docker:

```bash
# Install all dependencies
npm run install:all

# Start the server (port 3001)
npm run dev:server

# Start the client (port 5173, proxies API to 3001)
npm run dev:client

# Or run both simultaneously
npm run dev
```

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/models` | List all available models |
| `GET` | `/api/models/:id` | Get specific model info |
| `POST` | `/api/models/load` | Load a model |
| `POST` | `/api/models/unload` | Unload a model |
| `GET` | `/api/stats` | Get server statistics |
| `GET` | `/api/stats/metrics` | Get Prometheus-style metrics |
| `GET` | `/api/devices` | List GPU devices |
| `GET` | `/api/config` | Get dashboard configuration |
| `POST` | `/api/chat` | Send chat messages (streaming) |
| `GET` | `/api/health` | Health check |

## Docker Configuration

### docker-compose.yml

```yaml
services:
  llama-dashboard:
    build: .
    container_name: llama-dashboard
    ports:
      - "3001:3001"
    environment:
      - NODE_ENV=production
      - PORT=3001
      - LLAMACPP_URL=https://llm.aradhel.dev/v1
    restart: unless-stopped
```

### Custom port mapping

To use a different port, modify the `ports` section:

```yaml
ports:
  - "8080:3001"   # Access at http://your-ip:8080
```

### Using a reverse proxy (nginx)

```nginx
server {
    listen 80;
    server_name dashboard.example.com;

    location / {
        proxy_pass http://llama-dashboard:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## Project Structure

```
llama-dashboard/
├── server/                    # Express.js backend
│   ├── index.js               # Main server entry point
│   ├── package.json
│   └── routes/
│       ├── models.js          # Model management endpoints
│       ├── stats.js           # Statistics and metrics
│       ├── devices.js         # GPU device information
│       ├── chat.js            # Chat completions (streaming)
│       ├── config.js          # Dashboard configuration
│       └── health.js          # Health check endpoint
├── client/                    # React frontend
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   └── src/
│       ├── main.jsx
│       ├── App.jsx
│       ├── api/
│       │   └── client.js      # API client functions
│       ├── components/
│       │   ├── Dashboard.jsx  # Overview dashboard
│       │   ├── Devices.jsx    # GPU/device details
│       │   ├── Models.jsx     # Model management
│       │   ├── Stats.jsx      # Statistics display
│       │   ├── Chat.jsx       # Streaming chat interface
│       │   └── SettingsPanel.jsx
│       ├── styles/
│       │   └── global.css     # Tailwind custom utilities
│       └── utils/
│           └── formatters.js  # Formatting helpers
├── Dockerfile
├── docker-compose.yml
├── .env.example
└── README.md
```

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Vite, Tailwind CSS, Lucide Icons, React Markdown |
| Backend | Node.js, Express.js, Axios |
| Containerization | Docker, Docker Compose |
| API Protocol | OpenAI-compatible (llama.cpp) |

## Additional Features

- **Streaming responses** — Chat messages appear in real-time as the model generates tokens
- **Markdown rendering** — Chat responses render Markdown formatted text
- **Copy to clipboard** — One-click copy for any chat response
- **Auto-refresh** — Dashboard data refreshes automatically (configurable interval)
- **Health monitoring** — Container health checks via Docker
- **Dark theme** — Easy on the eyes for 24/7 monitoring

## Troubleshooting

### Dashboard shows "Disconnected"

- Verify the llama.cpp server URL is correct in `.env`
- Check network connectivity: `curl http://your-llm-server:8080/health`
- If using a custom port, ensure the container can reach the server

### Models list is empty

- Ensure the llama.cpp server has models in its models directory
- Check that the server's `--model` or models directory is properly configured
- Try loading a model manually via the dashboard UI

### Chat not responding

- Verify a model is loaded on the server
- Check server logs for inference errors
- Ensure the server allows chat completions (some builds disable this)

## License

MIT

## Acknowledgments

- [llama.cpp](https://github.com/ggerganov/llama.cpp) — High-performance LLM inference
- [React](https://react.dev/) — UI library
- [Tailwind CSS](https://tailwindcss.com/) — Utility-first CSS framework
