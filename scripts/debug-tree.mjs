// Dump the page tree shape so we can see if root: true propagates.
import { promises as fs } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { loader } from "fumadocs-core/source";

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, "..");
const docsDir = path.join(root, "content/docs");

// Walk content/docs and reconstruct a minimal source for fumadocs-core/loader.
async function walk(dir, base = "") {
  const out = [];
  for (const entry of await fs.readdir(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    const rel = base ? `${base}/${entry.name}` : entry.name;
    if (entry.isDirectory()) {
      out.push(...(await walk(full, rel)));
    } else if (entry.name.endsWith(".mdx")) {
      out.push({ type: "page", path: rel, data: { title: entry.name } });
    } else if (entry.name === "meta.json" || entry.name === "meta.de.json") {
      const content = JSON.parse(await fs.readFile(full, "utf8"));
      out.push({ type: "meta", path: rel, data: content });
    }
  }
  return out;
}

const files = await walk(docsDir);
const source = loader({
  source: {
    files,
  },
  baseUrl: "/",
  i18n: { defaultLanguage: "en", languages: ["en", "de"], hideLocale: "never" },
});

function summarize(node, depth = 0) {
  const pad = "  ".repeat(depth);
  const kind = node.type ?? "tree";
  const flag = node.root ? " [ROOT]" : "";
  const url = node.url ? ` url=${node.url}` : "";
  const name = node.name ?? "<root>";
  console.log(`${pad}${kind} ${name}${flag}${url}`);
  if (depth < 4 && Array.isArray(node.children)) {
    for (const c of node.children) summarize(c, depth + 1);
  }
}

console.log("=== en tree ===");
summarize(source.pageTree.en);
