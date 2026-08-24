# Agent notes — @tebuto/react-booking-widget

This package is a **first-class consumer** of the hosted Tebuto widget embeds. Keep it in sync with the tebuto monorepo (`webapp/src/widget/`).

## Sync contract

When the booking or seminars embed contract changes in tebuto (`data-*` attributes, theme options, script URL, container id):

1. Update the matching component here (`TebutoBookingWidget` / `TebutoSeminarsWidget`).
2. Update Jest tests and Storybook.
3. Update the README props tables.
4. Merge/release, then bump the `react-booking-widget/` submodule pointer in the tebuto monorepo.

Source of truth for attribute names: `webapp/src/widget/render.tsx` and `webapp/src/widget/seminars-render.tsx`.

## Local checks

```bash
pnpm test
pnpm lint
pnpm build
```

## Tooling & quality

- **Lefthook** + Biome — staged format/lint on commit (`lefthook.yml`).
- **SonarQube** — `sonar-project.properties`, SonarLint, Cursor MCP `analyze_code_snippet` on changed JS/TS before agent commits. See `.cursor/rules/sonarqube_mcp_instructions.mdc`.
- **CI** — `.github/workflows/branch.yaml` on `ubuntu-latest`: tests → Sonar scan → quality gate. See [`docs/ci.md`](docs/ci.md).
- **Dependabot** — yearly; weekly updates via Cursor Automation.
- Cross-project guide: Artus portal wiki **Repository Tooling (SonarQube, CI, Cursor Agents)**.
