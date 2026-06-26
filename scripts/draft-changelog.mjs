// Drafts changelog entries from the source repos so the editorial step is
// "review + rewrite", not "go spelunking through git".
//
// It gathers, classifies, and SCAFFOLDS — it never writes into the changelog.
// You paste the entries it prints into `content/docs/changelog/index.mdx`
// (newest first) and mirror them in `index.de.mdx`, rewriting the dev-facing
// source text into user-facing copy.
//
// Sources (configured in `scripts/changelog-sources.json`, overridable by flag):
//   • backend / frontend  — the `## [version] - date` sections of each repo's
//     CHANGELOG.md newer than the last-covered version. Internal categories
//     (Chore/CI/build/refactor/test/docs) are dropped.
//   • tracker             — EVERY commit touching the tracker paths in the
//     backend repo since the last-covered backend version (the tracker is
//     documented exhaustively).
//   • OpenAPI             — endpoints added/removed/changed between the
//     committed snapshot and the live (or a given) spec.
//
// Run:   node scripts/draft-changelog.mjs [options]
//   --backend <path>        backend repo path (default from state file)
//   --frontend <path>       frontend repo path
//   --since-backend <ver>   only versions newer than this (default from state)
//   --since-frontend <ver>
//   --openapi-file <path>   diff against a local spec instead of fetching
//   --no-openapi            skip the OpenAPI diff
//   --with-de               also print DE skeletons (body left as TODO)
//   --out <file>            write the report to a file instead of stdout

import { execFileSync } from "node:child_process";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, "..");

// ---------------------------------------------------------------------------
// args + config
// ---------------------------------------------------------------------------
function parseArgs(argv) {
  const out = { flags: new Set() };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--no-openapi" || a === "--with-de") out.flags.add(a);
    else if (a.startsWith("--")) out[a.slice(2)] = argv[++i];
  }
  return out;
}
const args = parseArgs(process.argv.slice(2));

const stateFile = resolve(here, "changelog-sources.json");
const state = existsSync(stateFile) ? JSON.parse(readFileSync(stateFile, "utf8")) : {};

const cfg = {
  backend: {
    repo: resolve(root, args.backend ?? state.backend?.repo ?? "../backend"),
    since: args["since-backend"] ?? state.backend?.since,
  },
  frontend: {
    repo: resolve(root, args.frontend ?? state.frontend?.repo ?? "../frontend"),
    since: args["since-frontend"] ?? state.frontend?.since,
  },
  trackerPaths: state.tracker?.paths ?? ["tracker", "app/templates/source"],
  openapi: {
    url: state.openapi?.url ?? "https://api.fastmon.eu/v1/openapi.json",
    snapshot: resolve(root, state.openapi?.snapshot ?? ".fastmon-openapi.json"),
  },
};

const MONTHS_EN = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];
const MONTHS_DE = [
  "Januar",
  "Februar",
  "März",
  "April",
  "Mai",
  "Juni",
  "Juli",
  "August",
  "September",
  "Oktober",
  "November",
  "Dezember",
];

// ---------------------------------------------------------------------------
// helpers
// ---------------------------------------------------------------------------
function git(repo, gitArgs) {
  return execFileSync("git", ["-C", repo, ...gitArgs], {
    encoding: "utf8",
    maxBuffer: 64 * 1024 * 1024,
  });
}
function isRepo(repo) {
  try {
    git(repo, ["rev-parse", "--git-dir"]);
    return true;
  } catch {
    return false;
  }
}
// "2026.6.56" -> [2026,6,56]; compares numerically, shorter is smaller.
function cmpVersion(a, b) {
  const pa = a.split(".").map(Number);
  const pb = b.split(".").map(Number);
  for (let i = 0; i < Math.max(pa.length, pb.length); i++) {
    const d = (pa[i] ?? 0) - (pb[i] ?? 0);
    if (d) return d;
  }
  return 0;
}

// Category word (first word of a `### …` heading) -> entry type, or null to skip.
function classify(category) {
  const c = category.toLowerCase();
  if (["add", "added", "feature", "feat", "new"].includes(c)) return "new";
  if (["change", "changed", "improve", "improved", "update", "harden", "security"].includes(c))
    return "changed";
  if (["fix", "fixed", "bugfix"].includes(c)) return "fixed";
  if (["remove", "removed", "deprecate", "deprecated", "drop"].includes(c)) return "removed";
  return null; // chore, ci, build, refactor, test, docs, style, perf, deps, …
}

// Best-effort area guess; the editor confirms it.
function guessArea(repoKind, text) {
  const t = text.toLowerCase();
  const platform =
    /(passkey|webauthn|login|sign-?in|2fa|totp|oauth|consent|account|password|partner|organi[sz]ation|\bteam\b|billing|invite|admin|tracker setup|cross-domain)/;
  const api =
    /(\/analytics|endpoint|openapi|schema|\bfield\b|\bcolumn\b|api reference|response|request body|operationid|payload)/;
  if (repoKind === "backend") {
    if (platform.test(t)) return "platform";
    if (api.test(t)) return "api";
    return "platform";
  }
  // frontend
  if (platform.test(t)) return "platform";
  return "dashboard";
}

// ---------------------------------------------------------------------------
// source: a repo's CHANGELOG.md
// ---------------------------------------------------------------------------
function parseChangelog(repoKind, repoPath, since) {
  const file = resolve(repoPath, "CHANGELOG.md");
  if (!existsSync(file)) return { entries: [], latest: null };
  const text = readFileSync(file, "utf8");
  const lines = text.split("\n");

  const versionRe = /^##\s+\[(?<ver>[^\]]+)\]\s*(?:-\s*(?<date>\d{4}-\d{2}-\d{2}))?/;
  const headingRe = /^###\s+(?<cat>\w+)\b[\s—:–-]+(?<title>.+?)\s*$/;

  const entries = [];
  let latest = null;
  let cur = null; // {ver, date}
  let section = null; // {type, area, title, body[]}

  const flushSection = () => {
    if (cur && section && section.type && cur.date) {
      entries.push({
        date: cur.date,
        version: cur.ver,
        type: section.type,
        area: section.area,
        title: section.title,
        body: section.body.join("\n").trim(),
        source: `${repoKind} ${cur.ver}`,
      });
    }
    section = null;
  };

  for (const line of lines) {
    const vm = line.match(versionRe);
    if (vm) {
      flushSection();
      const ver = vm.groups.ver;
      if (/^\d+(\.\d+)+$/.test(ver)) {
        if (!latest || cmpVersion(ver, latest) > 0) latest = ver;
        // Skip versions already covered.
        cur = since && cmpVersion(ver, since) <= 0 ? null : { ver, date: vm.groups.date };
      } else {
        cur = null; // [Unreleased] etc.
      }
      continue;
    }
    if (!cur) continue;
    const hm = line.match(headingRe);
    if (hm) {
      flushSection();
      const type = classify(hm.groups.cat);
      section = type ? { type, area: null, title: hm.groups.title.trim(), body: [] } : null;
      continue;
    }
    if (section) section.body.push(line);
  }
  flushSection();

  for (const e of entries) e.area = guessArea(repoKind, `${e.title}\n${e.body}`);
  return { entries, latest };
}

// ---------------------------------------------------------------------------
// source: tracker commits (exhaustive)
// ---------------------------------------------------------------------------
function trackerEntries(repoPath, since) {
  if (!isRepo(repoPath) || !since) return [];
  const range = `${since}..HEAD`;
  let raw;
  try {
    raw = git(repoPath, [
      "log",
      "--no-merges",
      "--date=short",
      "--format=%ad\t%h\t%s",
      range,
      "--",
      ...cfg.trackerPaths,
    ]);
  } catch {
    return [];
  }
  const prefixRe = /^(?<type>\w+)(?:\([^)]*\))?(?<bang>!)?:\s*(?<desc>.+)$/;
  const map = { feat: "new", fix: "fixed", perf: "changed", revert: "changed" };
  const out = [];
  for (const line of raw.split("\n").filter(Boolean)) {
    const [date, sha, subject] = line.split("\t");
    const pm = subject.match(prefixRe);
    const kind = pm ? pm.groups.type.toLowerCase() : "";
    const type = map[kind] ?? null;
    const desc = pm ? pm.groups.desc : subject;
    out.push({
      date,
      type: type ?? "changed",
      area: "tracker",
      title: desc,
      body: "",
      source: `tracker ${sha}`,
      internal: type === null, // build/chore/refactor rebuilds — likely skippable
    });
  }
  return out;
}

// ---------------------------------------------------------------------------
// source: OpenAPI endpoint diff
// ---------------------------------------------------------------------------
async function openapiDiff() {
  if (args.flags.has("--no-openapi")) return null;
  if (!existsSync(cfg.openapi.snapshot)) return null;
  const oldSpec = JSON.parse(readFileSync(cfg.openapi.snapshot, "utf8"));
  let newSpec;
  if (args["openapi-file"]) {
    newSpec = JSON.parse(readFileSync(resolve(root, args["openapi-file"]), "utf8"));
  } else {
    try {
      const res = await fetch(cfg.openapi.url);
      if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
      newSpec = await res.json();
    } catch (e) {
      return { error: String(e.message ?? e) };
    }
  }
  // A structural signature per operation: parameter names, request-body media
  // types, and response codes. Deliberately ignores descriptions/summaries and
  // key ordering so prose-only edits don't show up as "changed".
  const sig = (op) => {
    const params = (op.parameters ?? [])
      .map((p) => `${p.in}:${p.name}${p.required ? "*" : ""}`)
      .sort();
    const body = op.requestBody
      ? Object.keys(op.requestBody.content ?? {})
          .sort()
          .join(",")
      : "";
    const responses = Object.keys(op.responses ?? {})
      .sort()
      .join(",");
    return JSON.stringify({ id: op.operationId ?? null, params, body, responses });
  };
  const ops = (spec) => {
    const m = new Map();
    for (const [p, item] of Object.entries(spec.paths ?? {})) {
      for (const method of Object.keys(item)) {
        if (["get", "post", "put", "patch", "delete"].includes(method)) {
          m.set(`${method.toUpperCase()} ${p}`, sig(item[method]));
        }
      }
    }
    return m;
  };
  const a = ops(oldSpec);
  const b = ops(newSpec);
  const added = [...b.keys()].filter((k) => !a.has(k));
  const removed = [...a.keys()].filter((k) => !b.has(k));
  const changed = [...b.keys()].filter((k) => a.has(k) && a.get(k) !== b.get(k));
  return {
    added,
    removed,
    changed,
    oldVersion: oldSpec.info?.version,
    newVersion: newSpec.info?.version,
  };
}

// ---------------------------------------------------------------------------
// rendering
// ---------------------------------------------------------------------------
function renderEntry(e) {
  const note = e.internal ? " (likely internal — confirm or drop)" : "";
  const body = e.body ? `\n${e.body}\n` : "\nTODO: describe the user-facing change.\n";
  return (
    `--- [${e.source}${note} · area guess: ${e.area}] ---\n` +
    `<ChangelogEntry date="${e.date}" type="${e.type}" area="${e.area}" title="${e.title.replace(/"/g, "'")}">\n` +
    body +
    `</ChangelogEntry>\n`
  );
}
function renderDeSkeleton(e) {
  return (
    `<ChangelogEntry date="${e.date}" type="${e.type}" area="${e.area}" title="TODO: ${e.title.replace(/"/g, "'")}">\n\n` +
    `TODO: Übersetzung.\n\n` +
    `</ChangelogEntry>\n`
  );
}

// ---------------------------------------------------------------------------
// main
// ---------------------------------------------------------------------------
const lines = [];
const log = (s = "") => lines.push(s);

const be = isRepo(cfg.backend.repo)
  ? parseChangelog("backend", cfg.backend.repo, cfg.backend.since)
  : { entries: [], latest: null };
const fe = isRepo(cfg.frontend.repo)
  ? parseChangelog("frontend", cfg.frontend.repo, cfg.frontend.since)
  : { entries: [], latest: null };
const tracker = trackerEntries(cfg.backend.repo, cfg.backend.since);
const api = await openapiDiff();

const product = [...be.entries, ...fe.entries].sort((x, y) => y.date.localeCompare(x.date));
const trackerSorted = [...tracker].sort((x, y) => y.date.localeCompare(x.date));

log("=== DRAFT CHANGELOG ENTRIES ===");
log(
  `backend ${cfg.backend.since ?? "?"} → ${be.latest ?? "?"}  ·  frontend ${cfg.frontend.since ?? "?"} → ${fe.latest ?? "?"}`
);
if (!isRepo(cfg.backend.repo)) log(`(! backend repo not found at ${cfg.backend.repo})`);
if (!isRepo(cfg.frontend.repo)) log(`(! frontend repo not found at ${cfg.frontend.repo})`);
log("Review each, rewrite the body for users, fix the area guess, then paste into");
log("content/docs/changelog/index.mdx (newest first) and mirror in index.de.mdx.");
log("");

log(`## Product — dashboard / API / platform (${product.length})`);
log("");
for (const e of product) log(renderEntry(e));

log(`## Tracker — every change (${trackerSorted.length})`);
log("");
if (!trackerSorted.length) log("(none in range)\n");
for (const e of trackerSorted) log(renderEntry(e));

log("## API surface (OpenAPI diff)");
log("");
if (!api) log("(skipped)");
else if (api.error)
  log(`(could not fetch live spec: ${api.error} — re-run with --openapi-file <path>)`);
else {
  log(`snapshot ${api.oldVersion ?? "?"} → live ${api.newVersion ?? "?"}`);
  log(`  added (${api.added.length}):`);
  for (const k of api.added) log(`    + ${k}`);
  log(`  removed (${api.removed.length}):`);
  for (const k of api.removed) log(`    - ${k}`);
  log(`  changed (${api.changed.length}):`);
  for (const k of api.changed) log(`    ~ ${k}`);
  log("  → fold the meaningful ones into the entries above (area=api); regenerate the");
  log("    API reference separately with `npm run generate:api`.");
}
log("");

// DE skeletons
if (args.flags.has("--with-de")) {
  log("=== DE SKELETONS (mirror into index.de.mdx) ===");
  log("");
  for (const e of [...product, ...trackerSorted.filter((t) => !t.internal)])
    log(renderDeSkeleton(e));
}

// next steps: new months + state bump
const months = [...new Set([...product, ...trackerSorted].map((e) => e.date.slice(0, 7)))]
  .sort()
  .reverse();
log("=== NEXT STEPS ===");
if (months.length) {
  log("Months in this batch — ensure each has a sidebar link in the changelog meta files:");
  for (const m of months) {
    const [y, mm] = m.split("-");
    log(`  meta.json     "[${MONTHS_EN[Number(mm) - 1]} ${y}](/en/changelog#${m})"`);
    log(`  meta.de.json  "[${MONTHS_DE[Number(mm) - 1]} ${y}](/de/changelog#${m})"`);
  }
}
log("After pasting, update scripts/changelog-sources.json:");
if (be.latest) log(`  backend.since  → ${be.latest}`);
if (fe.latest) log(`  frontend.since → ${fe.latest}`);

const report = lines.join("\n");
if (args.out) {
  writeFileSync(resolve(root, args.out), report);
  console.log(`Wrote draft to ${args.out}`);
} else {
  console.log(report);
}
