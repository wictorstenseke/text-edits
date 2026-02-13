# Security Review Process

This document describes how to conduct security reviews, where to store findings, SLAs, and escalation paths for the Annual Report Editor project.

## Methodology

Follow this repeatable cycle:

1. **Threat modeling** – Identify assets (document data, user preferences, exported PDFs) and threats
2. **Assessment** – Run checklist + automated tools; document findings
3. **Remediation** – Fix or mitigate; track in issues/PRs
4. **Validation** – Re-run checks; confirm fixes; update checklist if needed

## Where to Store Findings

| Type | Location | Format |
|------|----------|--------|
| **Vulnerability** | GitHub Security Advisories or private issue | Title: `[SECURITY] …` |
| **Dependency alert** | Dependabot PR or manual issue | Link to advisory |
| **Code review finding** | PR review comment or issue | Severity label (Critical/High/Medium/Low) |
| **Process improvement** | `docs/` or `AGENTS.md` | Document change in PR |

## Severity Labels

Use risk-based prioritization (aligned with CVSS where applicable):

| Severity | Example | Response |
|----------|---------|----------|
| **Critical** | RCE, auth bypass, data exfiltration | Immediate fix; block release |
| **High** | XSS, significant data exposure | Fix within 1 week |
| **Medium** | Minor info disclosure, deprecated deps | Fix within 2 weeks |
| **Low** | Best-practice gaps, hardening | Backlog; address when convenient |

## SLAs (Suggested)

| Finding type | Triage | Remediation |
|-------------|--------|-------------|
| Critical | Same day | Before next release |
| High | 2 business days | 1 week |
| Medium | 1 week | 2 weeks |
| Low | As capacity allows | Backlog |

## Escalation Paths

1. **Developer** – Triage finding, create issue, assign severity
2. **Maintainer** – Review and approve remediation approach
3. **Security incident** – Follow repository/organization incident response; notify stakeholders per policy

For this project (single maintainer/team), escalation is typically: triage → fix → validate → close.

## Automated Checks

Integrate into development workflow:

| Check | When | Command/tool |
|-------|------|--------------|
| Dependency audit | PR, CI | `npm audit` |
| Dependabot | Weekly (configurable) | `.github/dependabot.yml` |
| Type check | Every commit | `npm run type-check` |
| Lint | Every commit | `npm run lint` |
| Tests | Every commit | `npm run test` |

## Periodic Reviews

- **Quarterly** – Full checklist run; update dependencies; review new OWASP guidance
- **Per major feature** – Threat model for new data flows (e.g., cloud sync, auth)
- **After incidents** – Post-mortem; update process and checklist
