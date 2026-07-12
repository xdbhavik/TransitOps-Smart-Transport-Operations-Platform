# TransitOps - Smart Transport Operations Platform

TransitOps is a full-stack transport operations platform for managing vehicles, drivers, trips, maintenance, fuel, expenses, reporting, and admin workflows. It includes a Spring Boot backend with JWT auth and a React + Vite frontend for fleet operations dashboards and reporting.

## What is included

- Vehicle registry and vehicle health tracking
- Driver management with license checks and reminders
- Trip lifecycle management and live tracking
- Maintenance records and upcoming maintenance views
- Fuel logs and fuel reporting
- Expense tracking and vehicle/trip expense lookups
- Dashboard summaries with PDF and CSV export
- Role-based access control for fleet, driver, safety, finance, and admin users
- Swagger/OpenAPI API documentation
- Docker setup for local full-stack runs

## Tech Stack

- Backend: Spring Boot 4.1, Java 21, Spring Security, Spring Data JPA, JWT, Springdoc OpenAPI, MySQL
- Frontend: React 19, Vite 8, React Router 7, axios, Recharts, jsPDF, jspdf-autotable, Tailwind CSS 4
- DevOps: Docker Compose, MySQL 8.4

## Project Structure

- `backend/` - Spring Boot API and business logic
- `frontend/` - React application
- `docker-compose.yml` - Local container stack

For UI-specific notes, see [frontend/README.md](frontend/README.md).

## Prerequisites

- Java 21
- Node.js 20+ and npm
- MySQL 8 if you want to run locally without Docker
- Docker Desktop if you want to run the container stack

## Run Locally Without Docker

### 1. Start the backend

From the `backend` folder:

```bash
./mvnw spring-boot:run
```

Backend runs on `http://localhost:8080`.

### 2. Start the frontend

From the `frontend` folder:

```bash
npm install
npm run dev
```

Frontend runs on `http://localhost:5173`.

## Run With Docker

From the repository root:

```bash
docker compose up --build
```

Container ports:

- Frontend: `http://localhost:3000`
- Backend: `http://localhost:8081`
- MySQL: `localhost:3307`

## API Docs

Swagger UI is available at:

```text
http://localhost:8080/swagger-ui/index.html
```

## Demo / Seed Credentials

Seeded accounts use the password `Pass@1234`.

| Role | Email |
|---|---|
| Admin | `seed.admin@transitops.local` |
| Fleet Manager | `seed.fleet@transitops.local` |
| Dispatcher | `seed.dispatcher@transitops.local` |
| Safety Officer | `seed.safety@transitops.local` |
| Financial Analyst | `seed.finance@transitops.local` |

## Environment Variables

The backend is configured through environment variables so it can run locally or in Docker.

Common values:

- `SPRING_DATASOURCE_URL`
- `SPRING_DATASOURCE_USERNAME`
- `SPRING_DATASOURCE_PASSWORD`
- `JWT_SECRET`
- `APP_SEED_ENABLED`
- `APP_LICENSE_REMINDER_ENABLED`
- `APP_LICENSE_REMINDER_DAYS_BEFORE_EXPIRY`
- `APP_LICENSE_REMINDER_CRON`
- `APP_MAIL_MODE`
- `APP_CORS_ALLOWED_ORIGINS`

## Main Features

- Role-based dashboard after sign-in
- Vehicle, driver, maintenance, fuel, and expense CRUD flows
- Dashboard PDF/CSV export
- Reports and analytics tabs
- License reminder support
- Admin user management endpoints in the backend

## Notes

- The backend uses seeded demo data by default.
- The frontend expects the backend API to be available before login and dashboard actions can work.
- Some features are backend-only for now, such as the admin user management UI.
