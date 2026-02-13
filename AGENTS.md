# AGENTS.md

Canonical instructions for all AI coding assistants (Cursor, Copilot, Claude, ChatGPT, etc.) working in this repository.

If any other assistant-specific instruction file exists, treat this file as the source of truth.

## Project Snapshot

- App: **Annual Report Editor** (client-side only)
- Stack: React 19, TypeScript (strict), Vite (`rolldown-vite` alias), TanStack Router, TanStack Query, Tailwind v4, shadcn/ui, TipTap, Vitest
- Persistence: browser `localStorage` (no backend)
- i18n: English + Swedish (`i18next`, `react-i18next`)

## Directory Map

```text
src/
  components/
    editor/                  # TipTap extensions and inline section editor
    ui/                      # UI primitives
  pages/
    DocumentEditor.tsx       # Main application page
  lib/
    documentStorage.ts       # localStorage persistence + initial templates
    sectionHierarchy.ts      # parent/child section logic
    pdfExport.ts             # PDF generation
  routes/                    # TanStack Router file-based routes
  types/
    document.ts              # Core document types
```

## Commands

```bash
# Setup
npm install

# Development
npm run dev

# Quality gate (required before commit)
npm run ci

# Full verification (for larger/risky changes)
npm run check:full
```

Useful single commands:

- `npm run type-check`
- `npm run lint`
- `npm run lint:fix`
- `npm run test`
- `npm run test:coverage`
- `npm run generate:routes`

## Non-Negotiable Rules

1. Use strict TypeScript. Avoid `any` unless unavoidable and clearly justified.
2. Keep components as **named exports** (avoid default exports).
3. Prefer small, focused changes; do not refactor unrelated code.
4. Do not leave TODO placeholders or partial implementations.
5. Do not manually edit generated files such as `src/routeTree.gen.ts`.
6. When changing routes, run `npm run generate:routes`.
7. When changing UI text, update translations for both `en` and `sv`.
8. Run relevant tests for changed behavior, and at minimum run `npm run ci` before committing.

## Coding Conventions

### TypeScript and Imports

- Prefer `const` and explicit, readable types for public surfaces.
- Path alias `@/*` maps to `src/*`.
- Keep imports clean and grouped logically (React, third-party, internal, then types).

### React

- Props interfaces: `ComponentNameProps`.
- Event handlers: `handleXxx` naming.
- Use semantic HTML and accessibility attributes (ARIA, keyboard support) where applicable.
- Use `cn()` from `@/lib/utils` for conditional classes.
- Prefer Tailwind utility classes over ad-hoc inline styles.

### UI Components

- Prefer existing shadcn/ui primitives before building custom components.
- Icons should use `lucide-react`.

## Testing Guidelines

- Co-locate tests with implementation where practical (`*.test.ts` / `*.test.tsx`).
- Use clear behavior-oriented test names.
- Update/add tests whenever behavior changes.

## Architecture Notes

- Editor state is persisted in `localStorage`.
- Primary keys:
  - `document-editor-state`
  - `documentFontFamily`
  - `language`
  - `vite-ui-theme-mode`
- Section model is two-level: parent sections and child sections.

## Assistant Workflow

1. Read nearby code before editing; follow existing patterns.
2. Implement the smallest correct change.
3. Validate with targeted tests/lint/type-check first, then broader checks as needed.
4. Summarize what changed, why, and any follow-up actions.
