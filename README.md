# Task Forge

A full-stack Team Task Manager web application built as an assessment project for **[Ethara AI](https://www.ethara.ai/)** (Full Stack Software Engineer role).

## Live Demo
https://task-forge-production-6afb.up.railway.app


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

## Getting Started

### Prerequisites
- Node.js 18+
- PostgreSQL 16
- npm

### 1. Clone the repo

```bash
git clone https://github.com/your-username/task-forge.git
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
PORT=5000
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
cp .env.example .env
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

- **Backend** — deployed on [Railway](https://railway.app)
- **Frontend** — deployed on [Vercel](https://vercel.com)

After deploying the backend, update `VITE_API_URL` in your Vercel environment variables to point to your live Railway URL.

## Project Structure
