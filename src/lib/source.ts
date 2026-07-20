import { docs } from "collections/server";
import { loader } from "fumadocs-core/source";
import { docsContentRoute, docsImageRoute, docsRoute } from "./shared";
import { i18n } from "./i18n";
import * as React from "react";

// See https://fumadocs.dev/docs/headless/source-api for more info
export const source = loader({
  baseUrl: docsRoute,
  i18n,
  source: docs.toFumadocsSource(),
  plugins: [],
});

export function getPageImage(page: (typeof source)["$inferPage"]) {
  const segments = [...page.slugs, "image.png"];

  return {
    segments,
    url: `${docsImageRoute}/${segments.join("/")}`,
  };
}

export function getPageMarkdownUrl(page: (typeof source)["$inferPage"]) {
  // Encode the page's locale in the URL so the content route can resolve the
  // right-language source. Without it, the route falls back to the default
  // language and the "copy markdown" button always returns English.
  const locale = (page as { locale?: string }).locale ?? i18n.defaultLanguage;
  const segments = [locale, ...page.slugs, "content.md"];

  return {
    segments,
    url: `${docsContentRoute}/${segments.join("/")}`,
  };
}

// Split the single page-tree into separate views: a Docs view (everything
// except the hoisted sections), an API view (only the API section), and a
// Changelog view (only the changelog section), each hoisted to root. This lets
// the (home), (api), and (changelog) layouts show only their own section in
// the sidebar while the section switcher tab moves the user between them.
// A node "belongs to" a section if it's that section's folder, the
// `---Title---` separator that precedes it, or any nested item under its slug.
function nodeName(node: any): string {
  const n = node?.name;
  if (typeof n === "string") return n;
  // React nodes (translated separators) — fall back to children string.
  return String(n?.props?.children ?? "");
}

// `slug` is the trailing URL segment (e.g. "api", "changelog"); `names` are the
// case-insensitive separator/folder titles across locales (e.g. "api").
function isSectionNode(node: any, slug: string, names: string[]): boolean {
  if (!node) return false;
  if (node.type === "folder") {
    if (node.root === true && String(node.index?.url ?? "").endsWith(`/${slug}`)) return true;
    if (String(node.index?.url ?? node.url ?? "").endsWith(`/${slug}`)) return true;
  }
  if (node.type === "page" && String(node.url ?? "").endsWith(`/${slug}`)) return true;
  // Match by display name (covers separator + folder title in EN/DE).
  return names.includes(nodeName(node).toLowerCase());
}

function isApiNode(node: any): boolean {
  return isSectionNode(node, "api", ["api"]);
}

function isChangelogNode(node: any): boolean {
  return isSectionNode(node, "changelog", ["changelog"]);
}

// Top-level sections that are hoisted into their own route + sidebar tab and
// must therefore be hidden from the main Docs tree.
function isHoistedSection(node: any): boolean {
  return isApiNode(node) || isChangelogNode(node);
}

export function getDocsTree(lang: string) {
  const tree = (source.pageTree as Record<string, any>)[lang];
  return {
    ...tree,
    children: tree.children.filter((c: any) => !isHoistedSection(c)),
  };
}

export function getChangelogTree(lang: string) {
  const tree = (source.pageTree as Record<string, any>)[lang];
  const folder = tree.children.find((c: any) => c?.type === "folder" && isChangelogNode(c));
  if (!folder) return tree;
  return {
    ...tree,
    name: folder.name,
    children: folder.children,
  };
}

// Map page URL → uppercase HTTP method, harvested from `_openapi.method` in
// each generated endpoint's frontmatter. Built lazily once per process.
let methodMap: Map<string, string> | null = null;
function getMethodMap(): Map<string, string> {
  if (methodMap) return methodMap;
  const map = new Map<string, string>();
  for (const lang of i18n.languages) {
    for (const page of source.getPages(lang) ?? []) {
      const method = (page.data as { _openapi?: { method?: string } })?._openapi?.method;
      if (typeof method === "string") map.set(page.url, method.toUpperCase());
    }
  }
  methodMap = map;
  return map;
}

const methodColor: Record<string, string> = {
  GET: "text-emerald-600 dark:text-emerald-400",
  POST: "text-sky-600 dark:text-sky-400",
  PUT: "text-amber-600 dark:text-amber-400",
  PATCH: "text-violet-600 dark:text-violet-400",
  DELETE: "text-rose-600 dark:text-rose-400",
};

function decorateApiNode(node: any, methods: Map<string, string>): any {
  if (!node) return node;
  if (node.type === "page" && typeof node.url === "string") {
    const method = methods.get(node.url);
    if (!method) return node;
    const cls = methodColor[method] ?? "text-fd-muted-foreground";
    // React.createElement(type, props, child1, child2) sets
    // `props.children = [child1, child2]` and runs validateChildKeys against
    // that array — without explicit `key` props, the keyless children
    // surface as a "missing key" warning the moment the result lands inside
    // Next's <Link> via fumadocs' SidebarItem (base.js:153). JSX would emit
    // `jsxs` which skips that validation; createElement does not. Pass keys
    // through props so the array is always considered keyed.
    return {
      ...node,
      name: React.createElement(
        "span",
        { className: "inline-flex items-center gap-2 w-full" },
        React.createElement(
          "span",
          {
            key: "method",
            className: `font-mono text-[9px] font-semibold tracking-wider ${cls} shrink-0 w-10`,
          },
          method
        ),
        React.createElement("span", { key: "name", className: "truncate" }, node.name)
      ),
    };
  }
  if (node.type === "folder" && Array.isArray(node.children)) {
    return {
      ...node,
      children: node.children.map((c: any) => decorateApiNode(c, methods)),
    };
  }
  return node;
}

export function getApiTree(lang: string) {
  const tree = (source.pageTree as Record<string, any>)[lang];
  const apiFolder = tree.children.find((c: any) => c?.type === "folder" && isApiNode(c));
  if (!apiFolder) return tree;
  const methods = getMethodMap();
  return {
    ...tree,
    name: apiFolder.name,
    children: apiFolder.children.map((c: any) => decorateApiNode(c, methods)),
  };
}

// Lazy-loaded OpenAPI spec used to expand <APIPage> JSX into structured
// markdown for the "Copy as Markdown" / LLM endpoints. Pulled from the same
// file the MDX components reference, so output stays in sync with the docs.
let openapiCache: any | null = null;
async function loadOpenAPI(): Promise<any | null> {
  if (openapiCache) return openapiCache;
  try {
    const fs = await import("node:fs/promises");
    const path = await import("node:path");
    const file = path.join(process.cwd(), ".fastmon-openapi.json");
    openapiCache = JSON.parse(await fs.readFile(file, "utf8"));
    return openapiCache;
  } catch {
    return null;
  }
}

function resolveRef(spec: any, ref: string): any {
  if (!ref?.startsWith("#/")) return null;
  const parts = ref.slice(2).split("/");
  let cur: any = spec;
  for (const p of parts) {
    cur = cur?.[decodeURIComponent(p.replace(/~1/g, "/").replace(/~0/g, "~"))];
    if (cur == null) return null;
  }
  return cur;
}

function schemaSummary(schema: any): string {
  if (!schema) return "any";
  if (schema.$ref) return schema.$ref.split("/").pop() ?? "any";
  if (schema.enum) return `enum(${schema.enum.map((v: any) => JSON.stringify(v)).join(" | ")})`;
  if (schema.oneOf || schema.anyOf) {
    const arr = schema.oneOf ?? schema.anyOf;
    return arr.map(schemaSummary).join(" | ");
  }
  if (schema.type === "array") {
    return `array<${schemaSummary(schema.items)}>`;
  }
  const t = schema.type ?? "any";
  const fmt = schema.format ? `, ${schema.format}` : "";
  return `${t}${fmt}`;
}

function renderSchema(schema: any, spec: any, seen: Set<string>, depth = 0, indent = ""): string {
  if (!schema || depth > 4) return "";
  // Resolve $ref, but bail out on cycles.
  if (schema.$ref) {
    if (seen.has(schema.$ref)) return `${indent}- _(recursive: ${schema.$ref.split("/").pop()})_`;
    seen.add(schema.$ref);
    const resolved = resolveRef(spec, schema.$ref);
    const out = renderSchema(resolved, spec, seen, depth, indent);
    seen.delete(schema.$ref);
    return out;
  }
  // Composition: oneOf/anyOf/allOf — for allOf, merge; for one/any, list variants.
  if (schema.allOf?.length) {
    return schema.allOf
      .map((s: any) => renderSchema(s, spec, seen, depth, indent))
      .filter(Boolean)
      .join("\n");
  }
  if (schema.oneOf?.length || schema.anyOf?.length) {
    const arr = schema.oneOf ?? schema.anyOf;
    const lines = [`${indent}- _(${schema.oneOf ? "one of" : "any of"})_`];
    arr.forEach((s: any, i: number) => {
      lines.push(`${indent}  - **Variant ${i + 1}** — ${schemaSummary(s)}`);
      const inner = renderSchema(s, spec, seen, depth + 1, `${indent}    `);
      if (inner) lines.push(inner);
    });
    return lines.join("\n");
  }
  if (schema.type === "object" || schema.properties) {
    const required: string[] = schema.required ?? [];
    const props = schema.properties ?? {};
    const lines: string[] = [];
    for (const [name, propRaw] of Object.entries<any>(props)) {
      const prop: any = propRaw;
      const isReq = required.includes(name);
      const t = schemaSummary(prop);
      const desc = prop.description ? ` — ${String(prop.description).replace(/\n+/g, " ")}` : "";
      const def = prop.default !== undefined ? ` _(default: ${JSON.stringify(prop.default)})_` : "";
      lines.push(`${indent}- \`${name}\` (${t}${isReq ? ", required" : ""})${def}${desc}`);
      // Recurse into nested objects/arrays for one more level of context.
      if (
        prop.type === "object" ||
        prop.properties ||
        prop.$ref ||
        prop.allOf ||
        prop.oneOf ||
        prop.anyOf
      ) {
        const inner = renderSchema(prop, spec, seen, depth + 1, `${indent}  `);
        if (inner) lines.push(inner);
      } else if (prop.type === "array" && prop.items) {
        const itemSummary = schemaSummary(prop.items);
        lines.push(`${indent}  - _(items: ${itemSummary})_`);
        if (prop.items.properties || prop.items.$ref) {
          const inner = renderSchema(prop.items, spec, seen, depth + 1, `${indent}    `);
          if (inner) lines.push(inner);
        }
      }
    }
    return lines.join("\n");
  }
  if (schema.type === "array" && schema.items) {
    const lines: string[] = [`${indent}- _(array of ${schemaSummary(schema.items)})_`];
    if (schema.items.properties || schema.items.$ref) {
      lines.push(renderSchema(schema.items, spec, seen, depth + 1, `${indent}  `));
    }
    return lines.join("\n");
  }
  // Primitive at top level — describe inline.
  if (schema.enum)
    return `${indent}- _enum:_ ${schema.enum.map((v: any) => `\`${JSON.stringify(v)}\``).join(", ")}`;
  return "";
}

function renderMediaTypes(content: any, spec: any): string {
  if (!content) return "";
  const out: string[] = [];
  for (const [mt, body] of Object.entries<any>(content)) {
    out.push(`- _Content-Type:_ \`${mt}\``);
    if (body.schema) {
      const rendered = renderSchema(body.schema, spec, new Set(), 0, "  ");
      if (rendered) out.push(rendered);
    }
    if (body.example !== undefined) {
      out.push("", "```json", JSON.stringify(body.example, null, 2), "```");
    } else if (body.examples) {
      const first = Object.values(body.examples)[0] as any;
      if (first?.value !== undefined) {
        out.push("", "```json", JSON.stringify(first.value, null, 2), "```");
      }
    }
  }
  return out.join("\n");
}

function renderOperationMarkdown(op: any, path: string, method: string, spec: any): string {
  const lines: string[] = [];
  const m = method.toUpperCase();
  lines.push(`## \`${m}\` \`${path}\``);
  if (op?.summary) lines.push("", op.summary);
  if (op?.description && op.description !== op.summary) {
    lines.push("", op.description);
  }

  const params = (op?.parameters ?? []) as any[];
  const groups: Record<string, any[]> = { path: [], query: [], header: [], cookie: [] };
  for (const p of params) {
    if (groups[p.in]) groups[p.in].push(p);
  }
  const renderParams = (label: string, list: any[]) => {
    if (!list.length) return;
    lines.push("", `**${label}**`);
    for (const p of list) {
      const t = p.schema?.type ?? "any";
      const fmt = p.schema?.format ? `, ${p.schema.format}` : "";
      const req = p.required ? ", required" : "";
      const desc = p.description ? ` — ${p.description.replace(/\n+/g, " ")}` : "";
      lines.push(`- \`${p.name}\` (${t}${fmt}${req})${desc}`);
    }
  };
  renderParams("Path parameters", groups.path);
  renderParams("Query parameters", groups.query);
  renderParams("Header parameters", groups.header);
  renderParams("Cookie parameters", groups.cookie);

  const reqBody = op?.requestBody;
  if (reqBody?.content) {
    const mediaTypes = Object.keys(reqBody.content);
    lines.push("", `**Request body**${reqBody.required ? " (required)" : ""}`);
    if (reqBody.description) lines.push("", reqBody.description);
    const rendered = renderMediaTypes(reqBody.content, spec);
    if (rendered) lines.push("", rendered);
    void mediaTypes;
  }

  const responses = op?.responses ?? {};
  const codes = Object.keys(responses);
  if (codes.length) {
    lines.push("", "**Responses**");
    for (const code of codes) {
      const r = responses[code] ?? {};
      const desc = r.description ? ` — ${String(r.description).replace(/\n+/g, " ")}` : "";
      lines.push("", `### \`${code}\`${desc}`);
      if (r.content) {
        const rendered = renderMediaTypes(r.content, spec);
        if (rendered) lines.push("", rendered);
      }
    }
  }

  if (op?.security?.length || op?.["x-fastmon-auth"]) {
    lines.push("", "**Authentication**", "Required — see `Authentication` page.");
  }

  return lines.join("\n");
}

function decodeHtmlEntities(s: string): string {
  return s
    .replace(/&#x([0-9a-fA-F]+);/g, (_m, h) => String.fromCodePoint(parseInt(h, 16)))
    .replace(/&#(\d+);/g, (_m, d) => String.fromCodePoint(parseInt(d, 10)))
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
}

async function expandApiPage(text: string): Promise<string> {
  // Two formats may appear depending on how MDX is serialized:
  //   1. `<APIPage operations={[{...}]} />`            (JSX expression)
  //   2. `<APIPage operations="[{...}]" />`            (HTML-style attribute with
  //      quotes inside the value HTML-encoded as `&#x22;` etc.)
  const re = /<APIPage\b[^>]*?\/>/g;
  if (!re.test(text)) return text;
  re.lastIndex = 0;
  const spec = await loadOpenAPI();
  if (!spec) return text;
  return text.replace(re, (tag) => {
    const decoded = decodeHtmlEntities(tag);
    const m =
      decoded.match(/operations=\{(\[[\s\S]*?\])\}/) ??
      decoded.match(/operations="(\[[\s\S]*?\])"/);
    if (!m) return tag;
    try {
      const ops = JSON.parse(m[1]) as Array<{ path: string; method: string }>;
      return ops
        .map((o) => {
          const op = spec.paths?.[o.path]?.[o.method.toLowerCase()];
          if (!op) return `## \`${o.method.toUpperCase()}\` \`${o.path}\``;
          return renderOperationMarkdown(op, o.path, o.method, spec);
        })
        .join("\n\n");
    } catch {
      return tag;
    }
  });
}

export async function getLLMText(page: (typeof source)["$inferPage"]) {
  const processed = await page.data.getText("processed");
  const expanded = await expandApiPage(processed);

  return `# ${page.data.title} (${page.url})

${expanded}`;
}
