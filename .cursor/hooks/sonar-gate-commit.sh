#!/usr/bin/env bash
# Deny agent git commits that stage JS/TS unless Sonar MCP analysis ran this session.
set -euo pipefail

input=$(cat)
command=$(printf '%s' "$input" | node -e '
  let d=""; process.stdin.on("data",c=>d+=c); process.stdin.on("end",()=>{
    try { console.log(JSON.parse(d).command||""); } catch { console.log(""); }
  });
')

# Only gate real commits (not commit --help / dry-run style if ever passed oddly).
if ! printf '%s' "$command" | grep -Eq '(^|[[:space:];|&])git[[:space:]]+commit([[:space:]]|$)'; then
  printf '%s\n' '{"permission":"allow"}'
  exit 0
fi

root="${CURSOR_PROJECT_DIR:-.}"
cd "$root"

staged=$(git diff --cached --name-only --diff-filter=ACMR 2>/dev/null || true)
js_ts=$(printf '%s\n' "$staged" | grep -E '\.(ts|tsx|js|jsx)$' || true)

if [[ -z "$js_ts" ]]; then
  printf '%s\n' '{"permission":"allow"}'
  exit 0
fi

stamp_file="$root/.git/sonar-agent-analyzed"
if [[ ! -f "$stamp_file" ]]; then
  node -e '
    const msg = "Sonar before commit: staged JS/TS require SonarQube MCP analyze_file_list (preferred), run_advanced_code_analysis if available, or analyze_code_snippet as last resort. See AGENTS.md. Lefthook/Biome is not a substitute.";
    console.log(JSON.stringify({
      permission: "deny",
      user_message: "Blocked: run SonarQube MCP analysis on staged JS/TS before committing.",
      agent_message: msg
    }));
  '
  exit 0
fi

# Require a successful analysis stamp from the last hour (same agent session window).
if ! node -e '
  const fs = require("fs");
  const path = process.argv[1];
  const st = fs.statSync(path);
  const ageMs = Date.now() - st.mtimeMs;
  process.exit(ageMs <= 60 * 60 * 1000 ? 0 : 1);
' "$stamp_file"; then
  node -e '
    const msg = "Sonar before commit: analysis stamp is stale (>1h). Re-run SonarQube MCP analyze_file_list (or fallback tools) on staged JS/TS, then retry the commit.";
    console.log(JSON.stringify({
      permission: "deny",
      user_message: "Blocked: Sonar analysis stamp is stale. Re-analyze staged JS/TS before committing.",
      agent_message: msg
    }));
  '
  exit 0
fi

printf '%s\n' '{"permission":"allow"}'
exit 0
