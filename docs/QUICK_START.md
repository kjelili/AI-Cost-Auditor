# Quick Start Guide

Get up and running with AI Cost Auditor in 5 minutes!

## Prerequisites

- Docker Desktop installed and running
- OpenAI or Anthropic API key (optional for testing)

## Step 1: Setup

### Windows
```powershell
.\setup.ps1
```

### Linux/Mac
```bash
chmod +x setup.sh
./setup.sh
```

### Manual Setup

1. **Create environment file**:
   ```bash
   # Copy and edit .env with your API keys
   ```

2. **Start services**:
   ```bash
   docker compose up --build
   ```

3. **Initialize database** (in new terminal):
   ```bash
   docker compose exec backend alembic upgrade head
   docker compose exec backend python scripts/seed.py
   ```

## Step 2: Access the Application

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:8000
- **API Docs**: http://localhost:8000/docs

## Step 3: Login

Use the demo credentials:
- **Email**: admin@local
- **Password**: admin123

## Step 4: Create a Virtual Key

1. Go to **Admin** page
2. Click **Create Virtual Key**
3. Fill in the form:
   - Name: "My Test Key"
   - User Email: your email
   - Environment: dev
   - Monthly Budget Cap: 100
4. Click **Create Key**
5. Copy the generated key

## Step 5: Test the Proxy

### Using curl

```bash
curl -X POST http://localhost:8000/proxy/openai/v1/chat/completions \
  -H "X-Virtual-Key: vk_your_key_here" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "gpt-4o-mini",
    "messages": [{"role": "user", "content": "Hello!"}]
  }'
```

### Using Python

```python
import requests

response = requests.post(
    "http://localhost:8000/proxy/openai/v1/chat/completions",
    headers={
        "X-Virtual-Key": "vk_your_key_here",
        "Content-Type": "application/json"
    },
    json={
        "model": "gpt-4o-mini",
        "messages": [{"role": "user", "content": "Hello!"}]
    }
)

print(response.json())
```

## Step 6: View Metrics

1. Go to **Dashboard**
2. See your costs, usage, and waste detection
3. Check **Top Users** and **Top Projects**
4. Review **Waste Detection** for repeated prompts

## Next Steps

- Read the [Architecture Documentation](ARCHITECTURE.md)
- Check the [API Reference](API.md)
- Review [Deployment Guide](DEPLOYMENT.md) for production setup

## Troubleshooting

### Services won't start
- Check Docker Desktop is running
- Verify ports 5173, 8000, 5432, 6379 are available
- Check logs: `docker compose logs`

### Database errors
- Wait a few seconds for PostgreSQL to initialize
- Check: `docker compose ps`
- View logs: `docker compose logs postgres`

### API key errors
- Make sure you've set `OPENAI_API_KEY` or `ANTHROPIC_API_KEY` in `.env`
- Restart backend: `docker compose restart backend`

## Support

For issues or questions:
1. Check the [Build Process](BUILD_PROCESS.md) documentation
2. Review error logs: `docker compose logs`
3. Check API docs: http://localhost:8000/docs
