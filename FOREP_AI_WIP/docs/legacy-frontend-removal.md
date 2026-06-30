# Legacy Frontend Removal

## Initial structure observed

The repository contained a Vite React frontend with `src`, `vite.config.ts`, `index.html`, Vite TypeScript configs, Vite logs, a generated `dist` folder, and browser-test artifacts.

## Removed legacy implementation

- `src/` legacy React Router application
- `dist/` legacy Vite build output
- `browser-test-shots/` legacy visual test artifacts
- `vite.config.ts`
- `index.html`
- `tsconfig.app.json`
- `tsconfig.node.json`
- `eslint.config.js`
- `vite-dev.err.log`
- `vite-dev.out.log`

## Preserved files

- `.git/` repository metadata
- `.gitignore`
- `public/` as the Next.js public asset directory
- Existing specification and documentation folders where present
- `.env` was not modified by this removal pass; `.env.example` documents the new public variable contract

## Removed dependency families

- Vite build/runtime packages
- React Router packages
- Anime.js landing-page animation dependency from the legacy product
- Legacy ESLint/Vite plugin configuration

## New frontend direction

The replacement application is a clean Next.js App Router TypeScript frontend using the deployed FOREP EXE backend OpenAPI contract as source of truth.
