#!/usr/bin/env node
import { Command } from "commander";
import { install } from "./commands/install.js";
import { ingest } from "./commands/ingest.js";
import { context } from "./commands/context.js";

const program = new Command();

program
  .name("memwiki")
  .description("Curated markdown wiki on top of claude-mem.")
  .version("0.1.0");

program
  .command("install")
  .description("Bootstrap wiki/ and Claude Code hooks in the current repo.")
  .option("--force", "overwrite existing hooks and wiki scaffolding", false)
  .action(async (opts) => {
    await install({ force: opts.force });
  });

program
  .command("ingest")
  .description("Pull new observations from claude-mem and update wiki/.")
  .option("--since <epochMs>", "override the stored cursor")
  .option("--dry-run", "print diffs, don't write or commit", false)
  .option("--verbose", "verbose logging", false)
  .action(async (opts) => {
    await ingest({
      since: opts.since ? Number(opts.since) : undefined,
      dryRun: opts.dryRun,
      verbose: opts.verbose,
    });
  });

program
  .command("context")
  .description("Emit a compact context block (for SessionStart injection).")
  .option("--max-tokens <n>", "soft token cap", "2000")
  .action(async (opts) => {
    await context({ maxTokens: Number(opts.maxTokens) });
  });

program.parseAsync(process.argv).catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
