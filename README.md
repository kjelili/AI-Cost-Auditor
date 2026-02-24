# AI Cost Auditor

**The AWS Cost Explorer for LLMs — with guardrails that stop waste before it happens.**

AI Cost Auditor is a secure LLM proxy + financial intelligence layer that sits between applications and LLM providers (OpenAI, Anthropic, etc.). It transforms raw token usage into cost attribution, behavioral insights, budget enforcement, waste detection, and executive-level reporting.

## 🎯 Key Features

- **Cost Attribution**: Track spend by user, team, project, and agent
- **Waste Detection**: Automatically flags repeated prompts, over-reasoning, bloated context windows, and runaway agents
- **Budget Enforcement**: Hard and soft controls with caps, limits, and alerts
- **Prompt Intelligence**: Smart optimization suggestions and prompt classification
- **Audit & Compliance**: Immutable usage logs with full prompt/response lineage
- **Enterprise Ready**: SOC 2 / ISO-aligned reporting, SSO-ready architecture

## 🏗️ Architecture

```
Apps/Agents/SDKs
    |
    | X-Virtual-Key: vk_xxx
    v
[LLM Proxy Gateway] -----> Upstream providers (OpenAI / Anthropic / etc.)
    |
    | writes UsageEvent + policy outcomes
    v
[Postgres] -----> [Metrics API] -----> [React Dashboard]
```

## 🚀 Quick Start

### Prerequisites

- Docker and Docker Compose
- Node.js 18+ (for local development)
- Python 3.11+ (for local development)

### Running with Docker Compose

```bash
docker compose up --build
```

Then open:
- **UI**: http://localhost:5173
- **API**: http://localhost:8000
- **API Docs**: http://localhost:8000/docs
- **Metrics**: http://localhost:8000/metrics

### Demo Credentials

- **Email**: admin@local
- **Password**: admin123

## 📺 Demo Video (Advertisement)

A promotional video is built with **Remotion** (deterministic, schema-driven). To render the demo video:

```bash
cd remotion
npm install
npx remotion render AiCostAuditorDemo out/demo.mp4
```

See [remotion/src/compositions/ai-cost-auditor-demo/README.md](remotion/src/compositions/ai-cost-auditor-demo/README.md) for props and structure.

## 📖 Documentation

See [docs/](./docs/) for detailed documentation on:
- Architecture overview
- API reference
- Rebuild process (UI/UX, landing, Remotion)
- Deployment guide
- Development setup

## 🔌 Using the Proxy

### OpenAI-style chat completion

```bash
POST http://localhost:8000/proxy/openai/v1/chat/completions
Headers:
  X-Virtual-Key: <your_vk>
Body:
{
  "model": "gpt-4o-mini",
  "messages": [{"role":"user","content":"Hello!"}]
}
```

### Anthropic messages

```bash
POST http://localhost:8000/proxy/anthropic/v1/messages
Headers:
  X-Virtual-Key: <your_vk>
Body:
{
  "model": "claude-3-5-sonnet-20241022",
  "max_tokens": 1024,
  "messages": [{"role":"user","content":"Hello!"}]
}
```

## 🛠️ Development

### Backend Setup

```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
alembic upgrade head
uvicorn app.main:app --reload
```

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

## 📊 Tech Stack

- **Backend**: FastAPI, SQLAlchemy, Alembic, PostgreSQL
- **Frontend**: React, TypeScript, Vite, Tailwind CSS, Recharts
- **Infrastructure**: Docker, Docker Compose
- **Auth**: JWT tokens

## 📝 License

Proprietary - All rights reserved
