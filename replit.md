# HealthPulse - Healthcare Analytics Platform

## Overview
A full-stack healthcare analytics web application built with React, Tailwind CSS, and Node.js/Express backend. Features patient management, appointment scheduling, department overview, and analytics dashboards.

## Architecture
- **Frontend**: React + Tailwind CSS + Shadcn UI components, served via Vite
- **Backend**: Node.js + Express API server
- **Database**: PostgreSQL with Drizzle ORM
- **Routing**: wouter for frontend routing
- **State Management**: TanStack React Query
- **Charts**: Recharts

## Project Structure
```
client/src/
  pages/        - Dashboard, Patients, Appointments, Departments, Analytics
  components/   - AppSidebar, StatCard, ThemeProvider, ThemeToggle, UI components
  lib/          - queryClient utilities
  hooks/        - useToast, useMobile
server/
  index.ts      - Express server setup
  routes.ts     - API routes
  storage.ts    - Database storage layer
  db.ts         - Database connection
  seed.ts       - Seed data
shared/
  schema.ts     - Drizzle schema (patients, appointments, departments, analyticsSnapshots)
```

## API Endpoints
- `GET /api/stats` - Dashboard statistics
- `GET /api/patients` - List all patients
- `POST /api/patients` - Create a patient
- `GET /api/appointments` - List all appointments with patient names
- `GET /api/appointments/recent` - Recent 5 appointments
- `POST /api/appointments` - Create appointment
- `PATCH /api/appointments/:id` - Update appointment status
- `GET /api/departments` - List departments
- `GET /api/analytics/monthly` - Monthly analytics snapshots

## Docker
- `Dockerfile.frontend` - Nginx-based frontend container
- `Dockerfile.backend` - Node.js backend container
- `docker-compose.yml` - Full stack with PostgreSQL
- `nginx.conf` - Nginx reverse proxy config

## Running
- Development: `npm run dev`
- Database push: `npm run db:push`
- Docker: `docker-compose up --build`
 
