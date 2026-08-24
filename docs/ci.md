# CI (GitHub Actions)

Runner: `ubuntu-latest` for tebuto org repos. Cross-project tooling: Artus portal wiki **Repository Tooling (SonarQube, CI, Cursor Agents)** or [agency-portal `docs/dev-tooling.md`](https://github.com/artus-engineering/agency-portal/blob/main/docs/dev-tooling.md).

## Workflows

| File | Purpose |
| --- | --- |
| `.github/workflows/branch.yaml` | Lint, tests → SonarQube scan → quality gate |

## Required checks

After rollout, enable on `main`:

- **Tests**
- **SonarQube Scan**
- **SonarQube Quality Gate**

Secrets: `SONAR_TOKEN`, `SONAR_HOST_URL`.
