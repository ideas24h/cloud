import { readFile, readdir, stat } from "node:fs/promises";
import { existsSync } from "node:fs";
import { join, resolve } from "node:path";
import { Workspace } from "../state.js";
import { parsePage } from "../wiki/store.js";

export async function context(opts: { maxTokens: number }): Promise<void> {
  const cwd = process.cwd();
  const ws = new Workspace(cwd);
  const cfg = await ws.config();
  const wikiRoot = resolve(cwd, cfg.wiki_dir);

  if (!existsSync(wikiRoot)) {
    return;
  }

  const budget = Math.max(500, opts.maxTokens) * 4;
  let remaining = budget;
  const chunks: string[] = [];

  const indexPath = join(wikiRoot, "index.md");
  if (existsSync(indexPath)) {
    const raw = await readFile(indexPath, "utf8");
    const slice = raw.slice(0, Math.min(raw.length, 1200));
    remaining -= slice.length;
    chunks.push("# memwiki · index\n\n" + slice);
  }

  const sessionsDir = join(wikiRoot, "sessions");
  if (existsSync(sessionsDir) && remaining > 0) {
    const recent = await listMostRecent(sessionsDir, 5);
    const lines: string[] = ["## recent sessions\n"];
    for (const f of recent) {
      const raw = await readFile(f, "utf8");
      try {
        const page = parsePage(f, raw);
        lines.push(`- [[sessions/${page.frontmatter.slug}]] — ${page.frontmatter.title}`);
      } catch {
        /* skip malformed */
      }
    }
    const out = lines.join("\n");
    if (out.length <= remaining) {
      chunks.push(out);
      remaining -= out.length;
    }
  }

  const entitiesDir = join(wikiRoot, "entities");
  if (existsSync(entitiesDir) && remaining > 0) {
    const hot = await listMostRecent(entitiesDir, 10);
    if (hot.length > 0) {
      const lines: string[] = ["## hot entities\n"];
      for (const f of hot) {
        const raw = await readFile(f, "utf8");
        try {
          const page = parsePage(f, raw);
          const kind = page.frontmatter.kind ? ` (${page.frontmatter.kind})` : "";
          lines.push(`- [[entities/${page.frontmatter.slug}]]${kind} — ${page.frontmatter.title}`);
        } catch {
          /* skip */
        }
      }
      const out = lines.join("\n");
      if (out.length <= remaining) chunks.push(out);
    }
  }

  process.stdout.write(chunks.join("\n\n") + "\n");
}

async function listMostRecent(dir: string, n: number): Promise<string[]> {
  const entries = await readdir(dir);
  const files: { path: string; mtime: number }[] = [];
  for (const e of entries) {
    if (!e.endsWith(".md")) continue;
    const p = join(dir, e);
    const s = await stat(p);
    files.push({ path: p, mtime: s.mtimeMs });
  }
  return files.sort((a, b) => b.mtime - a.mtime).slice(0, n).map((f) => f.path);
}
