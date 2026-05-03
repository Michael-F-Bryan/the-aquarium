import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, "..");
const workflowPath = join(root, ".github/workflows/deploy.yml");
const viteConfigPath = join(root, "vite.config.ts");

describe("GitHub Pages deploy workflow contract", () => {
  it("deploys main with pnpm build and official Pages actions", () => {
    expect(existsSync(workflowPath)).toBe(true);
    const yml = readFileSync(workflowPath, "utf8");
    expect(yml).toMatch(/push:\s*\n(?:\s+.*\n)*?\s+branches:\s*\[?\s*['"]?main['"]?\s*\]?/m);
    expect(yml).toContain("pnpm/action-setup@v4");
    expect(yml).toContain("actions/setup-node@v4");
    expect(yml).toContain("pnpm install --frozen-lockfile");
    expect(yml).toContain("pnpm build");
    expect(yml).toContain("actions/upload-pages-artifact");
    expect(yml).toContain("actions/deploy-pages");
    expect(yml).toMatch(/pages:\s*write/m);
    expect(yml).toMatch(/id-token:\s*write/m);
  });

  it("sets Vite base for GitHub Pages project site", () => {
    expect(existsSync(viteConfigPath)).toBe(true);
    const ts = readFileSync(viteConfigPath, "utf8");
    expect(ts).toContain("/the-aquarium/");
  });
});
