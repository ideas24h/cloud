import { spawn } from "node:child_process";

async function run(cmd: string, args: string[], cwd: string): Promise<{ code: number; stdout: string; stderr: string }> {
  return new Promise((resolvePromise) => {
    const p = spawn(cmd, args, { cwd });
    let stdout = "";
    let stderr = "";
    p.stdout.on("data", (d) => (stdout += d.toString()));
    p.stderr.on("data", (d) => (stderr += d.toString()));
    p.on("close", (code) => resolvePromise({ code: code ?? 0, stdout, stderr }));
  });
}

export async function isGitRepo(cwd: string): Promise<boolean> {
  const r = await run("git", ["rev-parse", "--is-inside-work-tree"], cwd);
  return r.code === 0 && r.stdout.trim() === "true";
}

export async function hasChanges(cwd: string, path: string): Promise<boolean> {
  const r = await run("git", ["status", "--porcelain", "--", path], cwd);
  return r.stdout.trim().length > 0;
}

export async function commitPath(
  cwd: string,
  path: string,
  message: string,
): Promise<{ committed: boolean; sha?: string }> {
  const dirty = await hasChanges(cwd, path);
  if (!dirty) return { committed: false };
  const add = await run("git", ["add", "--", path], cwd);
  if (add.code !== 0) throw new Error(`git add failed: ${add.stderr}`);
  const body = `${message}\n\nAuthored-by: memwiki\n`;
  const commit = await run("git", ["commit", "-m", body, "--", path], cwd);
  if (commit.code !== 0) throw new Error(`git commit failed: ${commit.stderr}`);
  const sha = await run("git", ["rev-parse", "HEAD"], cwd);
  return { committed: true, sha: sha.stdout.trim() };
}
