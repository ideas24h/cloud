import { mkdir, readFile, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { join } from "node:path";

export type State = {
  last_ingested_epoch: number;
  content_hashes: Record<string, string>;
};

export type Config = {
  wiki_dir: string;
  claude_mem_url: string;
  model: string;
  max_observations_per_batch: number;
};

const DEFAULT_CONFIG: Config = {
  wiki_dir: "wiki",
  claude_mem_url: "http://127.0.0.1:37777",
  model: "anthropic/claude-sonnet-4.5",
  max_observations_per_batch: 30,
};

const DEFAULT_STATE: State = {
  last_ingested_epoch: 0,
  content_hashes: {},
};

export class Workspace {
  constructor(public root: string) {}

  get stateDir(): string {
    return join(this.root, ".memwiki");
  }

  get configPath(): string {
    return join(this.stateDir, "config.json");
  }

  get statePath(): string {
    return join(this.stateDir, "state.json");
  }

  get lockPath(): string {
    return join(this.stateDir, ".lock");
  }

  async init(): Promise<void> {
    await mkdir(this.stateDir, { recursive: true });
    if (!existsSync(this.configPath)) {
      await writeFile(this.configPath, JSON.stringify(DEFAULT_CONFIG, null, 2));
    }
    if (!existsSync(this.statePath)) {
      await writeFile(this.statePath, JSON.stringify(DEFAULT_STATE, null, 2));
    }
  }

  async config(): Promise<Config> {
    if (!existsSync(this.configPath)) return DEFAULT_CONFIG;
    const raw = await readFile(this.configPath, "utf8");
    return { ...DEFAULT_CONFIG, ...(JSON.parse(raw) as Partial<Config>) };
  }

  async state(): Promise<State> {
    if (!existsSync(this.statePath)) return DEFAULT_STATE;
    const raw = await readFile(this.statePath, "utf8");
    return { ...DEFAULT_STATE, ...(JSON.parse(raw) as Partial<State>) };
  }

  async saveState(next: State): Promise<void> {
    await mkdir(this.stateDir, { recursive: true });
    await writeFile(this.statePath, JSON.stringify(next, null, 2));
  }
}
