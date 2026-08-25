---
description: SonarQube live analysis for agents
alwaysApply: true
---

# SonarQube (local)

Do not run `sonar-scanner`. Do not use `search_sonar_issues_in_projects` to verify edits (the server lags local analysis). Do not call `toggle_automatic_analysis`.

Project key is `sonar.projectKey` in `sonar-project.properties`. Do not look it up.

Requires SonarQube for IDE Connected Mode (see `.sonarlint/connectedMode.json`) so MCP can bridge to the IDE. Restart the agent after enabling Connected Mode if `analyze_file_list` is missing.

After creating or modifying `*.ts`, `*.tsx`, `*.js`, `*.jsx`, analyze each changed file. Fix every issue, re-analyze, then finish. Required before `git commit` of JS/TS (Lefthook/Biome is not a substitute).

**Analysis tool priority (batch changed files when possible):**

1. **`analyze_file_list`** — preferred. Pass `file_absolute_paths`: array of **absolute** paths.
2. **`run_advanced_code_analysis`** — if present (SonarQube Cloud Vortex). Pass project-relative `filePath`, `branch` (current git branch), `fileScope` MAIN or TEST.
3. **`analyze_code_snippet`** — last resort (deprecated). Pass project-relative `filePath`, `language`, `scope` MAIN or TEST.

Leave IDE automatic analysis on.
