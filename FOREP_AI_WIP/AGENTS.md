# FOREP EXE Frontend Agent Guide

## Architecture

This repository is a clean Next.js App Router frontend. The old Vite/React Router implementation was removed.

## Source of truth priority

1. Actual backend behavior
2. Swagger/OpenAPI at `https://forep-exe-backend.onrender.com/v3/api-docs`
3. Backend API implementation docs
4. API/data contract docs
5. Frontend build spec
6. Product/architecture/roadmap docs

## API conventions

- Base URL comes only from `NEXT_PUBLIC_API_BASE_URL`.
- Frontend calls only backend `/api/v1` endpoints.
- Frontend never calls the AI service directly.
- Responses are unwrapped from `{ data, meta, errors }`.
- 401 clears auth and redirects to `/login`.
- 403 is permission denied and must not be treated as expired auth.

## Auth and roles

MVP roles are `OWNER` and `EMPLOYEE`.

- OWNER home: `/owner/dashboard`
- EMPLOYEE home: `/employee/home`
- Zustand persists token and current user only.

## Query conventions

Use TanStack Query. Mutations invalidate related query keys.

## Forbidden practices

Do not add mock production data, hardcoded users, fake UUIDs, localhost URLs, React Router, Vite files, or direct AI service calls.

## Verification

Run:

```bash
npm run lint
npm run typecheck
npm test
npm run build
```
