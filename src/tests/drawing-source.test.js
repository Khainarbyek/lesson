import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const globalCss = readFileSync(`${process.cwd()}/src/styles/global.css`, "utf8");

describe("drawing source", () => {
  it("prevents iOS selection gestures on the number tracing board", () => {
    expect(globalCss).toContain("-webkit-user-select: none");
    expect(globalCss).toContain("-webkit-touch-callout: none");
    expect(globalCss).toContain(".trace-number");
    expect(globalCss).toContain(".trace-canvas");
  });
});
