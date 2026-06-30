# Backend API Audit

## Backend origin

- Swagger UI: https://forep-exe-backend.onrender.com/swagger-ui/index.html
- OpenAPI JSON: https://forep-exe-backend.onrender.com/v3/api-docs
- API base path used by frontend: `https://forep-exe-backend.onrender.com/api/v1`

## Response convention

Swagger documents `ApiResponseObject` with:

```json
{ "data": {}, "meta": {}, "errors": [] }
```

The frontend unwraps `data`, preserves business errors, and normalizes common list/page shapes defensively.

## Authentication

Bearer JWT is attached as `Authorization: Bearer <token>`. On 401 the frontend clears persisted auth state and redirects to `/login`.

## Implemented endpoints

| Method | Path | Frontend module | Body schema |
|---|---|---|---|
| POST | `/auth/login` | `auth.api.ts` | `LoginRequest` |
| POST | `/auth/logout` | `auth.api.ts` | none |
| GET | `/auth/me` | `auth.api.ts` | none |
| POST | `/workspaces/register` | `auth.api.ts` | `RegisterWorkspaceRequest` |
| GET | `/workspaces/current` | `workspace.api.ts` | none |
| PUT | `/workspaces/current` | `workspace.api.ts` | `UpdateWorkspaceRequest` |
| GET | `/employees` | `employees.api.ts` | none |
| POST | `/employees` | `employees.api.ts` | `CreateEmployeeRequest` |
| GET | `/employees/{id}` | `employees.api.ts` | path `id` |
| PUT | `/employees/{id}` | `employees.api.ts` | `UpdateEmployeeRequest` |
| PATCH | `/employees/{id}/status` | `employees.api.ts` | query `status` |
| GET | `/tasks` | `tasks.api.ts` | none |
| POST | `/tasks` | `tasks.api.ts` | `CreateTaskRequest` |
| GET | `/tasks/{id}` | `tasks.api.ts` | path `id` |
| PUT | `/tasks/{id}` | `tasks.api.ts` | `UpdateTaskRequest` |
| PATCH | `/tasks/{id}/assign` | `tasks.api.ts` | `AssignTaskRequest` |
| PATCH | `/tasks/{id}/status` | `tasks.api.ts` | `UpdateTaskStatusRequest` |
| PATCH | `/tasks/{id}/progress` | `tasks.api.ts` | `UpdateProgressRequest` |
| GET | `/tasks/{id}/updates` | `tasks.api.ts` | path `id` |
| POST | `/tasks/{id}/updates` | `tasks.api.ts` | `UpdateProgressRequest` |
| PATCH | `/tasks/{id}/cancel` | `tasks.api.ts` | path `id` |
| GET | `/daily-reports` | `reports.api.ts` | none |
| POST | `/daily-reports` | `reports.api.ts` | `DailyReportRequest` |
| GET | `/daily-reports/{id}` | `reports.api.ts` | path `id` |
| PATCH | `/daily-reports/{id}/review` | `reports.api.ts` | path `id` |
| GET | `/notifications` | `notifications.api.ts` | none |
| PATCH | `/notifications/{id}/read` | `notifications.api.ts` | path `id` |
| PATCH | `/notifications/read-all` | `notifications.api.ts` | none |
| GET | `/analytics/owner-dashboard` | `analytics.api.ts` | none |
| GET | `/analytics/workload` | `analytics.api.ts` | none |
| GET | `/analytics/employees/{id}/workload` | `employees.api.ts` | path `id` |
| POST | `/ai/recommend-assignee` | `tasks.api.ts` | `RecommendAssigneeRequest` |
| GET | `/ai/workload-summary` | `ai.api.ts` | none |
| GET | `/ai/delay-risks` | `ai.api.ts` | none |
| GET | `/ai/business-summary/daily` | `ai.api.ts` | none |
| GET | `/ai/business-summary/weekly` | `ai.api.ts` | none |
| GET | `/ai/business-summary/monthly` | `ai.api.ts` | none |
| GET | `/ai/suggestions` | `ai.api.ts` | none |
| PATCH | `/ai/suggestions/{id}/status` | `ai.api.ts` | query `status` |
| GET | `/health` | not used in UI | none |

## Conflicts and removals

The older frontend used Admin/Manager/HR/Employee role switching and endpoints such as organizations, teams, sprints, Jira/GitHub integrations, and `/api/v1/admin/dashboard`. These are not present in the current FOREP EXE Swagger and were removed from the new frontend.
