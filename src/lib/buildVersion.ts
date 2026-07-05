import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";

type PackageJson = {
  version?: string;
};

function getPackageVersion() {
  try {
    const packageJson = JSON.parse(readFileSync(new URL("../../package.json", import.meta.url), "utf8")) as PackageJson;
    return packageJson.version ?? "0.0.0";
  } catch {
    return "0.0.0";
  }
}

function getGitCommitCount() {
  try {
    const output = execFileSync("git", ["rev-list", "--count", "HEAD"], {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"]
    }).trim();

    return /^\d+$/.test(output) ? output : null;
  } catch {
    return null;
  }
}

export function getBuildVersion() {
  return getGitCommitCount() ?? `v${getPackageVersion()}`;
}
