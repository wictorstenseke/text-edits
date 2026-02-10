# Annual Report Editor - Copilot Instructions

This is a React-based document editor for structured reports with rich text, nested sections, tags, and PDF export. The application runs entirely client-side with localStorage persistence.

## Build, Test, and Lint

### Full Suite
```bash
npm run ci           # type-check + lint + test
npm run build        # Complete production build (includes ci checks)
npm run check:full   # ci + production build
```

### Individual Commands
```bash
npm run dev                  # Start dev server
npm run type-check           # TypeScript check (generates route tree)
npm run lint                 # ESLint
npm run lint:fix             # Auto-fix linting issues
npm test                     # Run all tests once
npm run test:watch           # Run tests in watch mode
npm run test:coverage        # Run tests with coverage report
npm run format               # Format with Prettier
npm run generate:routes      # Generate TanStack Router route tree
```

### Running Single Tests
```bash
# Run a specific test file
npm test src/lib/sectionHierarchy.test.ts

# Run tests matching a pattern
npm test -- --grep "should add section"

# Watch mode for specific file
npm run test:watch src/lib/utils.test.ts
```

## Architecture

### Tech Stack
- **React 19** + TypeScript (strict mode)
- **Vite** (aliased to `rolldown-vite@7.2.11` for performance)
- **TanStack Router** (file-based routing, routes auto-generated in `src/routeTree.gen.ts`)
- **TanStack Query** + React Query Devtools
- **Tailwind CSS v4** (configured via `@tailwindcss/vite`)
- **shadcn/ui** + Radix UI primitives (some newer components may use Base UI)
- **TipTap** for rich text editing
- **jsPDF** for PDF export
- **Vitest** + Testing Library + jsdom

### Key Directories
```
src/
  components/
    document-page/      # Main document editor UI components
    rich-text-editor/   # TipTap extensions and editor components
    ui/                 # shadcn/ui components (Radix/Base UI primitives)
  pages/
    DocumentEditor.tsx  # Main application page
  lib/
    documentStorage.ts  # localStorage persistence + sample documents
    sectionHierarchy.ts # Parent/child section logic
    pdfExport.ts        # PDF generation
    api.ts              # Placeholder API layer
  routes/               # TanStack Router file-based routes
  types/
    document.ts         # Core document type definitions
```

### Data Flow
1. **Storage**: `documentStorage.ts` handles localStorage persistence with key `document-editor-state`
2. **Section Hierarchy**: Two-level structure (parent sections → child sections), managed by `sectionHierarchy.ts`
3. **Routing**: File-based routes with TanStack Router (requires `npm run generate:routes` after route changes)
4. **State**: Local component state + localStorage autosave (no backend)

### TipTap Editor Extensions
The rich text editor includes custom extensions for:
- Financial report blocks
- Resizable images
- Tables with custom styling
- Mention system for tags (`@` trigger)
- Page breaks for PDF export

## Conventions

### TypeScript & Imports
- Use strict TypeScript mode; avoid `any` type
- Prefer `const` arrow functions with explicit types
- Import path alias: `@/*` maps to `./src/*` (configured in tsconfig and vite.config)
- Import order enforced by ESLint:
  1. React (always first)
  2. External packages (builtin → external → TanStack packages)
  3. Internal modules (internal → parent → sibling → index)
  4. Type imports (last)
  5. Alphabetized within each group with blank lines between groups

### React Components
- **Export as named exports** (not default)
- Event handlers prefix: `handle` (e.g., `handleClick`, `handleSubmit`)
- Props interfaces: `ComponentNameProps`
- Accessibility: Include ARIA labels, keyboard handlers, semantic HTML
- Styling: Use `cn()` utility from `@/lib/utils` for conditional Tailwind classes
- Avoid inline styles; use Tailwind classes exclusively

### UI Components (shadcn)
- **Check Shadcn CLI before building custom UI**: `npx shadcn@latest add <component>`
- Components configured for **Radix UI** (style: "new-york" in `components.json`)
- Newer components may use **Base UI** (`@base-ui/react`) - both are valid
- Icons: Use **Lucide React** (`import { IconName } from "lucide-react"`)
- Structure: Follow `cva` for variants, forward refs with `React.forwardRef`

### Testing (Vitest)
- **Co-locate test files** with source code (e.g., `utils.test.ts` next to `utils.ts`)
- Use `describe` blocks to group related tests
- Test names: `it("should [verb] when [condition]")`
- Globals enabled: `describe`, `it`, `expect` available without imports
- Setup file: `src/test/setup.ts` configures jsdom and Testing Library

### Code Quality
- **No TODOs or placeholders** - code must be complete and functional
- Use early returns for improved readability
- Descriptive variable and function names
- Run `npm run ci` before committing to catch issues
- Unused imports auto-fixed by ESLint (`unused-imports` plugin)

### Routing (TanStack Router)
- File-based routes in `src/routes/`
- **Must run `npm run generate:routes`** after adding/modifying routes
- Route tree auto-generated at `src/routeTree.gen.ts` (do not edit manually)
- Main route: `src/routes/index.tsx` mounts `DocumentEditor` at `/`

## localStorage Keys
- `document-editor-state` - Full document payload
- `documentFontFamily` - Selected font family
- `vite-ui-theme-mode` - Theme mode (light/dark)

## CI/CD
- GitHub Actions (`.github/workflows/ci.yml`) runs on push/PR to main/develop
- CI runs: `npm ci` → `npm run ci` → `npm run build`
- Deploys to GitHub Pages on push to main (with `BASE_PATH` env var set)
- All checks must pass before merge

## Important Notes
- Vite is aliased to `rolldown-vite` for performance - this is intentional
- TanStack Router CLI runs during type-check and build steps
- Route generation is automatic but requires explicit script run during development
- Tests are fast (<1s for full suite) - run them frequently
