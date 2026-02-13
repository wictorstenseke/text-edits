# Security Checklist

A security checklist tailored to the Annual Report Editor stack: React 19, TypeScript, Vite (rolldown-vite), TanStack Router, Tailwind v4, TipTap, jsPDF.

Use this checklist during security reviews and when introducing new features.

## 1. Code & Dependencies

- [ ] **Run `npm audit`** – Triage and fix known vulnerabilities before release
- [ ] **Review Dependabot/renovate alerts** – Prioritize by CVSS and exploitability
- [ ] **Pin dependency versions** – Avoid floating major/minor in production (use `^` with care)
- [ ] **Lockfile integrity** – Use `npm ci` in CI to ensure reproducible installs
- [ ] **Transitive deps** – Check `npm ls` for unexpected or duplicate packages

## 2. Authentication & Authorization

- [ ] **No server auth (current scope)** – App is client-side only; document data lives in `localStorage`
- [ ] **Future backend** – If adding auth: use secure session handling, CSRF tokens, secure cookies
- [ ] **Access control** – If multi-user: document ownership and sharing permissions

## 3. Data Protection

- [ ] **No PII in logs** – Avoid logging document content, user names, or identifiers
- [ ] **localStorage scope** – Keys documented in AGENTS.md; no credentials or secrets
- [ ] **JSON validation** – `loadDocument()` validates structure before use; invalid data falls back to default
- [ ] **Exported PDFs** – Content is user-controlled; ensure no unintended data leakage in export

## 4. Input Validation & Injection

- [ ] **No `dangerouslySetInnerHTML`** – Use React’s default escaping; prefer TipTap for rich text
- [ ] **No `eval()` or `new Function()`** – Avoid dynamic code execution
- [ ] **TipTap content** – Rich text is stored as JSON; TipTap sanitizes on render
- [ ] **Mention/tag values** – Validate before storing in `tagValues`
- [ ] **Links** – Use `javascript:` and `data:` URL validation if user-provided links are allowed

## 5. API & Configuration

- [ ] **No API calls (current)** – App is static; no backend API in scope
- [ ] **Future APIs** – Use HTTPS, validate CORS, avoid credentials in URLs
- [ ] **Environment variables** – No secrets in frontend; use build-time vars for config only
- [ ] **Base path** – `BASE_PATH` set for GitHub Pages; no sensitive paths exposed

## 6. Client-Side Security

- [ ] **localStorage keys** – `document-editor-state`, `documentFontFamily`, `language`, `vite-ui-theme-mode` (AGENTS.md)
- [ ] **Third-party scripts** – None; app uses npm packages only
- [ ] **CSP** – Consider Content-Security-Policy headers if hosting requires it
- [ ] **Images** – TipTap image extension; validate dimensions and avoid external URLs if sensitive

## 7. Build & CI

- [ ] **CI runs** – `npm run ci` (type-check, lint, tests) and `npm run build` before deploy
- [ ] **No secrets in workflows** – GitHub Actions use `GITHUB_TOKEN`; no hardcoded keys
- [ ] **Dependabot** – Enable for automated security updates (see `.github/dependabot.yml`)
- [ ] **Supply chain** – Use `npm ci`; consider `npm audit` in CI for failing on high/critical

## Stack-Specific Notes

| Stack      | Security focus |
|-----------|----------------|
| React 19  | Avoid deprecated APIs; use concurrent features responsibly |
| TipTap    | Rich text sanitization; link/image URL handling |
| jsPDF     | No user input passed to eval; content is text/structured |
| Vite      | No dev server in production; ensure build output is static |
| TanStack  | Route params; validate before use in components |

## References

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [CWE Top 25](https://cwe.mitre.org/top25/)
- [NIST SSDF](https://www.nist.gov/itl/ssdf)
