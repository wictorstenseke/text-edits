# Tech Stack Analysis - Annual Report Editor

## Overview

This document summarizes the technology stack used in the Annual Report Editor — a client-side React + TypeScript application for creating and editing annual reports.

---

## Core Framework & Runtime

| Layer | Technology | Version | Notes |
|-------|------------|---------|-------|
| **Framework** | React | ^19.2.0 | Latest major version with concurrent features |
| **Language** | TypeScript | ~5.9.3 | Strict mode enabled; ES2022 target |
| **Build Tool** | Vite (rolldown-vite) | 7.2.11 | Uses Rolldown-based Vite for faster builds |
| **Module System** | ESNext | - | Bundler resolution, verbatim module syntax |

---

## Routing & State Management

| Area | Technology | Version | Notes |
|------|------------|---------|-------|
| **Routing** | TanStack Router | ^1.162.4 | File-based routes, type-safe, router-vite-plugin for codegen |
| **Server State** | TanStack React Query | ^5.90.12 | Includes devtools for debugging |
| **Local State** | React (useState, etc.) | - | No global client state library |
| **Persistence** | localStorage | - | Keys: `document-editor-state`, `documentFontFamily`, `language`, `vite-ui-theme-mode` |

---

## UI & Styling

| Area | Technology | Version | Notes |
|------|------------|---------|-------|
| **CSS Framework** | Tailwind CSS | ^4.1.18 | v4 with `@tailwindcss/vite` |
| **Animation** | tw-animate-css | ^1.4.0 | Utility animations |
| **Components** | Radix UI | various | Dialog, Dropdown, ScrollArea, Slot, Tooltip |
| **Component Patterns** | shadcn/ui style | - | Button, Card, Input, Label, Separator, etc. |
| **Styling Utils** | class-variance-authority, clsx, tailwind-merge | - | `cn()` for conditional classes |
| **Icons** | lucide-react | ^0.564.0 | Consistent icon set |
| **Colors** | OKLCH | - | Modern color space for light/dark themes |

---

## Rich Text Editor

| Area | Technology | Version | Notes |
|------|------------|---------|-------|
| **Editor Core** | TipTap | ^3.19–3.20 | ProseMirror-based |
| **Extensions** | StarterKit, Image, Link, Mention, Placeholder | - | Tables, text align, resizable images |
| **Custom Extensions** | TagMention, FinancialReportBlock, PageBreak | - | Domain-specific blocks |
| **Image** | tiptap-extension-resizable-image | ^2.1.0 | Resizable + aligned images |
| **PDF Export** | jsPDF | ^4.1.0 | Client-side PDF generation |

---

## Internationalization (i18n)

| Area | Technology | Version | Notes |
|------|------------|---------|-------|
| **Library** | i18next + react-i18next | ^25.8.10 / ^16.5.4 | |
| **Locales** | English (en), Swedish (sv) | - | JSON translation files in `src/locales/` |
| **Persistence** | localStorage (`language`) | - | User preference stored locally |

---

## Development & Quality

| Area | Technology | Version | Notes |
|------|------------|---------|-------|
| **Linter** | ESLint | ^9.39.1 | Flat config, TypeScript ESLint |
| **Plugins** | react-hooks, react-refresh, import, unused-imports | - | Import ordering, no unused imports |
| **Formatter** | Prettier | ^3.7.4 | Integrated via eslint-config-prettier |
| **Testing** | Vitest | ^4.0.15 | jsdom, Testing Library |
| **Test Utils** | @testing-library/react, jest-dom, user-event | - | Component testing |
| **Coverage** | @vitest/coverage-v8 | ^4.0.15 | V8 coverage reporter |

---

## Security

| Area | Implementation | Notes |
|------|---------------|-------|
| **CSP** | Content-Security-Policy in `index.html` | Restricts sources for scripts, styles, images, fonts |
| **Img sources** | `self`, `data:`, `https:` | Allows data URLs and remote images |

---

## Build & Tooling

| Area | Configuration | Notes |
|------|---------------|-------|
| **Path alias** | `@/*` → `src/*` | TypeScript + Vite |
| **Chunk limit** | 1500 KB | Increased from default for large deps (e.g. jsPDF) |
| **Pre-optimization** | optimizeDeps.include: ["jspdf"] | Pre-bundles jsPDF for stability |
| **Base path** | `process.env.BASE_PATH` | Configurable for subpath deployment |

---

## Architecture Summary

- **Client-only**: No backend; all state in memory/localStorage
- **Strict TypeScript**: Strict mode, no unused locals/parameters
- **Component structure**: Route-based layout (`__root`, pages), reusable UI components
- **Conventions**: Named exports, `ComponentNameProps`, `handleXxx` handlers, `cn()` for styling

---

## Dependencies Summary

- **Production**: ~35 packages (React, TipTap, TanStack, Radix, Tailwind, etc.)
- **Dev**: ~25 packages (Vite, Vitest, ESLint, TypeScript, etc.)
- **Notable override**: `vite` overridden with `rolldown-vite` for Rolldown-based builds
