import { mkdir, readFile, writeFile, chmod, copyFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { Workspace } from "../state.js";
import { ClaudeMemClient } from "../clients/claude-mem.js";
import { backfill } from "./backfill.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const TEMPLATES = resolve(__dirname, "../../templates");

export type InstallOpts = {
  force: boolean;
  backfill?: boolean;
  yes?: boolean;
};

export async function install(opts: InstallOpts): Promise<void> {
  const cwd = process.cwd();
  const ws = new Workspace(cwd);
  await ws.init();
  const cfg = await ws.config();
  const wikiRoot = resolve(cwd, cfg.wiki_dir);

  await mkdir(wikiRoot, { recursive: true });
  for (const sub of ["entities", "topics", "decisions", "sessions", "skills"]) {
    await mkdir(join(wikiRoot, sub), { recursive: true });
  }
  await seed(join(TEMPLATES, "wiki/index.md"), join(wikiRoot, "index.md"), opts.force);
  await seed(join(TEMPLATES, "wiki/log.md"), join(wikiRoot, "log.md"), opts.force);

  const hooksDir = join(cwd, ".claude", "hooks");
  await mkdir(hooksDir, { recursive: true });
  await installHook(join(TEMPLATES, "hook.session-end.sh"), join(hooksDir, "session-end"), opts.force);
  await installHook(join(TEMPLATES, "hook.session-start.sh"), join(hooksDir, "session-start"), opts.force);

  console.log("memwiki: installed.");
  console.log(`  wiki:   ${cfg.wiki_dir}/`);
  console.log(`  hooks:  .claude/hooks/session-{start,end}`);
  console.log(`  config: .memwiki/config.json`);
  if (!process.env.OPENROUTER_API_KEY) {
    console.log("");
    console.log("  note: set OPENROUTER_API_KEY to enable ingest.");
  }

  const shouldBackfill = await decideBackfill(opts, cfg.claude_mem_url);
  if (!shouldBackfill) return;

  if (!process.env.OPENROUTER_API_KEY) {
    console.log("");
    console.log("memwiki: skipping backfill — OPENROUTER_API_KEY not set.");
    console.log("  once set, run: memwiki backfill");
    return;
  }

  console.log("");
  console.log("memwiki: starting backfill of existing claude-mem history…");
  await backfill({ yes: true });
}

async function decideBackfill(opts: InstallOpts, url: string): Promise<boolean> {
  if (opts.backfill === true) return true;
  if (opts.backfill === false) return false;

  const client = new ClaudeMemClient(url);
  const health = await client.health().catch(() => null);
  if (!health) {
    console.log("");
    console.log(`memwiki: claude-mem not reachable at ${url} — skipping backfill prompt.`);
    console.log("  when it is running, run: memwiki backfill");
    return false;
  }

  const existing = await client.searchAll(1).catch(() => []);
  if (existing.length === 0) {
    return false;
  }

  const total = (await client.searchAll().catch(() => [])).length;
  console.log("");
  console.log(`memwiki: claude-mem has ${total} existing observation(s) available for backfill.`);

  if (opts.yes) return true;
  if (!process.stdin.isTTY) return false;

  const { createInterface } = await import("node:readline/promises");
  const rl = createInterface({ input: process.stdin, output: process.stderr });
  try {
    const answer = (await rl.question("Backfill them into the wiki now? [y/N] ")).trim().toLowerCase();
    return answer === "y" || answer === "yes";
  } finally {
    rl.close();
  }
}

async function seed(src: string, dest: string, force: boolean): Promise<void> {
  if (existsSync(dest) && !force) return;
  const raw = await readFile(src, "utf8");
  const now = new Date().toISOString();
  await writeFile(dest, raw.replace(/1970-01-01T00:00:00\.000Z/g, now), "utf8");
}

async function installHook(src: string, dest: string, force: boolean): Promise<void> {
  if (existsSync(dest) && !force) return;
  await copyFile(src, dest);
  await chmod(dest, 0o755);
}
