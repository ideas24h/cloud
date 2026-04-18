#!/usr/bin/env bash
# memwiki: SessionEnd hook installed by `memwiki install`.
# Runs ingest asynchronously so Claude Code does not block on it.
set -eu
cd "${CLAUDE_PROJECT_DIR:-$(pwd)}"
if ! command -v memwiki >/dev/null 2>&1; then
  exit 0
fi
(memwiki ingest >/dev/null 2>"$CLAUDE_PROJECT_DIR/.memwiki/ingest.err" &) || true
