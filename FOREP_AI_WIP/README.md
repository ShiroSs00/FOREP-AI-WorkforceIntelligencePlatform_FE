# FOREP EXE Frontend

FOREP EXE is a Vietnamese SaaS frontend for small-business task management, workload analytics, daily reporting, notifications, and backend-mediated AI assistance.

## Stack

- Next.js App Router
- TypeScript strict mode
- Tailwind CSS
- TanStack Query
- Axios
- Zustand
- React Hook Form + Zod
- Recharts

## Setup

```bash
npm install
cp .env.example .env.local
npm run dev
```

Required Vercel variable:

```bash
NEXT_PUBLIC_API_ORIGIN=https://forep-exe-backend.onrender.com
```

On Vercel, add it in:

Project Settings -> Environment Variables -> Add New

Use the same value for Production, Preview, and Development unless you have separate backend deployments.

The old Vite variables (`VITE_API_BASE_URL`, `VITE_DATA_MODE`) are not used by this Next.js frontend.

## Commands

```bash
npm run dev
npm run lint
npm run typecheck
npm test
npm run build
```

## Backend

- Swagger: https://forep-exe-backend.onrender.com/swagger-ui/index.html
- OpenAPI: https://forep-exe-backend.onrender.com/v3/api-docs

Render may cold start. If requests timeout, retry after the backend wakes up.

## UI/UX conventions

- App text is Vietnamese first and should stay concise, direct, and non-technical.
- Use semantic Tailwind tokens from `src/app/globals.css`: `bg-background`, `bg-surface`, `text-foreground`, `text-muted-foreground`, `border-border`, `bg-primary`, `text-destructive`.
- Do not scatter random color classes across new components. Add semantic tokens or extend existing component variants instead.
- Shared UI primitives live in `src/components/common` and feedback states in `src/components/feedback`.
- `Button` defaults to `type="button"`; form submit buttons must explicitly use `type="submit"`.
- Use `PageHeader` for title, description, and page actions so every route answers where the user is and what they can do next.
- OWNER and EMPLOYEE experiences are intentionally different: OWNER sees management, workload, AI and employee flows; EMPLOYEE sees assigned work, daily reports, notifications and profile.
- List-heavy screens should provide search/filter controls and mobile card alternatives.
- Error states should show useful Vietnamese messages. Technical details belong in collapsed details, not as the main user-facing copy.

## Responsive and accessibility expectations

- Verify key routes at 320px, 375px, 768px, 1024px, and desktop widths.
- No horizontal overflow on mobile.
- Sidebar must remain persistent on desktop and usable as a drawer on mobile.
- Touch targets should be approximately 44px where practical.
- Icon-only controls need `aria-label`.
- Active navigation uses `aria-current`.
- Status must include text, not color alone.
- Focus visibility is provided through `.focus-ring`.

Design documentation:

- `docs/ui-ux-audit.md`
- `docs/design-system.md`
