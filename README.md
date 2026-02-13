# Annual Report Editor

A React-based document editor for writing structured reports with rich text, nested sections, tags, and PDF export.

This repository also serves as a testbed for **testing and evaluating different AI agent workflows**. The many collaborators reflect this dual purpose: alongside developing the Annual Report Editor, contributors use the project to experiment with and compare AI coding assistants and their workflows.

## AI assistant instructions

The project uses a single canonical assistant rules file: [`AGENTS.md`](AGENTS.md).

## What the app does

- Creates and edits long-form report documents.
- Supports two-level section hierarchy:
  - top-level sections (parents)
  - sub-sections under each parent
- Provides a left sidebar for section navigation.
- Supports inline rich-text editing with TipTap.
- Lets users manage reusable tags and insert them with `@` mentions.
- Exports documents to PDF with configurable page width and font family.
- Persists document state locally in the browser (autosave).

## Core features

- Rich text editing (headings, lists, links, tables, page breaks, images)
- Financial report block support in the editor
- **Multi-language support** (English and Swedish) with language switcher
- Section manager with:
  - add/remove parent sections
  - add/remove child sections
  - drag-and-drop reorder for parent sections
  - drag-and-drop reorder for child sections within the same parent
- Document-level settings:
  - document width (`narrow`, `medium`, `wide`)
  - font family (`sans`, `serif`, `mono`)
- Template-based document initialization
- Reset document action

## Tech stack

- React 19 + TypeScript
- Vite (using `rolldown-vite` alias)
- TanStack Router (file-based routes)
- Tailwind CSS v4
- shadcn/ui + Radix UI primitives
- TipTap editor
- TanStack Query + React Query Devtools
- **i18next + react-i18next** for internationalization
- jsPDF for PDF export
- Vitest + Testing Library + jsdom
- ESLint + Prettier

## Project structure

```text
src/
  components/
    editor/                  # TipTap extensions and inline section editor
    ui/                      # UI primitives
    TipTapEditor.tsx
  pages/
    DocumentEditor.tsx       # Main application page
  lib/
    documentStorage.ts       # localStorage persistence + sample document
    sectionHierarchy.ts      # parent/child section logic
    pdfExport.ts             # PDF generation
    queryClient.ts
  routes/
    __root.tsx
    index.tsx                # mounts DocumentEditor at '/'
  types/
    document.ts
```

## Local development

### Prerequisites

- Node.js 20+
- npm

### Setup

```bash
npm install
npm run dev
```

Then open the local URL printed by Vite.

## Available scripts

- `npm run dev` - Start development server
- `npm run build` - Full production build (route generation, TypeScript build, lint, tests, Vite build)
- `npm run preview` - Preview the production build
- `npm run generate:routes` - Generate TanStack route tree
- `npm run type-check` - TypeScript check without emit
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Auto-fix lint issues
- `npm run test` - Run tests once
- `npm run test:watch` - Run tests in watch mode
- `npm run test:coverage` - Run tests with coverage
- `npm run ci` - Run type-check, lint, and tests
- `npm run check` - Alias for `ci`
- `npm run check:full` - `ci` plus production build
- `npm run format` - Format files with Prettier
- `npm run format:check` - Check formatting

## Persistence model

The editor is client-side and saves data in `localStorage`.

Primary keys:

- `document-editor-state` - full document payload
- `documentFontFamily` - selected font family
- `language` - selected language (en or sv)
- `vite-ui-theme-mode` - theme mode

## Internationalization

The application supports English and Swedish. Users can switch languages using the language toggle button in the header. See [docs/i18n.md](docs/i18n.md) for details on adding new languages.

## Security

Security review process and guidance:

- [Security checklist](docs/security-checklist.md) – Tailored to React, Vite, TipTap
- [Security review process](docs/security-review-process.md) – Findings, SLAs, escalation
- [Security advisor guidance](docs/security-advisor-guidance.md) – Methodology, tone, templates

Dependabot runs weekly for dependency updates.

## CI and deployment

GitHub Actions (`.github/workflows/ci.yml`) runs:

- install
- `npm audit` (fails on high/critical vulnerabilities)
- `npm run ci`
- `npm run build`

On pushes to `main`, it also builds and deploys `dist/` to GitHub Pages.
The workflow sets `BASE_PATH` so the app works under a repository subpath.
