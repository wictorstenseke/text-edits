# Tech Stack Analysis - Linear Issue TEX-1 Comment

Copy the content below (including the opening and closing ``` marks) and paste it as a comment on the Linear issue.

---

```
# Tech Stack Analysis — Annual Report Editor

## Overview
Client-side React + TypeScript app for creating/editing annual reports. No backend; state lives in memory and localStorage.

---

## Core
| Layer      | Technology                    | Notes                                        |
|------------|-------------------------------|----------------------------------------------|
| Framework  | React 19.2                    | Latest major                                 |
| Language   | TypeScript 5.9 (strict)       | ES2022 target                                |
| Build      | Vite (rolldown-vite 7.2.11)   | Rolldown-based for faster builds             |

---

## Routing & State
| Area          | Technology               | Notes                                           |
|---------------|--------------------------|-------------------------------------------------|
| Routing       | TanStack Router 1.162    | File-based, type-safe, codegen via CLI          |
| Server state  | TanStack React Query 5.90| With devtools                                  |
| Persistence   | localStorage             | document-editor-state, documentFontFamily, language, vite-ui-theme-mode |

---

## UI & Styling
| Area        | Technology                         | Notes                          |
|-------------|------------------------------------|--------------------------------|
| CSS         | Tailwind v4.1                      | @tailwindcss/vite, tw-animate  |
| Components  | Radix UI (Dialog, Dropdown, etc.)  | shadcn/ui-style primitives     |
| Utils       | CVA, clsx, tailwind-merge          | cn() for conditional classes   |
| Icons       | lucide-react 0.564                 |                                |
| Themes      | OKLCH-based light/dark             |                                |

---

## Rich Text Editor
| Area      | Technology                       | Notes                                |
|-----------|----------------------------------|--------------------------------------|
| Core      | TipTap 3.19–3.20                 | ProseMirror-based                    |
| Extensions| StarterKit, Image, Link, Mention, Placeholder, Table, TextAlign | |
| Custom    | TagMention, FinancialReportBlock, PageBreak | Domain-specific blocks    |
| Images    | tiptap-extension-resizable-image | Resizable + aligned                  |
| PDF       | jsPDF 4.1                        | Client-side export                   |

---

## i18n
- i18next 25.8 + react-i18next 16.5
- Locales: English, Swedish (JSON in src/locales/)
- Language preference in localStorage

---

## Dev & Quality
| Area   | Technology                          | Notes                                  |
|--------|-------------------------------------|----------------------------------------|
| Lint   | ESLint 9 + TypeScript ESLint 8      | react-hooks, import order, unused-imports |
| Format | Prettier 3.7                        |                                        |
| Test   | Vitest 4 + Testing Library + jsdom  | Coverage via v8                        |

---

## Security
- Content-Security-Policy in index.html
- Img sources: self, data:, https:

---

## Architecture
- Client-only; no backend
- Path alias: @/* → src/*
- Conventions: named exports, ComponentNameProps, handleXxx handlers, cn() for styling
```
