# AI Resume Tailor

AI Resume Tailor rewrites any resume so it mirrors a target job description. Paste a posting and your
resume and instantly receive a keyword-optimised version that matches the role&apos;s tone, skills, and
requirements.

## Features

- 🔁 **AI resume rewriting** – Uses OpenAI to restructure and rewrite resumes in an ATS-friendly
  format with Summary, Experience, Skills, and Education sections.
- 🆓 **Freemium tier** – Every account can tailor two resumes for free. Resume usage is stored per
  user and resets only when you upgrade.
- 🚀 **Pro upgrade** – Stripe Checkout powers the upgrade flow for unlimited tailoring. Successful
  payments automatically flag your account as Pro.
- 📜 **History log** – The last 10 tailored resumes are stored securely for quick access and export.
- 🔐 **Secure sessions** – Email/password auth backed by iron-session and Prisma keeps accounts
  private.

## Getting started

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment variables

Copy `.env.example` to `.env.local` and update the values:

```bash
cp .env.example .env.local
```

| Variable | Purpose |
| --- | --- |
| `DATABASE_URL` | SQLite database URL used by Prisma. |
| `OPENAI_API_KEY` | API key for OpenAI. |
| `OPENAI_MODEL` | (Optional) Override the OpenAI model. Defaults to `gpt-4o-mini`. |
| `SESSION_PASSWORD` | 32+ char secret for signing user sessions. |
| `STRIPE_SECRET_KEY` | Stripe secret key used to create checkout sessions. |
| `STRIPE_PRICE_ID` | Price ID for the recurring Pro subscription. |
| `STRIPE_WEBHOOK_SECRET` | Secret from your Stripe webhook endpoint. |
| `NEXT_PUBLIC_BASE_URL` | Public URL for redirecting to success/cancel pages. |

### 3. Initialise the database

Prisma requires a generated client and schema migrations. In environments without outbound network
access you may need to set `PRISMA_ENGINES_CHECKSUM_IGNORE_MISSING=1` when running the commands.

```bash
npx prisma migrate dev --name init
```

For local development you can also use:

```bash
npx prisma db push
```

### 4. Start the development server

```bash
npm run dev
```

Visit <http://localhost:3000>.

### 5. Configure Stripe webhook

Create a webhook endpoint in Stripe that points to `/api/stripe/webhook` and listen to the following
events:

- `checkout.session.completed`
- `customer.subscription.deleted`

Use the provided signing secret as `STRIPE_WEBHOOK_SECRET`.

## Testing linting

```bash
npm run lint
```

## Project structure

- `pages/` – Next.js pages and API routes.
- `components/` – Reusable UI components (header, forms, history list).
- `lib/` – Prisma client, session helpers, authentication utilities.
- `prisma/` – Prisma schema and database definitions.
- `styles/` – Global styling.

## Deployment notes

- Set all environment variables as described above on your hosting platform.
- Ensure Stripe webhooks are reachable from your deployment environment.
- The OpenAI usage is billed per request; monitor usage in your OpenAI dashboard.
