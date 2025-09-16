#!/bin/bash

# AI Resume Builder - Local Development Setup Script
echo "🚀 Setting up AI Resume Builder for local development..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js version 18+ is required. Current version: $(node -v)"
    exit 1
fi

echo "✅ Node.js $(node -v) detected"

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Check if .env.local exists
if [ ! -f ".env.local" ]; then
    echo "📝 Creating .env.local file..."
    cat > .env.local << EOF
# Database
DATABASE_URL="file:./dev.db"

# Session Security (CHANGE THIS IN PRODUCTION!)
SESSION_PASSWORD="dev-session-password-32-chars-minimum-length-required"

# OpenAI (REQUIRED - Get from https://platform.openai.com/api-keys)
OPENAI_API_KEY="sk-your-openai-api-key-here"

# Optional: Override OpenAI model
OPENAI_MODEL="gpt-4o-mini"

# Stripe (Optional for testing payments)
# STRIPE_SECRET_KEY="sk_test_your_stripe_secret_key"
# STRIPE_PRICE_ID="price_your_stripe_price_id"
# STRIPE_WEBHOOK_SECRET="whsec_your_webhook_secret"

# App Configuration
NEXT_PUBLIC_BASE_URL="http://localhost:3000"

# Admin Access (CHANGE TO YOUR EMAIL!)
ADMIN_EMAIL="admin@example.com"
NEXT_PUBLIC_ADMIN_EMAIL="admin@example.com"

# Optional: Error Monitoring
# SENTRY_DSN="your-sentry-dsn"
EOF
    echo "⚠️  Please edit .env.local and add your OpenAI API key!"
    echo "   Get one from: https://platform.openai.com/api-keys"
fi

# Generate Prisma client
echo "🗄️  Setting up database..."
npm run prisma:generate

# Create database and run migrations
echo "📊 Creating database and running migrations..."
npm run prisma:migrate

# Create logs directory
mkdir -p logs

echo ""
echo "🎉 Setup complete!"
echo ""
echo "Next steps:"
echo "1. Edit .env.local and add your OpenAI API key"
echo "2. Run: npm run dev"
echo "3. Visit: http://localhost:3000"
echo ""
echo "For more help, see LOCAL_DEVELOPMENT.md"
