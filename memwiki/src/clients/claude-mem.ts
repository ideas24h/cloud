export type Observation = {
  id: number;
  memory_session_id: string;
  type: string;
  title: string;
  subtitle?: string;
  narrative: string;
  facts?: string[];
  concepts?: string[];
  files_read?: string[];
  files_modified?: string[];
  created_at_epoch: number;
  generated_by_model?: string;
  content_hash?: string;
};

export type SearchHit = {
  id: number;
  title: string;
  subtitle?: string;
  memory_session_id: string;
  created_at_epoch: number;
  score?: number;
};

export class ClaudeMemClient {
  constructor(private baseUrl = "http://127.0.0.1:37777") {}

  async health(): Promise<{ status: string; mcpReady?: boolean }> {
    return this.get("/api/health");
  }

  async search(query: string, limit = 50): Promise<SearchHit[]> {
    const params = new URLSearchParams({ q: query, limit: String(limit) });
    const res = await this.get<{ results?: SearchHit[] } | SearchHit[]>(
      `/api/search?${params}`,
    );
    return Array.isArray(res) ? res : res.results ?? [];
  }

  async timeline(ids: number[]): Promise<SearchHit[]> {
    const params = new URLSearchParams({ ids: ids.join(",") });
    const res = await this.get<{ results?: SearchHit[] } | SearchHit[]>(
      `/api/timeline?${params}`,
    );
    return Array.isArray(res) ? res : res.results ?? [];
  }

  async getObservations(ids: number[]): Promise<Observation[]> {
    const res = await this.post<{ results?: Observation[] } | Observation[]>(
      "/api/get_observations",
      { ids },
    );
    return Array.isArray(res) ? res : res.results ?? [];
  }

  async since(epochMs: number, limit = 200): Promise<SearchHit[]> {
    const hits = await this.search("*", limit);
    return hits.filter((h) => h.created_at_epoch > epochMs);
  }

  private async get<T>(path: string): Promise<T> {
    const r = await fetch(`${this.baseUrl}${path}`);
    if (!r.ok) throw new Error(`claude-mem GET ${path} → ${r.status}`);
    return (await r.json()) as T;
  }

  private async post<T>(path: string, body: unknown): Promise<T> {
    const r = await fetch(`${this.baseUrl}${path}`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!r.ok) throw new Error(`claude-mem POST ${path} → ${r.status}`);
    return (await r.json()) as T;
  }
}
