# Frontend Implementation Report

## Final folder architecture

- `src/app`: Next.js App Router pages and layouts
- `src/api`: Axios API modules mapped to current Swagger
- `src/auth`: Zustand persisted JWT/user state plus route guards
- `src/components`: reusable layout, form, feedback, and display components
- `src/features`: Zod schemas for auth, employees, tasks, and reports
- `src/lib`: env, query keys, role helpers, task helpers
- `src/types`: API, domain, and request TypeScript types
- `src/test`: Vitest tests

## Implemented routes

Public: `/login`, `/register-workspace`.

Authenticated shared: `/tasks`, `/tasks/[id]`, `/daily-reports`, `/daily-reports/new`, `/notifications`, `/profile`.

OWNER: `/owner/dashboard`, `/owner/employees`, `/owner/employees/[id]`, `/owner/tasks/new`, `/owner/workspace`, `/owner/analytics/workload`, `/owner/ai`.

EMPLOYEE: `/employee/home`, `/employee/tasks`, `/employee/reports`.

## Implemented Swagger endpoints

Implemented API modules cover auth, workspace, employees, tasks, daily reports, notifications, analytics, and AI endpoints currently present in `https://forep-exe-backend.onrender.com/v3/api-docs`.

Removed old FE concepts not present in the current Swagger: Admin/Manager/HR switcher, organizations, teams, sprints, Jira/GitHub integration pages, and `/api/v1/admin/dashboard`.

## Role matrix

OWNER can manage workspace, employees, tasks, workload analytics, reports, notifications, and AI Center.

EMPLOYEE can access personal home, tasks, reports, notifications, and profile.

## API response strategy

Responses are unwrapped from `{ data, meta, errors }`. List/page/object normalizers guard against common backend shapes while still showing empty/error states instead of fake content.

## Authentication strategy

JWT and current user are persisted in Zustand only. Protected routes refresh `/auth/me`. Login redirects by actual role: OWNER to `/owner/dashboard`, EMPLOYEE to `/employee/home`.

## Tests added

- API response normalization
- Login schema
- Workspace registration schema
- Task schema
- Progress update schema
- Daily report schema
- Role redirect helper
- Overdue task calculation

## Verification results

- `npm run lint`: passed
- `npm run typecheck`: passed
- `npm test`: passed, 3 files / 11 tests
- `npm run build`: passed with Next.js App Router production build

## Known backend-dependent limitations

- No current Swagger endpoints for organizations/teams/sprints/Jira/GitHub integrations, so those legacy screens were removed.
- No current Swagger endpoint for profile update; profile is read-only from `/auth/me`.
- Daily report review has no request body in Swagger, so the UI calls PATCH only.
- Notification delete is not in current Swagger, so delete UI was not implemented.

## Vercel environment

`NEXT_PUBLIC_API_ORIGIN=https://forep-exe-backend.onrender.com`
