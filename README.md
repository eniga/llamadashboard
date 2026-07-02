# Llama Dashboard

A modern web dashboard for managing and monitoring your [llama.cpp](https://github.com/ggerganov/llama.cpp) server instance, built with **Blazor Server** and **.NET 8**.

## Features

- **Dashboard Overview** — Quick stats on GPUs, models, tokens, and performance
- **Device Monitoring** — View GPU information including VRAM usage and CUDA details
- **Model Management** — List, load, and unload models with a single click
- **Statistics & Metrics** — Track token usage, processing times, and generation speed
- **Live Chat** — Test models directly with a chat interface
- **Editable Settings** — Configure server URL, API key, and GPU info in real-time
- **Responsive Design** — Works on desktop and mobile

## Architecture

```
┌─────────────────────────────────┐     ┌──────────────────────────┐
│     Llama Dashboard (Blazor)    │     │   llama.cpp Server       │
│  .NET 8 • Blazor Server         │     │  https://llm.aradhel.dev │
│  SignalR • HttpClient           │     │          /v1             │
└─────────────┬───────────────────┘     └────────────┬─────────────┘
              │                                     │
              └───────────── OpenAI Compatible ──────┘
```

## Prerequisites

- [.NET 8 SDK](https://dotnet.microsoft.com/download/dotnet/8.0)
- [Docker](https://www.docker.com/) (for containerized deployment)
- A running [llama.cpp server](https://github.com/ggerganov/llama.cpp) with OpenAI-compatible API

## Quick Start

### Local Development

```bash
cd src/LlamaDashboard
dotnet restore
dotnet run
```

The dashboard will be available at `http://localhost:5000` or `https://localhost:5001`.

### Docker Deployment

```bash
# Build and run
docker compose up -d --build

# View logs
docker compose logs -f llama-dashboard

# Stop
docker compose down
```

The dashboard will be available at `http://localhost:8080`.

## Configuration

Configuration is managed via `appsettings.json` or environment variables.

### appsettings.json

```json
{
  "LlamaCpp": {
    "Url": "https://llm.aradhel.dev/v1",
    "ApiKey": "",
    "RefreshInterval": 10000
  },
  "Dashboard": {
    "Name": "Llama Dashboard",
    "Theme": "dark"
  },
  "GPU": {
    "Primary": "NVIDIA RTX PRO 4000 Blackwell",
    "VramMB": 24576,
    "CudaVersion": "12.x"
  }
}
```

### Environment Variables

```bash
export LlamaCpp__Url=https://llm.aradhel.dev/v1
export LlamaCpp__ApiKey=your-api-key
export GPU__Primary="NVIDIA RTX PRO 4000 Blackwell"
```

## Project Structure

```
llamadashboard/
├── LlamaDashboard.sln
├── src/
│   └── LlamaDashboard/
│       ├── LlamaDashboard.csproj
│       ├── Program.cs
│       ├── appsettings.json
│       ├── Models/
│       │   ├── Device.cs
│       │   ├── Model.cs
│       │   ├── Stats.cs
│       │   ├── ChatMessage.cs
│       │   └── Config.cs
│       ├── Services/
│       │   ├── ILlamaCppService.cs
│       │   └── ConfigService.cs
│       ├── Pages/
│       │   ├── Dashboard.razor
│       │   ├── Devices.razor
│       │   ├── Models.razor
│       │   ├── Stats.razor
│       │   ├── Chat.razor
│       │   ├── Settings.razor
│       │   ├── _Host.cshtml
│       │   └── _Imports.razor
│       ├── Shared/
│       │   ├── MainLayout.razor
│       │   └── NavMenu.razor
│       └── wwwroot/
│           └── css/
│               └── site.css
├── Dockerfile
├── docker-compose.yml
└── README.md
```

## API Endpoints

The dashboard communicates with llama.cpp via its OpenAI-compatible API:

- `GET /v1/models` — List available models
- `POST /v1/models/load` — Load a model
- `POST /v1/models/unload` — Unload a model
- `GET /stats` — Get server statistics
- `POST /v1/chat/completions` — Chat completions

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Blazor Server, C#, Razor Components |
| Backend | ASP.NET Core 8, HttpClient |
| Styling | Custom CSS (dark theme) |
| Deployment | Docker, Docker Compose |
| API | OpenAI Compatible (llama.cpp) |

## Additional Features

- **Real-time Updates** — SignalR for live data refresh
- **Editable Settings** — Change server URL and other settings without restarting
- **Health Checks** — Monitor server connectivity
- **Responsive Layout** — Mobile-friendly design
- **Dark Theme** — Easy on the eyes for 24/7 monitoring

## Troubleshooting

### Dashboard shows "Disconnected"

- Verify the llama.cpp server URL in Settings
- Check network connectivity: `curl http://your-llm-server:8080/health`
- Ensure the server allows CORS if accessed from a different origin

### Models list is empty

- Ensure the llama.cpp server has models in its models directory
- Check that the server's `--model` or models directory is properly configured
- Try loading a model manually via the Models page

### Chat not responding

- Verify a model is loaded on the server
- Check server logs for inference errors
- Ensure the server allows chat completions

## License

MIT

## Acknowledgments

- [llama.cpp](https://github.com/ggerganov/llama.cpp) — High-performance LLM inference
- [Blazor](https://dotnet.microsoft.com/apps/aspnet/web-apps/blazor) — .NET web framework
- [.NET 8](https://dotnet.microsoft.com/download/dotnet/8.0) — Modern .NET runtime
