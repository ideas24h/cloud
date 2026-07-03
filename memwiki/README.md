# memwiki

Curated markdown wiki on top of [claude-mem](https://github.com/thedotmack/claude-mem).

`claude-mem` gives Claude Code **episodic** memory (what happened in a
session). memwiki distills that into **semantic** memory: a human-readable,
git-versioned, interlinked markdown wiki that other agents (Hermes, future
sessions, humans) can query via MCP.

Inspired by Andrej Karpathy's [LLM-wiki](https://gist.github.com/karpathy/442a6bf555914893e9891c11519de94f).

## Status

Phase 1 MVP — `install`, `ingest`, `backfill`, `context`. Lint, 3-way merge,
daemon and MCP server follow in subsequent phases per `PLAN.md`.

## Install

```bash
# inside your project
export OPENROUTER_API_KEY=sk-or-...
npx memwiki install
```

`install` scaffolds:

- `wiki/` with `index.md`, `log.md`, and empty type directories.
- `.claude/hooks/session-start` → emits curated context.
- `.claude/hooks/session-end` → runs ingest asynchronously.
- `.memwiki/config.json` → wiki dir, claude-mem URL, model.

If claude-mem is already running with prior session history, `install`
detects it and asks whether to **backfill** everything into the wiki now.
Non-interactive flags:

```bash
npx memwiki install --backfill        # yes, backfill without asking
npx memwiki install --no-backfill     # skip the prompt entirely
npx memwiki install --backfill -y     # assume yes on all prompts
```

## Ingest

Pulls observations newer than the stored cursor, asks OpenRouter to distill
them into pages, writes markdown, commits.

```bash
memwiki ingest --verbose
memwiki ingest --dry-run | jq
```

## Backfill

Ingests **all** existing claude-mem observations in batches. Useful the
first time you install memwiki on top of an existing claude-mem history,
or after nuking the wiki to re-generate from scratch.

```bash
memwiki backfill                       # confirms interactively
memwiki backfill -y                    # skip confirmation
memwiki backfill --since 1704067200000 # only rows newer than an epoch (ms)
memwiki backfill --batch-size 20 --max-batches 3   # bounded test run
memwiki backfill --dry-run             # LLM output to stdout, no writes
```

Each batch is one OpenRouter call and one git commit
(`memwiki: backfill i/N (K obs)`), so you can `git bisect` or revert
individual chunks.

## Context

Emits a compact context block for Claude Code to inject at SessionStart.

```bash
memwiki context --max-tokens 2000
```

## Configuration

`.memwiki/config.json`:

```json
{
  "wiki_dir": "wiki",
  "claude_mem_url": "http://127.0.0.1:37777",
  "model": "anthropic/claude-sonnet-4.5",
  "max_observations_per_batch": 30
}
```

Env vars:

- `OPENROUTER_API_KEY` — required for ingest.
- `MEMWIKI_MODEL` — overrides config.

## License

MIT.
