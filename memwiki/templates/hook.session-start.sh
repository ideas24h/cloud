#!/usr/bin/env bash
# memwiki: SessionStart hook. Emits curated wiki context on stdout so
# Claude Code injects it into the session preamble.
set -eu
cd "${CLAUDE_PROJECT_DIR:-$(pwd)}"
if ! command -v memwiki >/dev/null 2>&1; then
  exit 0
fi
memwiki context --max-tokens 2000 || true
