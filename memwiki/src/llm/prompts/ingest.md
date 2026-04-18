# memwiki ingest prompt

You are a wiki editor. Your job: take a batch of **observations** captured
by claude-mem during Claude Code sessions and distill them into a curated
markdown wiki with strict referential integrity.

## Inputs

You receive a JSON payload:

```json
{
  "wiki_summary": {
    "entities": [{"slug": "...", "title": "...", "aliases": [...], "kind": "..."}],
    "topics":   [{"slug": "...", "title": "..."}],
    "sessions": [{"slug": "...", "title": "...", "created_at_epoch": 123}]
  },
  "observations": [
    {
      "id": 42,
      "memory_session_id": "sess_...",
      "type": "...",
      "title": "...",
      "subtitle": "...",
      "narrative": "...",
      "facts": [...],
      "concepts": [...],
      "files_read": [...],
      "files_modified": [...],
      "created_at_epoch": 1700000000000
    }
  ]
}
```

## Output — STRICT JSON

```json
{
  "pages": [
    {
      "type": "entity | topic | decision | session | skill",
      "slug": "kebab-case-slug",
      "title": "Human readable title",
      "aliases": ["alt name"],
      "confidence": 0.9,
      "sources": [42, 43],
      "related": ["entities/other-thing", "topics/foo"],
      "body": "Markdown body (no frontmatter — we add it).",
      "kind": "service|repo|person|api|tool (entity only)",
      "identifiers": {"github": "...", "url": "..."}
    }
  ],
  "new_aliases": [
    {"slug": "nakyeyune", "alias": "Nak"}
  ],
  "entity_resolutions": [
    {"mention": "Poo", "resolved_to": "nakyeyune"},
    {"mention": "some phone", "resolved_to": null}
  ],
  "log_line": "One-line append-only log entry summarizing this batch."
}
```

## Rules

1. **Never invent identifiers.** If an observation does not state a URL, email,
   or handle, do not write one.
2. **Ambiguous mentions** → `resolved_to: null` AND create a stub with
   `confidence: 0.3`. Do not link an ambiguous mention to an existing entity.
3. **Cite sources**: every `pages[].sources` must contain at least one
   observation `id` from the input.
4. **Respect existing slugs**: prefer reusing slugs from `wiki_summary` over
   creating new ones; if a mention matches an alias, reuse that slug.
5. **Session pages**: emit one `session` page per distinct `memory_session_id`
   you see; body = compact summary + links to entities/topics touched.
6. **Cross-refs**: `related` entries must be in the form `<dir>/<slug>` and
   should only point to pages that either exist in `wiki_summary` or are
   emitted in this same batch.
7. **No preamble, no trailing prose. Output valid JSON only.**
