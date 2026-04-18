import { mkdir, readFile, writeFile, chmod, copyFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { Workspace } from "../state.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const TEMPLATES = resolve(__dirname, "../../templates");

export async function install(opts: { force: boolean }): Promise<void> {
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
