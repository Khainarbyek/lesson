import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const baseLayoutSource = readFileSync(`${process.cwd()}/src/layouts/BaseLayout.astro`, "utf8");
const globalCss = readFileSync(`${process.cwd()}/src/styles/global.css`, "utf8");

describe("build version source", () => {
  it("renders a visible build version from the shared layout", () => {
    expect(baseLayoutSource).toContain("getBuildVersion");
    expect(baseLayoutSource).toContain('aria-label="Build version"');
    expect(baseLayoutSource).toContain("Build {buildVersion}");
    expect(globalCss).toContain(".build-version");
    expect(globalCss).toContain("position: fixed");
  });
});
