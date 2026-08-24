#!/usr/bin/env bash
# Record successful SonarQube MCP live-analysis calls for the commit gate.
set -euo pipefail

input=$(cat)
root="${CURSOR_PROJECT_DIR:-$(pwd)}"
stamp_dir="${root}/.git"
stamp_file="${stamp_dir}/sonar-agent-analyzed"

is_analyze=$(printf '%s' "$input" | node -e '
  let d=""; process.stdin.on("data",c=>d+=c); process.stdin.on("end",()=>{
    try {
      const j=JSON.parse(d);
      const blob=JSON.stringify(j).toLowerCase();
      const hit =
        blob.includes("analyze_file_list") ||
        blob.includes("analyze_code_snippet") ||
        /analyze_file_list|analyze_code_snippet/.test(
          String(j.toolName||j.tool_name||j.name||j.tool||"")
        );
      const failed =
        /"status"\s*:\s*"(error|failed|failure|denied)"/i.test(blob) ||
        j.error != null;
      process.stdout.write(hit && !failed ? "yes" : "no");
    } catch {
      process.stdout.write("no");
    }
  });
')

if [[ "$is_analyze" != "yes" ]]; then
  exit 0
fi

mkdir -p "$stamp_dir"
date -u +%Y-%m-%dT%H:%M:%SZ >> "$stamp_file"
tail -n 50 "$stamp_file" > "${stamp_file}.tmp" && mv "${stamp_file}.tmp" "$stamp_file"
exit 0
