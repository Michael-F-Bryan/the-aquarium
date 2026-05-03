import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, "..");
const workflowPath = join(root, ".github/workflows/ci.yml");

describe("CI workflow contract", () => {
  it("gates PRs with pnpm install, lint, test, and build", () => {
    expect(existsSync(workflowPath)).toBe(true);
    const yml = readFileSync(workflowPath, "utf8");
    expect(yml).toMatch(/pull_request/);
    expect(yml).toContain("pnpm/action-setup@v4");
    const pkg = JSON.parse(readFileSync(join(root, "package.json"), "utf8")) as {
      packageManager?: string;
    };
    expect(pkg.packageManager).toMatch(/^pnpm@\d+\.\d+\.\d+$/);
    expect(yml).toContain("actions/setup-node@v4");
    expect(yml).toContain('cache: "pnpm"');
    expect(yml).toContain("pnpm install --frozen-lockfile");
    expect(yml).toContain("pnpm lint");
    expect(yml).toContain("pnpm test");
    expect(yml).toContain("pnpm build");
  });
});
