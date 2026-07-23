// Fetches the fastmon backend's OpenAPI document, snapshots it locally, and
// generates one MDX page per endpoint via fumadocs-openapi.
//
// Source of truth: production backend. Always.
//
// Run:   npm run generate:api
import { createOpenAPI } from "fumadocs-openapi/server";
import { generateFiles } from "fumadocs-openapi";
import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const selfPath = fileURLToPath(import.meta.url);
const here = path.dirname(selfPath);
const root = path.resolve(here, "..");
const outDir = path.join(root, "content/docs/api");
// Hand-written narrative pages we want to preserve when the script wipes
// the api/ folder. The auto-gen pages go into per-tag subfolders so they
// don't collide with these.
const PRESERVE = new Set([
  "index.mdx",
  "index.de.mdx",
  "meta.json",
  "meta.de.json",
  "authentication.mdx",
  "authentication.de.mdx",
  "errors.mdx",
  "errors.de.mdx",
  "pagination.mdx",
  "pagination.de.mdx",
]);
const snapshot = path.join(root, ".fastmon-openapi.json");

const OPENAPI_URL = "https://api.fastmon.eu/v1/openapi.json";

console.log(`Fetching OpenAPI from ${OPENAPI_URL} ...`);
const res = await fetch(OPENAPI_URL);
if (!res.ok) {
  throw new Error(
    `OpenAPI fetch failed (${res.status} ${res.statusText}). ` +
      `Is the backend reachable at ${OPENAPI_URL}?`
  );
}
const spec = await res.json();

// Tags we deliberately keep out of the public docs for now (e.g. endpoints
// that are still admin-only or not ready to document). Their operations are
// dropped from the spec before anything is generated, so no folder is emitted
// and the sidebar guard stays green without listing them.
const EXCLUDE_TAGS = new Set(["issues"]);
let excludedOps = 0;
for (const [route, methods] of Object.entries(spec.paths || {})) {
  for (const [method, op] of Object.entries(methods || {})) {
    if (op && Array.isArray(op.tags) && op.tags.some((t) => EXCLUDE_TAGS.has(t))) {
      delete methods[method];
      excludedOps++;
    }
  }
  if (!Object.keys(methods).length) delete spec.paths[route];
}
if (spec.tags) spec.tags = spec.tags.filter((t) => !EXCLUDE_TAGS.has(t.name));
if (excludedOps) {
  console.log(`Excluded ${excludedOps} operation(s) for tag(s): ${[...EXCLUDE_TAGS].join(", ")}`);
}

// Normalise the spec so generateFiles doesn't choke.
// FastAPI emits operation-level tags but doesn't always declare them in the
// top-level `tags` array. fumadocs-openapi's `groupBy: 'tag'` requires every
// referenced tag to exist there; otherwise its `fromTagName(...)` returns
// undefined and the run aborts.
const usedTags = new Set();
for (const methods of Object.values(spec.paths || {})) {
  for (const op of Object.values(methods || {})) {
    if (op && Array.isArray(op.tags)) {
      for (const t of op.tags) usedTags.add(t);
    }
  }
}
const declared = new Set((spec.tags || []).map((t) => t.name));
const missing = [...usedTags].filter((t) => !declared.has(t));
if (missing.length) {
  spec.tags = [...(spec.tags || []), ...missing.map((name) => ({ name }))];
  console.log(`Added ${missing.length} undeclared tag(s) to top-level tags: ${missing.join(", ")}`);
}

// Operations with no tags at all end up in a fictional "default" group that
// fumadocs-openapi can't resolve either. Force-tag them with "uncategorized".
for (const methods of Object.values(spec.paths || {})) {
  for (const op of Object.values(methods || {})) {
    if (op && (!Array.isArray(op.tags) || op.tags.length === 0)) {
      op.tags = ["uncategorized"];
    }
  }
}
if (![...usedTags].includes("uncategorized")) {
  if (!spec.tags?.some((t) => t.name === "uncategorized")) {
    spec.tags = [...(spec.tags || []), { name: "uncategorized" }];
  }
}

// MDX interprets bare `<` outside code as JSX, breaking text like "< 10ms"
// or "<= 200ms" inside descriptions. Escape angle brackets that aren't
// already part of a code span or a valid JSX-looking tag.
//
// The conservative rule: outside backticks, replace `<` followed by a
// character that isn't [A-Za-z/!] with `\<`. Same for `>` if preceded by
// a digit/space.
function escapeMdxAngles(str) {
  if (typeof str !== "string") return str;
  let out = "";
  let inCode = false;
  let i = 0;
  while (i < str.length) {
    const c = str[i];
    if (c === "`") {
      // toggle simple inline-code mode (covers `foo` and ``foo``)
      inCode = !inCode;
      out += c;
      i++;
      continue;
    }
    if (!inCode && c === "<") {
      const next = str[i + 1];
      // Allow `</…>`, `<a…>`, `<!…>` to pass; escape everything else.
      if (next && /[A-Za-z/!]/.test(next)) {
        out += c;
      } else {
        out += "\\<";
      }
      i++;
      continue;
    }
    out += c;
    i++;
  }
  return out;
}

function sanitizeDescriptions(node) {
  if (!node || typeof node !== "object") return;
  if (Array.isArray(node)) {
    for (const child of node) sanitizeDescriptions(child);
    return;
  }
  for (const [k, v] of Object.entries(node)) {
    if ((k === "description" || k === "summary") && typeof v === "string") {
      node[k] = escapeMdxAngles(v);
    } else if (v && typeof v === "object") {
      sanitizeDescriptions(v);
    }
  }
}
sanitizeDescriptions(spec);

// Force a sane `servers` list. FastAPI usually emits an empty/relative
// `servers`, which makes the playground send Try-it requests against the
// docs origin (e.g. http://localhost:3000) instead of the real API host.
spec.servers = [{ url: "https://api.fastmon.eu", description: "Production" }];

// Operation-level `security` that references undeclared schemes (FastAPI
// occasionally emits stale "APIKeyHeader" entries on endpoints) breaks the
// playground. Drop bogus per-operation overrides — those endpoints fall back
// to the global `security` (cookieAuth | bearerAuth) which is correct.
spec.components ||= {};
spec.components.securitySchemes ||= {};
const validSchemes = new Set(Object.keys(spec.components.securitySchemes));
let cleaned = 0;
for (const methods of Object.values(spec.paths || {})) {
  for (const op of Object.values(methods || {})) {
    if (!op || typeof op !== "object" || !Array.isArray(op.security)) continue;
    const filtered = op.security.filter((req) =>
      req && typeof req === "object" ? Object.keys(req).every((id) => validSchemes.has(id)) : false
    );
    if (filtered.length !== op.security.length) {
      cleaned += op.security.length - filtered.length;
      if (filtered.length === 0) {
        // No valid override left → unset, fall back to global security.
        delete op.security;
      } else {
        op.security = filtered;
      }
    }
  }
}
if (cleaned) {
  console.log(
    `Stripped ${cleaned} operation-level security entr(y|ies) that referenced undeclared schemes.`
  );
}

await mkdir(path.dirname(snapshot), { recursive: true });
await writeFile(snapshot, JSON.stringify(spec, null, 2));
console.log(`Snapshot written to ${path.relative(root, snapshot)}`);

// Pass the same path token here as the runtime registers in src/lib/openapi.ts.
// generateFiles encodes this string into each MDX page's `<APIPage document=…>`
// prop; at SSG time fumadocs-openapi looks it up by exact match against the
// runtime's input list, so the two have to be identical strings.
const inputPath = "./.fastmon-openapi.json";

const openapi = createOpenAPI({ input: [inputPath] });

// Wipe only the auto-generated tag subfolders, preserve hand-written pages
// at api/ root.
const { readdir, lstat } = await import("node:fs/promises");
const entries = await readdir(outDir).catch(() => []);
for (const name of entries) {
  if (PRESERVE.has(name)) continue;
  const full = path.join(outDir, name);
  const stat = await lstat(full);
  if (stat.isDirectory()) {
    await rm(full, { recursive: true, force: true });
  } else if (!PRESERVE.has(name)) {
    // Drop any stray non-preserved file (old top-level .mdx from previous runs).
    await rm(full, { force: true });
  }
}

await generateFiles({
  input: openapi,
  output: outDir,
  per: "operation",
  groupBy: "tag",
  meta: true,
  includeDescription: true,
  addGeneratedComment: true,
});

// `meta: true` overwrites the api/meta.json with just an alphabetic tag
// list — wiping our hand-curated sidebar (sections + ordered hand-written
// pages). Re-write it after generation.
const apiMeta = {
  title: "API",
  // Intentionally NOT `root: true`. fumadocs treats `root: true` folders as
  // separate tree-roots that aren't part of source.pageTree[lang], which
  // breaks the sidebar tree (api/ disappears) and path-search for tab swap.
  // Keep api/ as a regular nested folder; sidebar shows full structure.
  pages: [
    "index",
    "---Concepts---",
    "authentication",
    "errors",
    "pagination",
    "---Endpoints---",
    // Curated order, not alphabetic: account scope first, then the tracking
    // model (an application owns the embed, its sites are the domains it runs
    // on), then what you read back off it. Kept in sync with the generated tag
    // folders by the guard at the bottom of this script.
    "organizations",
    "members",
    "applications",
    "sites",
    "releases",
    "analytics",
    "synthetic",
    "notifications",
    "partners",
    "collector",
  ],
};
await writeFile(path.join(outDir, "meta.json"), JSON.stringify(apiMeta, null, 2) + "\n");
await writeFile(
  path.join(outDir, "meta.de.json"),
  JSON.stringify(
    {
      ...apiMeta,
      pages: apiMeta.pages.map((p) =>
        p === "---Concepts---" ? "---Konzepte---" : p === "---Endpoints---" ? "---Endpunkte---" : p
      ),
    },
    null,
    2
  ) + "\n"
);

console.log(`Generated MDX into ${path.relative(root, outDir)}`);

// fumadocs-openapi emits the operation description twice: once as MDX prose
// above the `<APIPage>` tag and once again inside the operation if
// `showDescription` is enabled. Default `<APIPage>` does NOT pass
// `showDescription`, so the prose is the only copy — but it renders
// full-width above the 2-column operation layout, which leaves the right
// gutter (cURL/response) empty next to it. Strip the prose and flip
// `showDescription` on so the description sits in the same flex-row as
// the request example column.
const { readdir: rd, lstat: ls } = await import("node:fs/promises");
async function* walkMdx(dir) {
  for (const entry of await rd(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) yield* walkMdx(full);
    else if (entry.isFile() && entry.name.endsWith(".mdx")) yield full;
  }
}
function stripPreamble(text) {
  if (!text.startsWith("---")) return text;
  const fmCloseIdx = text.indexOf("\n---", 3);
  if (fmCloseIdx < 0) return text;
  const headEnd = fmCloseIdx + 4;
  const cut = text[headEnd] === "\n" ? headEnd + 1 : headEnd;
  let body = text.slice(cut);
  const apiTag = body.match(/<APIPage\b[^>]*\/>/);
  if (!apiTag) return text;
  const comment = body.match(/\{\/\*[^*]*generated by Fumadocs[^*]*\*\/\}\s*\n/);
  if (!comment) return text;
  const after = comment.index + comment[0].length;
  const tagAt = body.indexOf(apiTag[0], after);
  body = body.slice(0, after) + "\n" + body.slice(tagAt);
  body = body.replace(/<APIPage\b(?![^>]*\bshowDescription\b)/, "<APIPage showDescription");
  return text.slice(0, cut) + body;
}
let touched = 0;
const TOP_LEVEL_SKIP = PRESERVE; // hand-written narrative pages live here
for await (const file of walkMdx(outDir)) {
  if (path.dirname(file) === outDir && TOP_LEVEL_SKIP.has(path.basename(file))) {
    continue;
  }
  const before = await readFile(file, "utf8");
  const after = stripPreamble(before);
  if (after !== before) {
    await writeFile(file, after);
    touched++;
  }
}
console.log(`Post-processed ${touched} MDX file(s) — description rendered in-layout.`);

/* ---------------------------------------------------------------------------
 * Guard: the hand-curated sidebar above must match the generated tag folders.
 *
 * fumadocs' `pages` list has no rest operator, so anything not listed is
 * excluded from the tree. A new OpenAPI tag therefore generates and builds
 * fine while nothing links to it — the pages are reachable only by guessing
 * the URL. That is how api/applications sat orphaned. A stale entry is the
 * same bug in reverse: the sidebar promises a section the API no longer has.
 *
 * Both are silent, so fail the run rather than warn.
 * ------------------------------------------------------------------------ */
const SEPARATOR = /^---.*---$/;
// Hand-written narrative pages; they have no generated folder by design.
const NARRATIVE = new Set(["index", "authentication", "errors", "pagination"]);

const generatedTags = (await rd(outDir, { withFileTypes: true }))
  .filter((e) => e.isDirectory())
  .map((e) => e.name)
  .sort();
const listedTags = apiMeta.pages.filter((p) => !SEPARATOR.test(p) && !NARRATIVE.has(p));

const orphaned = generatedTags.filter((t) => !listedTags.includes(t));
const stale = listedTags.filter((t) => !generatedTags.includes(t));

if (orphaned.length || stale.length) {
  console.error("\nSidebar is out of sync with the generated API tags.\n");
  if (orphaned.length) {
    console.error(
      `  Generated but not in the sidebar (unreachable pages): ${orphaned.join(", ")}\n` +
        `  Add them to apiMeta.pages in ${path.relative(root, selfPath)}.\n`
    );
  }
  if (stale.length) {
    console.error(
      `  In the sidebar but no longer generated: ${stale.join(", ")}\n` +
        `  The API dropped these tags. Remove them from apiMeta.pages.\n`
    );
  }
  process.exit(1);
}
console.log(`Sidebar covers all ${generatedTags.length} generated tag(s).`);
