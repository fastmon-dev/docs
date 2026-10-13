// `npm audit --audit-level=high` with the ignore list of osv-scanner.toml.
// npm audit has no ignore option, so both scanners share that one list.
//
// Run:   node scripts/audit.mjs
import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";

const LEVELS = ["info", "low", "moderate", "high", "critical"];
const MIN_LEVEL = LEVELS.indexOf("high");

const toml = readFileSync(new URL("../osv-scanner.toml", import.meta.url), "utf8");
const ignored = new Set([...toml.matchAll(/^id\s*=\s*"([^"]+)"/gm)].map((m) => m[1]));

const { stdout } = spawnSync("npm", ["audit", "--json"], { encoding: "utf8" });
const report = JSON.parse(stdout);
if (report.error) throw new Error(`npm audit failed: ${report.error.summary}`);

// Advisories sit in `via` as objects; string entries only point at the
// dependency that carries them.
const found = new Map();
for (const vuln of Object.values(report.vulnerabilities ?? {})) {
  for (const via of vuln.via) {
    if (typeof via !== "string") found.set(via.url, via);
  }
}

let failed = 0;
for (const adv of found.values()) {
  if (LEVELS.indexOf(adv.severity) < MIN_LEVEL) continue;
  const id = adv.url.split("/").pop();
  if (ignored.has(id)) {
    console.log(`ignored  ${adv.severity.padEnd(8)} ${adv.name}  ${id}`);
  } else {
    console.log(`FAIL     ${adv.severity.padEnd(8)} ${adv.name}  ${id}  ${adv.title}`);
    failed++;
  }
}
console.log(failed ? `${failed} unignored advisory(ies) at high or above.` : "npm audit OK.");
process.exit(failed ? 1 : 0);
