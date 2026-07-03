import { existsSync, writeFileSync, unlinkSync } from "node:fs";
import { buildDeps, ingestBatch } from "./ingest.js";

export type BackfillOpts = {
  since?: number;
  batchSize?: number;
  maxBatches?: number;
  dryRun?: boolean;
  verbose?: boolean;
  yes?: boolean;
};

export async function backfill(opts: BackfillOpts = {}): Promise<void> {
  const cwd = process.cwd();
  const { deps, client } = await buildDeps(cwd);

  if (existsSync(deps.ws.lockPath)) {
    console.error(`memwiki: lockfile present at ${deps.ws.lockPath}; another ingest is running.`);
    process.exit(2);
  }

  const health = await client.health().catch(() => null);
  if (!health) {
    console.error("memwiki: claude-mem not reachable");
    process.exit(3);
  }

  const cfg = await deps.ws.config();
  const batchSize = opts.batchSize ?? cfg.max_observations_per_batch;
  const state = await deps.ws.state();
  const since = opts.since ?? 0;

  const all = await client.searchAll();
  const pending = all.filter((h) => h.created_at_epoch > since);
  if (pending.length === 0) {
    console.log(`memwiki: nothing to backfill (cursor=${since}, total=${all.length}).`);
    return;
  }

  console.log(
    `memwiki: backfilling ${pending.length} observations in batches of ${batchSize}` +
      (since > 0 ? ` since ${new Date(since).toISOString()}` : "") +
      (opts.dryRun ? " (dry-run)" : "") +
      ".",
  );

  if (!opts.yes && !opts.dryRun) {
    const proceed = await confirm(`Proceed? [y/N] `);
    if (!proceed) {
      console.log("memwiki: backfill aborted.");
      return;
    }
  }

  if (!opts.dryRun) writeFileSync(deps.ws.lockPath, String(process.pid));

  try {
    const totalBatches = Math.ceil(pending.length / batchSize);
    const capBatches = opts.maxBatches ?? totalBatches;
    let processed = 0;
    let pagesWritten = 0;
    let cursor = since;

    for (let i = 0; i < Math.min(totalBatches, capBatches); i++) {
      const slice = pending.slice(i * batchSize, (i + 1) * batchSize);
      const obs = await client.getObservations(slice.map((h) => h.id));
      const label = `backfill ${i + 1}/${Math.min(totalBatches, capBatches)} (${obs.length} obs)`;
      console.log(`memwiki: ${label}`);

      const result = await ingestBatch(obs, deps, {
        dryRun: opts.dryRun,
        verbose: opts.verbose,
        commit: !opts.dryRun,
        commitMessage: `memwiki: ${label}`,
      });
      pagesWritten += result.pagesWritten;
      processed += obs.length;
      cursor = Math.max(cursor, result.maxEpoch);

      if (!opts.dryRun) {
        await deps.ws.saveState({ ...state, last_ingested_epoch: cursor });
      }
    }

    console.log(
      `memwiki: backfill done — processed ${processed}/${pending.length} observations → ${pagesWritten} page write(s).`,
    );
  } finally {
    if (!opts.dryRun && existsSync(deps.ws.lockPath)) unlinkSync(deps.ws.lockPath);
  }
}

async function confirm(question: string): Promise<boolean> {
  if (!process.stdin.isTTY) return false;
  const { createInterface } = await import("node:readline/promises");
  const rl = createInterface({ input: process.stdin, output: process.stderr });
  try {
    const answer = (await rl.question(question)).trim().toLowerCase();
    return answer === "y" || answer === "yes";
  } finally {
    rl.close();
  }
}
