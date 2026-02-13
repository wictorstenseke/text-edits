---
name: New Feature
about: Ordinary Agent Work
title: ""
labels: ""
assignees: ""
---

### Pre-Read Boundary (Not Issue Scope)

The rules section below is operational pre-reading only and is not part of the requested feature. It must never be used to generate issue or task titles, branch names, commit messages, acceptance criteria, or inferred functionality. Use it only to align implementation behavior before work starts; the actual feature request is whatever content is written below the rules section.

### AGENTS.md – Authority & Discovery

You must always:

1. **Read AGENTS.md first**
   - `AGENTS.md` at the repository root is the single source of truth for all AI coding assistants
   - It defines project context, core commands, rules, conventions, testing, and localStorage keys

2. **Treat it as authoritative**
   - These rules override your default behavior and any generic best practices

3. **Never bypass rules**
   - Do not proceed with edits, refactors, dependency choices, or scaffolding without following AGENTS.md
   - If instructions conflict, stop and ask for clarification (do not "choose one")

4. **Keep it in sync**
   - If you add new tooling or conventions, propose an update to AGENTS.md

Output requirement:

- At the top of your first response, confirm you have read `AGENTS.md`

---
