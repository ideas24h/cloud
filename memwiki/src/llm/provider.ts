export type ChatMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

export type LLMConfig = {
  apiKey: string;
  model: string;
  baseUrl?: string;
  referer?: string;
  title?: string;
};

export class OpenRouterProvider {
  private baseUrl: string;

  constructor(private cfg: LLMConfig) {
    this.baseUrl = cfg.baseUrl ?? "https://openrouter.ai/api/v1";
  }

  async complete(messages: ChatMessage[], opts: { json?: boolean; temperature?: number } = {}): Promise<string> {
    const r = await fetch(`${this.baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        authorization: `Bearer ${this.cfg.apiKey}`,
        "content-type": "application/json",
        ...(this.cfg.referer ? { "HTTP-Referer": this.cfg.referer } : {}),
        ...(this.cfg.title ? { "X-Title": this.cfg.title } : {}),
      },
      body: JSON.stringify({
        model: this.cfg.model,
        messages,
        temperature: opts.temperature ?? 0.2,
        ...(opts.json ? { response_format: { type: "json_object" } } : {}),
      }),
    });
    if (!r.ok) {
      const body = await r.text();
      throw new Error(`OpenRouter ${r.status}: ${body.slice(0, 400)}`);
    }
    const data = (await r.json()) as {
      choices: { message: { content: string } }[];
    };
    return data.choices[0]?.message?.content ?? "";
  }
}

export function loadProviderFromEnv(model?: string): OpenRouterProvider {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    throw new Error("OPENROUTER_API_KEY not set");
  }
  return new OpenRouterProvider({
    apiKey,
    model: model ?? process.env.MEMWIKI_MODEL ?? "anthropic/claude-sonnet-4.5",
    referer: "https://github.com/thedotmack/memwiki",
    title: "memwiki",
  });
}
