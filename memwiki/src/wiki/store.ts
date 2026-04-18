import { mkdir, readFile, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { dirname, join, relative, resolve } from "node:path";
import YAML from "yaml";

const HUMAN_ZONE = /<!--\s*human:start\s*-->[\s\S]*?<!--\s*human:end\s*-->/g;

export type PageType = "entity" | "topic" | "decision" | "session" | "skill";

export type Frontmatter = {
  id: string;
  type: PageType;
  title: string;
  slug: string;
  aliases?: string[];
  created_at: string;
  updated_at: string;
  sources?: number[];
  authored_by: "human" | "memwiki" | "mixed";
  confidence?: number;
  related?: string[];
  schema_version: number;
  [k: string]: unknown;
};

export type Page = {
  path: string;
  frontmatter: Frontmatter;
  body: string;
};

export class WikiStore {
  constructor(public root: string) {}

  static async open(root: string): Promise<WikiStore> {
    await mkdir(root, { recursive: true });
    return new WikiStore(resolve(root));
  }

  pathFor(type: PageType, slug: string): string {
    const dir = { entity: "entities", topic: "topics", decision: "decisions", session: "sessions", skill: "skills" }[type];
    return join(this.root, dir, `${slug}.md`);
  }

  async read(path: string): Promise<Page | null> {
    const abs = resolve(this.root, path);
    if (!existsSync(abs)) return null;
    const raw = await readFile(abs, "utf8");
    return parsePage(relative(this.root, abs), raw);
  }

  async write(page: Page): Promise<void> {
    const abs = resolve(this.root, page.path);
    await mkdir(dirname(abs), { recursive: true });
    const existing = await this.read(page.path);
    const body = existing ? preserveHumanZones(existing.body, page.body) : page.body;
    await writeFile(abs, serializePage({ ...page, body }), "utf8");
  }

  async appendLog(line: string): Promise<void> {
    const abs = join(this.root, "log.md");
    await mkdir(this.root, { recursive: true });
    const prev = existsSync(abs) ? await readFile(abs, "utf8") : "# log\n\n";
    await writeFile(abs, prev + line + "\n", "utf8");
  }
}

export function parsePage(path: string, raw: string): Page {
  const match = raw.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
  if (!match) {
    throw new Error(`no frontmatter in ${path}`);
  }
  const frontmatter = YAML.parse(match[1]) as Frontmatter;
  return { path, frontmatter, body: match[2] };
}

export function serializePage(page: Page): string {
  const yaml = YAML.stringify(page.frontmatter).trimEnd();
  return `---\n${yaml}\n---\n${page.body.startsWith("\n") ? "" : "\n"}${page.body}`;
}

export function preserveHumanZones(existingBody: string, incomingBody: string): string {
  const zones = existingBody.match(HUMAN_ZONE);
  if (!zones || zones.length === 0) return incomingBody;
  let out = incomingBody;
  if (!HUMAN_ZONE.test(out)) {
    out = out.trimEnd() + "\n\n" + zones.join("\n\n") + "\n";
  }
  return out;
}

export function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}
