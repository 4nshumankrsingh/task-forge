# Task Forge

A full-stack Team Task Manager web application built as an assessment project for **[Ethara AI](https://www.ethara.ai/)** (Full Stack Software Engineer role).

## Live Demo

🔗 **App:** [task-forge-zeta.vercel.app](https://task-forge-zeta.vercel.app)
🔗 **Backend API:** [task-forge-production-6afb.up.railway.app](https://task-forge-production-6afb.up.railway.app)

## Test Credentials

| Role   | Email           | Password  |
|--------|-----------------|-----------|
| Admin  | admin@mail.com  | Admin1234 |
| Member | member@mail.com | Mem12345  |

## Features

- **Authentication** — JWT-based signup and login with bcrypt password hashing
- **Projects** — Create, manage, and delete projects with status tracking
- **Tasks** — Create and assign tasks with priority levels, due dates, and status columns
- **Kanban Board** — Drag-and-drop task management across TODO, IN PROGRESS, IN REVIEW, DONE
- **Role-Based Access Control** — Owner, Admin, and Member roles with enforced permissions
- **Team Management** — Invite members by email, change roles, remove members
- **Dashboard** — Live stats, task status breakdown, recent and upcoming tasks
- **Responsive UI** — Mobile-friendly layout with light/dark theme support

## Tech Stack

**Frontend**
- React + TypeScript + Vite
- Tailwind CSS v4 + shadcn/ui
- React Router, React Query, React Hook Form, Zod
- Axios, date-fns, Sonner, lucide-react

**Backend**
- Express + TypeScript
- Prisma ORM + PostgreSQL 16
- JWT authentication + bcrypt

## CI/CD

GitHub Actions is configured to run on every push to `main` or `dev` and on all pull requests to `main`.

**Frontend job** — installs dependencies, runs TypeScript type checking (`tsc --noEmit`), and runs a production build to catch any compile-time or build errors.

**Backend job** — installs dependencies and runs TypeScript type checking (`tsc --noEmit`) to validate the Express + Prisma codebase.

Deployments are automatic — Railway redeploys the backend and Vercel redeploys the frontend on every push to `main`.

## Getting Started

### Prerequisites
- Node.js 18+
- PostgreSQL 16
- npm

### 1. Clone the repo

```bash
git clone https://github.com/4nshumankrsingh/task-forge.git
cd task-forge
```

### 2. Set up the backend

```bash
cd backend
cp .env.example .env
```

Fill in your `.env`:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/taskforge"
JWT_SECRET="your-secret-key"
JWT_EXPIRES_IN="7d"
PORT=5000
CLIENT_URL=http://localhost:5173
NODE_ENV=development
```

```bash
npm install
npx prisma migrate deploy
npx prisma generate
npm run dev
```

### 3. Set up the frontend

```bash
cd ..
```

Fill in your `.env`:

```env
VITE_API_URL=http://localhost:5000/api
```

```bash
npm install
npm run dev
```

App runs at `http://localhost:5173`.

## Deployment

- **Backend** — deployed on [Railway](https://railway.app) with root directory set to `/backend`
- **Frontend** — deployed on [Vercel](https://vercel.com)

### Environment Variables

**Railway (backend):**
```env
DATABASE_URL=your_neon_postgres_url
JWT_SECRET=your_secret
JWT_EXPIRES_IN=7d
PORT=5000
CLIENT_URL=https://task-forge-zeta.vercel.app
NODE_ENV=production
```

**Vercel (frontend):**
```env
VITE_API_URL=https://task-forge-production-6afb.up.railway.app/api
```
