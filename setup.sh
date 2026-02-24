#!/bin/bash

# AI Cost Auditor Setup Script

set -e

echo "🚀 Setting up AI Cost Auditor..."

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo "📝 Creating .env file..."
    cat > .env << EOF
# Database
DATABASE_URL=postgresql://aicostauditor:aicostauditor@postgres:5432/aicostauditor

# Redis
REDIS_URL=redis://redis:6379/0

# Security
SECRET_KEY=$(openssl rand -hex 32)
JWT_SECRET=$(openssl rand -hex 32)

# API Keys (set these yourself)
OPENAI_API_KEY=your-openai-api-key
ANTHROPIC_API_KEY=your-anthropic-api-key

# CORS
CORS_ORIGINS=http://localhost:5173,http://localhost:3000
EOF
    echo "✅ Created .env file. Please update API keys before starting."
else
    echo "✅ .env file already exists"
fi

# Build and start services
echo "🔨 Building and starting services..."
docker compose up --build -d

# Wait for PostgreSQL to be ready
echo "⏳ Waiting for PostgreSQL to be ready..."
sleep 10

# Run migrations
echo "📊 Running database migrations..."
docker compose exec -T backend alembic upgrade head

# Seed database
echo "🌱 Seeding database..."
docker compose exec -T backend python scripts/seed.py

echo ""
echo "✅ Setup complete!"
echo ""
echo "📱 Access the application:"
echo "   Frontend: http://localhost:5173"
echo "   Backend API: http://localhost:8000"
echo "   API Docs: http://localhost:8000/docs"
echo ""
echo "🔑 Demo credentials:"
echo "   Email: admin@local"
echo "   Password: admin123"
echo ""
echo "📝 Don't forget to:"
echo "   1. Update OPENAI_API_KEY and ANTHROPIC_API_KEY in .env"
echo "   2. Restart services: docker compose restart backend"
echo ""
