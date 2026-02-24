# Deployment Guide

## Prerequisites

- Docker and Docker Compose installed
- PostgreSQL 15+ (if not using Docker)
- Python 3.11+ (for local development)
- Node.js 18+ (for local development)

## Quick Start with Docker Compose

### 1. Clone and Setup

```bash
cd "AI Cost Auditor"
```

### 2. Environment Configuration

Create a `.env` file in the root directory:

```bash
# Database
DATABASE_URL=postgresql://aicostauditor:aicostauditor@postgres:5432/aicostauditor

# Redis
REDIS_URL=redis://redis:6379/0

# Security
SECRET_KEY=your-secret-key-change-in-production
JWT_SECRET=your-jwt-secret-change-in-production

# API Keys
OPENAI_API_KEY=your-openai-api-key
ANTHROPIC_API_KEY=your-anthropic-api-key

# CORS
CORS_ORIGINS=http://localhost:5173,http://localhost:3000
```

### 3. Start Services

```bash
docker compose up --build
```

This will start:
- PostgreSQL on port 5432
- Redis on port 6379
- Backend API on port 8000
- Frontend on port 5173

### 4. Initialize Database

In a new terminal:

```bash
# Run migrations
docker compose exec backend alembic upgrade head

# Seed initial data
docker compose exec backend python scripts/seed.py
```

### 5. Access the Application

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:8000
- **API Documentation**: http://localhost:8000/docs
- **Metrics**: http://localhost:8000/metrics

### 6. Login

Use the demo credentials:
- **Email**: admin@local
- **Password**: admin123

## Local Development Setup

### Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Set up environment variables
cp .env.example .env
# Edit .env with your configuration

# Run migrations
alembic upgrade head

# Seed database
python scripts/seed.py

# Start development server
uvicorn app.main:app --reload
```

### Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Set up environment variables
# Create .env file with:
# VITE_API_URL=http://localhost:8000

# Start development server
npm run dev
```

## Production Deployment

### Docker Production Build

1. **Build production images**:

```bash
# Backend
cd backend
docker build -t ai-cost-auditor-backend:latest .

# Frontend
cd frontend
docker build -t ai-cost-auditor-frontend:latest .
```

2. **Use production docker-compose**:

Create `docker-compose.prod.yml`:

```yaml
version: '3.8'

services:
  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_USER: ${POSTGRES_USER}
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
      POSTGRES_DB: ${POSTGRES_DB}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    restart: unless-stopped

  backend:
    image: ai-cost-auditor-backend:latest
    environment:
      DATABASE_URL: ${DATABASE_URL}
      SECRET_KEY: ${SECRET_KEY}
      JWT_SECRET: ${JWT_SECRET}
      OPENAI_API_KEY: ${OPENAI_API_KEY}
      ANTHROPIC_API_KEY: ${ANTHROPIC_API_KEY}
    depends_on:
      - postgres
    restart: unless-stopped
    ports:
      - "8000:8000"

  frontend:
    image: ai-cost-auditor-frontend:latest
    depends_on:
      - backend
    restart: unless-stopped
    ports:
      - "80:80"

volumes:
  postgres_data:
```

3. **Deploy**:

```bash
docker compose -f docker-compose.prod.yml up -d
```

### Environment Variables for Production

Ensure these are set securely:

- Strong `SECRET_KEY` and `JWT_SECRET`
- Secure database credentials
- Valid API keys for LLM providers
- Proper CORS origins (no wildcards)
- SSL/TLS certificates for HTTPS

### Database Backups

Set up regular backups:

```bash
# Backup
docker compose exec postgres pg_dump -U aicostauditor aicostauditor > backup.sql

# Restore
docker compose exec -T postgres psql -U aicostauditor aicostauditor < backup.sql
```

## Monitoring

### Health Checks

- Backend: `GET /healthz`
- Metrics: `GET /metrics` (Prometheus format)

### Logs

```bash
# View all logs
docker compose logs -f

# View specific service
docker compose logs -f backend
docker compose logs -f frontend
```

## Troubleshooting

### Database Connection Issues

1. Check PostgreSQL is running: `docker compose ps`
2. Verify connection string in `.env`
3. Check database logs: `docker compose logs postgres`

### Migration Issues

```bash
# Reset database (WARNING: deletes all data)
docker compose exec backend alembic downgrade base
docker compose exec backend alembic upgrade head
```

### Port Conflicts

If ports are already in use, modify `docker-compose.yml`:

```yaml
services:
  backend:
    ports:
      - "8001:8000"  # Change host port
```

## Security Checklist

- [ ] Change default admin password
- [ ] Use strong SECRET_KEY and JWT_SECRET
- [ ] Enable HTTPS in production
- [ ] Configure proper CORS origins
- [ ] Set up database backups
- [ ] Enable rate limiting (future)
- [ ] Set up monitoring and alerts
- [ ] Review and restrict API key permissions
- [ ] Enable audit logging
- [ ] Regular security updates

## Scaling

### Horizontal Scaling

- Use load balancer for multiple backend instances
- Use read replicas for database
- Use Redis for session storage and caching

### Performance Tuning

- Adjust database connection pool size
- Enable query caching
- Use CDN for frontend assets
- Implement request rate limiting
