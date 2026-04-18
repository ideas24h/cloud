import { readFile } from "node:fs/promises";
import { existsSync, writeFileSync, unlinkSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { ClaudeMemClient, Observation } from "../clients/claude-mem.js";
import { loadProviderFromEnv } from "../llm/provider.js";
import { WikiStore, Frontmatter, PageType, slugify } from "../wiki/store.js";
import { Workspace } from "../state.js";
import { commitPath, isGitRepo } from "../git/commit.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const PROMPT_PATH = resolve(__dirname, "../llm/prompts/ingest.md");

type LLMPage = {
  type: PageType;
  slug: string;
  title: string;
  aliases?: string[];
  confidence?: number;
  sources: number[];
  related?: string[];
  body: string;
  kind?: string;
  identifiers?: Record<string, string>;
};

type LLMOutput = {
  pages: LLMPage[];
  new_aliases?: { slug: string; alias: string }[];
  entity_resolutions?: { mention: string; resolved_to: string | null }[];
  log_line?: string;
};

export async function ingest(opts: { since?: number; dryRun?: boolean; verbose?: boolean }): Promise<void> {
  const cwd = process.cwd();
  const ws = new Workspace(cwd);
  await ws.init();
  const cfg = await ws.config();
  const wikiRoot = resolve(cwd, cfg.wiki_dir);
  const store = await WikiStore.open(wikiRoot);

  if (existsSync(ws.lockPath)) {
    console.error(`memwiki: lockfile present at ${ws.lockPath}; another ingest is running.`);
    process.exit(2);
  }
  writeFileSync(ws.lockPath, String(process.pid));

  try {
    const state = await ws.state();
    const cursor = opts.since ?? state.last_ingested_epoch;
    const client = new ClaudeMemClient(cfg.claude_mem_url);

    const health = await client.health().catch(() => null);
    if (!health) {
      console.error("memwiki: claude-mem not reachable at", cfg.claude_mem_url);
      process.exit(3);
    }

    const hits = await client.since(cursor, cfg.max_observations_per_batch);
    if (hits.length === 0) {
      if (opts.verbose) console.error("memwiki: no new observations since", cursor);
      return;
    }

    const obs = await client.getObservations(hits.map((h) => h.id));
    const summary = await wikiSummary(wikiRoot);
    const prompt = await readFile(PROMPT_PATH, "utf8");
    const provider = loadProviderFromEnv(cfg.model);

    const llmRaw = await provider.complete(
      [
        { role: "system", content: prompt },
        {
          role: "user",
          content: JSON.stringify({ wiki_summary: summary, observations: obs }),
        },
      ],
      { json: true },
    );

    let out: LLMOutput;
    try {
      out = JSON.parse(llmRaw) as LLMOutput;
    } catch {
      throw new Error(`LLM did not return JSON:\n${llmRaw.slice(0, 600)}`);
    }

    if (opts.verbose) {
      console.error(`memwiki: LLM emitted ${out.pages.length} pages`);
    }

    if (opts.dryRun) {
      console.log(JSON.stringify(out, null, 2));
      return;
    }

    const now = new Date().toISOString();
    for (const p of out.pages) {
      const slug = slugify(p.slug || p.title);
      const path = store.pathFor(p.type, slug);
      const existing = await store.read(relPath(wikiRoot, path));
      const fm: Frontmatter = {
        id: existing?.frontmatter.id ?? cryptoId(),
        type: p.type,
        title: p.title,
        slug,
        aliases: dedupe([...(existing?.frontmatter.aliases ?? []), ...(p.aliases ?? [])]),
        created_at: existing?.frontmatter.created_at ?? now,
        updated_at: now,
        sources: dedupeNum([...(existing?.frontmatter.sources ?? []), ...p.sources]),
        authored_by: existing ? "mixed" : "memwiki",
        confidence: p.confidence ?? 0.8,
        related: dedupe([...(existing?.frontmatter.related ?? []), ...(p.related ?? [])]),
        schema_version: 1,
      };
      if (p.type === "entity") {
        if (p.kind) fm.kind = p.kind;
        if (p.identifiers) fm.identifiers = p.identifiers;
      }
      await store.write({ path: relPath(wikiRoot, path), frontmatter: fm, body: p.body.trim() + "\n" });
    }

    if (out.log_line) {
      await store.appendLog(`- [${now}] ${out.log_line}`);
    }

    const maxEpoch = obs.reduce((m, o) => Math.max(m, o.created_at_epoch ?? 0), cursor);
    await ws.saveState({ ...state, last_ingested_epoch: maxEpoch });

    if (await isGitRepo(cwd)) {
      const msg = `memwiki: ingest ${out.pages.length} page(s) (${obs.length} observations)`;
      const result = await commitPath(cwd, cfg.wiki_dir, msg);
      if (opts.verbose) {
        console.error(result.committed ? `memwiki: committed ${result.sha}` : "memwiki: no wiki changes to commit");
      }
    }

    console.log(`memwiki: ingested ${obs.length} observations → ${out.pages.length} pages`);
  } finally {
    if (existsSync(ws.lockPath)) unlinkSync(ws.lockPath);
  }
}

async function wikiSummary(wikiRoot: string) {
  const { readdir } = await import("node:fs/promises");
  const out: Record<string, { slug: string; title: string }[]> = {
    entities: [],
    topics: [],
    sessions: [],
  };
  for (const [key, dir] of [
    ["entities", "entities"],
    ["topics", "topics"],
    ["sessions", "sessions"],
  ] as const) {
    const p = join(wikiRoot, dir);
    if (!existsSync(p)) continue;
    const entries = await readdir(p);
    for (const f of entries) {
      if (!f.endsWith(".md")) continue;
      out[key].push({ slug: f.replace(/\.md$/, ""), title: f.replace(/\.md$/, "") });
    }
  }
  return out;
}

function relPath(root: string, abs: string): string {
  return abs.startsWith(root) ? abs.slice(root.length + 1) : abs;
}

function cryptoId(): string {
  return `mw_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
}

function dedupe<T>(arr: T[]): T[] {
  return Array.from(new Set(arr));
}
function dedupeNum(arr: number[]): number[] {
  return Array.from(new Set(arr));
}

export type { Observation };
