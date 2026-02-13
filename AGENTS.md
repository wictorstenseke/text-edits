# AGENTS.md

Single source of truth for all AI coding assistants in this repository.

## Project

- Annual Report Editor (client-side React + TypeScript app)
- Stack: React 19, TypeScript (strict), Vite (`rolldown-vite`), TanStack Router, Tailwind v4, TipTap, Vitest
- i18n: English + Swedish

## Core Commands

```bash
npm run dev
npm run ci
npm run check:full
npm run generate:routes
```

## Rules

1. Keep changes small and scoped; avoid unrelated refactors.
2. Use strict TypeScript; avoid `any` unless clearly justified.
3. Use named exports for components.
4. No TODOs/placeholders in final code.
5. Do not edit generated files (for example `src/routeTree.gen.ts`).
6. Run `npm run generate:routes` after route changes.
7. If UI text changes, update both `en` and `sv` translations.
8. Run relevant tests; at minimum run `npm run ci` before commit.

## Conventions

- Use `@/*` import alias for `src/*`.
- Props interfaces: `ComponentNameProps`.
- Event handlers: `handleXxx`.
- Use `cn()` for conditional classes; prefer Tailwind utilities over inline styles.
- Prefer existing shadcn/ui components and `lucide-react` icons.

## Testing

- Add/update tests when behavior changes.
- Co-locate tests where practical (`*.test.ts` / `*.test.tsx`).

## localStorage Keys

- `document-editor-state`
- `documentFontFamily`
- `language`
- `vite-ui-theme-mode`
