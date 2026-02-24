# AI Cost Auditor Setup Script for Windows

Write-Host "🚀 Setting up AI Cost Auditor..." -ForegroundColor Cyan

# Check if Docker is installed
try {
    docker --version | Out-Null
} catch {
    Write-Host "❌ Docker is not installed. Please install Docker Desktop first." -ForegroundColor Red
    exit 1
}

# Check if Docker Compose is installed
try {
    docker compose version | Out-Null
} catch {
    Write-Host "❌ Docker Compose is not installed. Please install Docker Desktop first." -ForegroundColor Red
    exit 1
}

# Create .env file if it doesn't exist
if (-not (Test-Path .env)) {
    Write-Host "📝 Creating .env file..." -ForegroundColor Yellow
    
    # Generate random secrets
    $secretKey = -join ((48..57) + (65..90) + (97..122) | Get-Random -Count 64 | ForEach-Object {[char]$_})
    $jwtSecret = -join ((48..57) + (65..90) + (97..122) | Get-Random -Count 64 | ForEach-Object {[char]$_})
    
    @"
# Database
DATABASE_URL=postgresql://aicostauditor:aicostauditor@postgres:5432/aicostauditor

# Redis
REDIS_URL=redis://redis:6379/0

# Security
SECRET_KEY=$secretKey
JWT_SECRET=$jwtSecret

# API Keys (set these yourself)
OPENAI_API_KEY=your-openai-api-key
ANTHROPIC_API_KEY=your-anthropic-api-key

# CORS
CORS_ORIGINS=http://localhost:5173,http://localhost:3000
"@ | Out-File -FilePath .env -Encoding utf8
    
    Write-Host "✅ Created .env file. Please update API keys before starting." -ForegroundColor Green
} else {
    Write-Host "✅ .env file already exists" -ForegroundColor Green
}

# Build and start services
Write-Host "🔨 Building and starting services..." -ForegroundColor Yellow
docker compose up --build -d

# Wait for PostgreSQL to be ready
Write-Host "⏳ Waiting for PostgreSQL to be ready..." -ForegroundColor Yellow
Start-Sleep -Seconds 15

# Run migrations
Write-Host "📊 Running database migrations..." -ForegroundColor Yellow
docker compose exec -T backend alembic upgrade head

# Seed database
Write-Host "🌱 Seeding database..." -ForegroundColor Yellow
docker compose exec -T backend python scripts/seed.py

Write-Host ""
Write-Host "✅ Setup complete!" -ForegroundColor Green
Write-Host ""
Write-Host "📱 Access the application:" -ForegroundColor Cyan
Write-Host "   Frontend: http://localhost:5173"
Write-Host "   Backend API: http://localhost:8000"
Write-Host "   API Docs: http://localhost:8000/docs"
Write-Host ""
Write-Host "🔑 Demo credentials:" -ForegroundColor Cyan
Write-Host "   Email: admin@local"
Write-Host "   Password: admin123"
Write-Host ""
Write-Host "📝 Don't forget to:" -ForegroundColor Yellow
Write-Host "   1. Update OPENAI_API_KEY and ANTHROPIC_API_KEY in .env"
Write-Host "   2. Restart services: docker compose restart backend"
Write-Host ""
