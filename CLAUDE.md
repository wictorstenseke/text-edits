# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Annual Report Editor — a client-side React + TypeScript app for writing structured reports with rich text, nested sections, tags, and PDF export. Also serves as a testbed for AI agent workflows.

Stack: React 19, TypeScript (strict), Vite (`rolldown-vite`), TanStack Router, Tailwind CSS v4, TipTap editor, Vitest.

> **Primary rules file:** [`AGENTS.md`](AGENTS.md) — read it first; this file adds Claude-specific context.

## Commands

```bash
npm run dev             # start dev server
npm run ci              # type-check + lint + tests (run before committing)
npm run check:full      # ci + production build
npm run test            # run all tests once
npm run test:watch      # run tests in watch mode
npm run generate:routes # regenerate route tree (required after route changes)
npm run lint:fix        # auto-fix lint issues
```

To run a single test file:
```bash
npx vitest run src/lib/tagValidation.test.ts
```

## Architecture

The app is a single-page editor mounted at `/`. State lives in `src/pages/DocumentEditor.tsx` via React hooks; there is no global state library.

```
src/
  pages/DocumentEditor.tsx         # root state + orchestration
  components/document-page/        # editor UI (header, sidebars, dialogs, section blocks)
  components/rich-text-editor/     # TipTap extensions (financial blocks, mentions, images)
  components/TipTapEditor.tsx      # TipTap wrapper + toolbar
  lib/
    documentStorage/               # localStorage persistence + sample docs (en/sv)
    sectionHierarchy.ts            # parent/child section logic + drag-and-drop ordering
    pdfExport.ts                   # PDF generation via jsPDF
    i18n.ts                        # i18next init
  types/document.ts                # core interfaces (Document, Section, Tag, …)
  routes/                          # TanStack Router file-based routes
  locales/en/ locales/sv/          # i18n translation files
```

Key architectural notes:
- **Two-level section hierarchy:** parent sections contain child sections; logic is in `lib/sectionHierarchy.ts`.
- **Persistence:** entire document serialised to `localStorage` on every change (key: `document-editor-state`). Other keys: `documentFontFamily`, `language`, `vite-ui-theme-mode`.
- **Route tree is generated** — never edit `src/routeTree.gen.ts` directly; run `npm run generate:routes` after adding/removing routes.

## Conventions

- `@/*` alias maps to `src/*` — use it for all internal imports.
- Named exports only for components.
- Props interfaces: `ComponentNameProps`.
- Event handlers: `handleXxx`.
- Conditional classes: `cn()` from `@/lib/utils`; no inline styles.
- Prefer existing shadcn/ui components (`src/components/ui/`) and `lucide-react` icons. Add new shadcn components with `npx shadcn@latest add <component>`.
- UI text changes require updating both `locales/en/` and `locales/sv/` translation files.
- Test names: `it("should [verb] when [condition]")` inside `describe` blocks; co-locate with source.
