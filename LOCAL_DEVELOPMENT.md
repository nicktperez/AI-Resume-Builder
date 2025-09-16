# 🚀 Local Development Setup

This guide will help you run the AI Resume Builder locally without Vercel or any external hosting.

## 📋 Prerequisites

- Node.js 18+ 
- npm or yarn
- Git

## 🛠️ Quick Start

### 1. Clone and Install

```bash
# Clone the repository
git clone <your-repo-url>
cd AI-Resume-Builder

# Install dependencies
npm install
```

### 2. Environment Setup

Create a `.env.local` file in the root directory:

```bash
# Database
DATABASE_URL="file:./dev.db"

# Session Security (generate a random 32+ character string)
SESSION_PASSWORD="your-super-secret-session-password-32-chars-min"

# OpenAI (get from https://platform.openai.com/api-keys)
OPENAI_API_KEY="sk-your-openai-api-key"
OPENAI_MODEL="gpt-4o-mini"

# Stripe (optional for testing payments)
STRIPE_SECRET_KEY="sk_test_your_stripe_secret_key"
STRIPE_PRICE_ID="price_your_stripe_price_id"
STRIPE_WEBHOOK_SECRET="whsec_your_webhook_secret"

# App Configuration
NEXT_PUBLIC_BASE_URL="http://localhost:3000"

# Optional: Error Monitoring
SENTRY_DSN="your-sentry-dsn"
```

### 3. Database Setup

```bash
# Generate Prisma client
npm run prisma:generate

# Create and migrate database
npm run prisma:migrate

# (Optional) Open Prisma Studio to view data
npm run prisma:studio
```

### 4. Start Development Server

```bash
# Start the development server
npm run dev
```

Visit `http://localhost:3000` in your browser! 🎉

## 🔧 Development Commands

```bash
# Development
npm run dev              # Start dev server
npm run build           # Build for production
npm run start           # Start production server

# Testing
npm test                # Run all tests
npm run test:watch      # Run tests in watch mode
npm run test:coverage   # Run tests with coverage

# Database
npm run prisma:generate # Generate Prisma client
npm run prisma:migrate  # Run database migrations
npm run prisma:studio   # Open Prisma Studio
npm run prisma:deploy   # Deploy migrations (production)

# Code Quality
npm run lint            # Run ESLint
```

## 🗄️ Database Management

### SQLite Database Location
- Development: `./dev.db` (in project root)
- Production: Set via `DATABASE_URL` environment variable

### Viewing Data
```bash
# Open Prisma Studio (web interface)
npm run prisma:studio

# Or use SQLite CLI
sqlite3 dev.db
.tables
SELECT * FROM User;
.quit
```

### Reset Database
```bash
# Delete database file
rm dev.db

# Recreate with migrations
npm run prisma:migrate
```

## 🧪 Testing

### Run Tests
```bash
# All tests
npm test

# Watch mode (reruns on file changes)
npm run test:watch

# With coverage report
npm run test:coverage
```

### Test Coverage
- Target: 70% coverage across all metrics
- Reports generated in `coverage/` directory
- Open `coverage/lcov-report/index.html` in browser

## 🔍 Debugging

### Health Check
Visit `http://localhost:3000/api/health` to check:
- Database connectivity
- OpenAI API key status
- Cache status
- Server uptime

### Logs
- Development logs: Console output
- Error logs: `logs/error.log`
- Combined logs: `logs/combined.log`

### Common Issues

**Database Connection Error:**
```bash
# Regenerate Prisma client
npm run prisma:generate

# Check DATABASE_URL in .env.local
echo $DATABASE_URL
```

**OpenAI API Error:**
- Verify API key is correct
- Check you have credits in OpenAI account
- Ensure model is available

**Port Already in Use:**
```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9

# Or use different port
npm run dev -- -p 3001
```

## 🚀 Production Build

### Build for Production
```bash
# Create production build
npm run build

# Start production server
npm run start
```

### Environment Variables for Production
```bash
# Required
DATABASE_URL="postgresql://user:password@localhost:5432/airesumebuilder"
SESSION_PASSWORD="your-production-session-password"
OPENAI_API_KEY="sk-your-production-openai-key"
STRIPE_SECRET_KEY="sk_live_your_live_stripe_key"
STRIPE_PRICE_ID="price_your_live_price_id"
STRIPE_WEBHOOK_SECRET="whsec_your_live_webhook_secret"
NEXT_PUBLIC_BASE_URL="https://yourdomain.com"

# Optional
SENTRY_DSN="your-production-sentry-dsn"
OPENAI_MODEL="gpt-4o-mini"
```

## 📁 Project Structure

```
AI-Resume-Builder/
├── components/          # React components
├── lib/                # Utilities and helpers
├── pages/              # Next.js pages and API routes
├── prisma/             # Database schema and migrations
├── styles/             # Global CSS
├── __tests__/          # Test files
├── logs/               # Application logs
├── .env.local          # Environment variables
├── dev.db              # SQLite database (development)
└── README.md           # This file
```

## 🔐 Security Notes

- Never commit `.env.local` or `dev.db` to version control
- Use strong, unique passwords for production
- Rotate API keys regularly
- Monitor logs for suspicious activity

## 🆘 Getting Help

1. Check the logs in `logs/` directory
2. Visit `/api/health` for system status
3. Run tests to verify functionality
4. Check environment variables are set correctly

## 🎯 Next Steps

Once running locally:
1. Create a test account
2. Try generating a resume
3. Test the Pro upgrade flow (with Stripe test keys)
4. Check the health endpoint
5. Run the test suite

Happy coding! 🚀
