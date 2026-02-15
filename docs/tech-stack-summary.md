# Tech Stack Summary

Quick check of the project's technology stack. Last verified: 2025-02-15.

## Project Overview

- **Application**: Annual Report Editor (client-side React + TypeScript)
- **Node**: v22.21.1
- **Package Manager**: npm

## Core Stack

### UI & Frameworks

| Technology | Version | Notes |
|------------|---------|-------|
| React | ^19.2.0 | Latest major |
| React DOM | ^19.2.0 | |
| TypeScript | ~5.9.3 | Strict mode enabled |
| Vite | rolldown-vite@7.2.11 | Vite replaced with Rolldown-based build |

### Routing & Data

| Technology | Version | Notes |
|------------|---------|-------|
| TanStack Router | ^1.141.2 | File-based routing |
| TanStack React Query | ^5.90.12 | Server state management |
| TanStack React Query Devtools | ^5.91.1 | Dev-only |

### Styling

| Technology | Version | Notes |
|------------|---------|-------|
| Tailwind CSS | ^4.1.18 | v4 with new CSS-first config |
| @tailwindcss/vite | ^4.1.18 | Vite plugin for Tailwind v4 |
| tw-animate-css | ^1.4.0 | Animation utilities |
| class-variance-authority | ^0.7.1 | Component variants |
| clsx | ^2.1.1 | Conditional classes |
| tailwind-merge | ^3.4.0 | Class merging |

### Editor & Rich Text

| Technology | Version | Notes |
|------------|---------|-------|
| TipTap (React) | ^3.18.0 | Rich text editor |
| @tiptap/starter-kit | ^3.18.0 | Base extensions |
| @tiptap/extension-* | ^3.18–3.19 | Image, link, mention, placeholder, table, text-align |
| tiptap-extension-resizable-image | ^2.1.0 | Resizable images |

### UI Components

| Technology | Version | Notes |
|------------|---------|-------|
| Radix UI | Various | Dialog, dropdown, scroll-area, slot, tooltip |
| lucide-react | ^0.563.0 | Icons |

### Internationalization

| Technology | Version | Notes |
|------------|---------|-------|
| i18next | ^25.8.5 | i18n core |
| react-i18next | ^16.5.4 | React bindings |
| Languages | en, sv | English + Swedish |

### PDF & Export

| Technology | Version | Notes |
|------------|---------|-------|
| jspdf | ^4.1.0 | PDF generation |

## Development & Quality

### Build & Bundling

- **Bundler**: Rolldown (via `rolldown-vite`)
- **Module**: ESNext
- **Target**: ES2022 (app), ES2023 (Node config)
- **Path alias**: `@/*` → `./src/*`

### Linting & Formatting

| Tool | Version | Config |
|------|---------|--------|
| ESLint | ^9.39.1 | Flat config (eslint.config.js) |
| typescript-eslint | ^8.46.4 | Strict TypeScript rules |
| Prettier | ^3.7.4 | Formatting |
| eslint-config-prettier | ^10.1.8 | Disable conflicting rules |
| eslint-plugin-import | ^2.32.0 | Import order |
| eslint-plugin-unused-imports | ^4.3.0 | Remove unused imports |
| eslint-plugin-react-hooks | ^7.0.1 | React hooks rules |
| eslint-plugin-react-refresh | ^0.5.0 | Vite HMR compatibility |

### Testing

| Tool | Version | Notes |
|------|---------|-------|
| Vitest | ^4.0.15 | Test runner |
| @testing-library/react | ^16.3.1 | Component testing |
| @testing-library/jest-dom | ^6.9.1 | DOM matchers |
| @testing-library/user-event | ^14.6.1 | User interactions |
| jsdom | ^28.0.0 | DOM environment |
| @vitest/coverage-v8 | ^4.0.15 | Coverage |

## Verification Results

| Check | Status |
|-------|--------|
| `npm run ci` (type-check, lint, test) | ✅ Passed |
| `npm audit` | ✅ 0 vulnerabilities |
| TypeScript strict mode | ✅ Enabled |
| All 81 tests | ✅ Passing |

## Key Configuration Files

- `vite.config.ts` – Vite + React + TanStack Router + Tailwind
- `tsconfig.json` / `tsconfig.app.json` / `tsconfig.node.json` – TypeScript
- `eslint.config.js` – ESLint flat config
- `src/index.css` – Tailwind + tw-animate + theme variables

## Conventions (from AGENTS.md)

- Named exports for components
- `cn()` for conditional classes
- `@/*` import alias
- Props: `ComponentNameProps`
- Handlers: `handleXxx`
- Co-located tests (`*.test.ts` / `*.test.tsx`)

## localStorage Keys

- `document-editor-state`
- `documentFontFamily`
- `language`
- `vite-ui-theme-mode`
