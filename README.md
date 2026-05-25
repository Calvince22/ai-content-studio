# AI Content Studio

AI Content Studio is a production-ready Next.js 16 application for generating AI content, storing generation history, and managing secure user accounts.

## Features

- Next.js App Router with TypeScript
- Tailwind CSS v4
- PostgreSQL + Prisma 7 + PrismaPg adapter
- Redis-backed rate limiting and caching
- JWT authentication with httpOnly cookies
- Groq AI streaming generation
- Docker and docker-compose support
- Jest + Testing Library coverage for core helpers and UI

## Project structure

- `app/` — routes, API handlers, and pages
- `components/` — UI building blocks
- `hooks/` — reusable client-side state hooks
- `lib/` — shared services and infrastructure
- `services/` — business logic for generation and history
- `prisma/` — Prisma schema and migrations

## Environment variables

Create a `.env` file with the following values:

```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/ai_content_studio
REDIS_URL=redis://localhost:6379
JWT_SECRET=your-super-secret-key-change-in-production
GROQ_API_KEY=your-groq-api-key
```

## Local development

### Install dependencies

```bash
npm install
```

### Generate Prisma client

```bash
npm run prisma:generate
```

### Run the app locally

```bash
npm run dev
```

Open http://localhost:3000

## Docker

### Start services

```bash
docker compose up --build
```

The app container runs Prisma migrations on startup and connects to PostgreSQL and Redis.

## Available scripts

```bash
npm run dev
npm run build
npm run start
npm run lint
npm run test
npm run prisma:generate
npm run prisma:migrate
```

## Notes

- Authentication uses secure, httpOnly cookies.
- Redis is used for both cache storage and rate limiting.
- The streaming endpoint returns tokens in real time for the UI.

## Git ignore status

The current `.gitignore` already ignores the usual build artifacts, dependency folders, coverage output, and environment files.

