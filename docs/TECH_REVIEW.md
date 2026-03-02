# Tech Review – Annual Report Editor

**Datum:** 2025-03-02  
**Scope:** Dependencies, arkitektur, prestanda, säkerhet, developer experience  
**PR:** Lägg till `Resolves #0667` (eller rätt issue-nummer) i PR-beskrivningen.

---

## Sammanfattning

Projektet använder en modern, välunderhållen tech stack (React 19, TypeScript 5.9, Vite/Rolldown, TanStack Router, TipTap, Tailwind v4). CI, tester och säkerhetskontroll passerar. Nedan följer prioriterade åtgärdspunkter.

---

## 1. Dependencies

### Säkerhet
- **npm audit:** 0 sårbarheter

### Utdateringar (npm outdated)
Följande paket har nyare versioner tillgängliga:

| Paket | Nuvarande | Senaste | Prioritet |
|-------|-----------|---------|-----------|
| @tailwindcss/vite, tailwindcss | 4.1.18 | 4.2.1 | Låg |
| @tanstack/react-query, devtools | 5.90.x | 5.90.21 / 5.91.3 | Låg |
| @tanstack/react-router | 1.162.4 | 1.163.3 | Låg |
| @tiptap/* (alla) | 3.19–3.20 | 3.20.0 | Låg |
| lucide-react | 0.564.0 | 0.576.0 | Låg |
| i18next | 25.8.10 | 25.8.13 | Låg |
| jspdf | 4.1.0 | 4.2.0 | Låg |
| tailwind-merge | 3.4.1 | 3.5.0 | Låg |

**Rekommendation:** Kör `npm update` för minor/patch-uppdateringar. Testa efteråt med `npm run ci`.

### Oanvända eller underutnyttjade beroenden

| Paket | Status | Åtgärd |
|-------|--------|--------|
| @tanstack/react-query | Provider finns, men inga `useQuery`/`useMutation` används | **Medel** – Antingen ta bort (QueryClientProvider + Devtools) om ingen API-integration planeras, eller behåll för framtida server-state |
| @tanstack/react-query-devtools | Endast användbart om React Query används | Följer samma beslut som ovan |

**Rekommendation:** Om appen fortsatt bara använder localStorage och ingen API-plan finns: överväg att ta bort React Query och devtools för att minska bundle-storlek och komplexitet.

### Versioner router-cli vs router
- `@tanstack/react-router`: ^1.162.4
- `@tanstack/router-cli`, `@tanstack/router-vite-plugin`: ^1.160.0

**Rekommendation:** Uppdatera router-cli och router-vite-plugin till samma major/minor som react-router (t.ex. ^1.162.x) för konsekvens.

---

## 2. Arkitektur

### Mappstruktur
Strukturen är tydlig: `src/pages`, `src/components`, `src/lib`, `src/routes`, `src/locales`.

### Stora komponenter
- **DocumentEditor.tsx** (~734 rader) – Huvudkomponenten med mycket state och logik.

**Rekommendation (prioritet: medel):**
- Bryt ut state-logik till custom hooks (t.ex. `useDocumentEditor`, `useSectionManagement`, `useTagManagement`).
- Överväg `useReducer` eller enkel state-machine för dialog-state om antalet dialoger växer.

### Komponentuppdelning
- `document-page/` – Bra uppdelning (TagSidebar, SectionNavigationSidebar, DocumentContentRenderer, etc.).
- `rich-text-editor/` – Tydlig separation av TipTap-extensions.

---

## 3. Prestanda

### Bundle-storlek (production build)
| Chunk | Storlek | Gzip |
|-------|---------|------|
| index (main) | 1 440 kB | 449 kB |
| html2canvas | 200 kB | 47 kB |
| purify.es | 21 kB | 8 kB |

**html2canvas** och **dompurify** kommer som optional dependencies från jspdf. Projektets `pdfExport.ts` använder inte html2canvas (direkt DOM-text istället). Rolldown/Vite kan fortfarande inkludera dem om jspdf importerar dem dynamiskt.

**Rekommendation (prioritet: låg):** Undersök om tree-shaking kan exkludera html2canvas/dompurify om de inte används. Detta kan kräva konfiguration eller en annan PDF-export-strategi.

### Tidigare prestandaåtgärder
`docs/PERFORMANCE_IMPROVEMENTS.md` beskriver redan:
- Lazy state-init för localStorage
- Memoization (useMemo, useCallback)
- Rätt cleanup av event listeners
- En enda TooltipProvider

### Chunk-gräns
`vite.config.ts` har `chunkSizeWarningLimit: 1500` – main-bundlen är ~1440 kB, så varningen undviks. Övervaka vid nya stora beroenden.

---

## 4. Säkerhet

- **npm audit:** 0 sårbarheter
- **CI:** `npm audit --audit-level=high` körs i workflow
- **Säkerhetsprocess:** `docs/security-review-process.md` finns

---

## 5. Developer Experience

### Positivt
- AGENTS.md – tydliga regler för AI-assistenter
- `npm run ci` – type-check, lint, test
- `npm run check:full` – inkl. build
- ESLint med unused-imports
- Prettier
- Co-located tests
- i18n (en + sv) följs konsekvent

### Förbättringar

| Område | Rekommendation | Prioritet |
|--------|----------------|-----------|
| Node-version | CI använder Node 20. Överväg `.nvmrc` eller `engines` i package.json för lokal utveckling | Låg |
| Depcheck | Lägg till `depcheck` som dev-script för att hitta oanvända dependencies | Låg |
| Bundle-analys | `vite-plugin-bundle-visualizer` eller `rollup-plugin-visualizer` för att följa bundle-storlek | Låg |

---

## Prioriterade åtgärdspunkter

### Hög prioritet
1. **Inga** – Projektet är i gott skick.

### Medel prioritet
2. **React Query** – Besluta om paketen ska behållas (för framtida API) eller tas bort.
3. **DocumentEditor** – Refaktorera till hooks för bättre underhållbarhet.

### Låg prioritet
4. **Paketuppdateringar** – Kör `npm update` och verifiera.
5. **Router-cli** – Synka versioner med @tanstack/react-router.
6. **DX** – Lägg till `.nvmrc` och eventuellt depcheck/bundle-visualizer.

---

## Verifiering

| Kontroll | Status |
|----------|--------|
| npm run ci | ✅ |
| npm run build | ✅ |
| npm audit | ✅ 0 vulnerabilities |
| Tester (81 st) | ✅ |
