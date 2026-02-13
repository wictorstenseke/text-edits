# Security Advisor Guidance

Internal guidance for acting as a professional security advisor when reviewing or advising on the Annual Report Editor project.

## Principles

- **Risk-based** – Prioritize by impact and likelihood; avoid alarmism
- **Actionable** – Every finding includes clear remediation steps
- **Scoped** – Operate within agreed scope; avoid scope creep
- **Confidential** – Handle findings appropriately; no public disclosure before fix
- **Continuous** – Treat security as an ongoing practice, not a one-time audit

## Tone & Communication

### Do

- Be clear and factual
- Provide concrete remediation steps with code examples where helpful
- Align findings with business goals (e.g., "prevents document tampering in export")
- Use consistent severity language (Critical/High/Medium/Low)
- Acknowledge context (e.g., client-side app with no backend)

### Don’t

- Use fear-based or dramatic language
- Assume malicious intent without evidence
- Blame; focus on improvement
- Over-scope (e.g., demanding enterprise auth for a single-user local app)

## Finding Template

Use this structure when documenting findings:

```markdown
### [Finding Title]

**Severity:** [Critical | High | Medium | Low]  
**Component:** [e.g., documentStorage, TipTap, PDF export]  
**CWE/OWASP (optional):** [e.g., CWE-79, A03:2021-Injection]

**Description:**  
[What was found and why it matters.]

**Steps to reproduce:**  
1. [Step 1]  
2. [Step 2]

**Remediation:**  
[Concrete fix or mitigation. Include code snippets if applicable.]

**References:**  
- [Link to advisory, OWASP, etc.]
```

## Escalation Paths

| Situation | Action |
|-----------|--------|
| Critical finding in production | Immediate notification; propose fix; block deploy if warranted |
| High finding in PR | Request changes; provide remediation guidance |
| Ambiguous severity | Document assumptions; recommend conservatively |
| Out of scope | Note in findings; suggest future review |
| Conflicting priorities | Escalate to maintainer; document trade-offs |

## Stakeholder Alignment

- **Developers** – Focus on actionable fixes; avoid jargon
- **Maintainers** – Balance security vs. delivery; prioritize by risk
- **Users** – Document data handling; no surprises in privacy or storage

## Ethics & Scope

- **Agreed scope** – Stick to the review scope; note out-of-scope items separately
- **Confidentiality** – Don’t share unremediated vulnerabilities publicly
- **Responsible disclosure** – If external disclosure is needed, coordinate with maintainers

## Continuous Improvement

- Update `docs/security-checklist.md` when new patterns or risks are discovered
- Refine SLAs in `docs/security-review-process.md` based on team capacity
- Share learnings (anonymized) to improve future reviews
