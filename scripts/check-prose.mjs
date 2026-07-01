// Fails CI when banned punctuation sneaks into the changelog copy.
//
// The changelog is user-facing prose, and our house style bans a few mechanical
// tells of machine-generated writing (see CLAUDE.md, "Changelog copy"). Only
// crisp, false-positive-free rules live here so the check stays trustworthy;
// the judgement calls ("not just X", over-bolding, throat-clearing) are guidance
// for the writing step in CLAUDE.md, not a gate. Run:  npm run lint:prose
//
// Scope is deliberately just the changelog; em-dashes are fine elsewhere.

import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const files = ["content/docs/changelog/index.mdx", "content/docs/changelog/index.de.mdx"];

// Hard errors: mechanical, never a false positive.
const banned = [
  { re: /—/g, msg: "em-dash (—): rewrite as two sentences, a colon, a semicolon, or parentheses" },
  {
    re: /,\s*…\s*\)/g,
    msg: "trailing “, …)” list ellipsis: finish the list or drop the last item",
  },
  { re: / -- /g, msg: "spaced double hyphen: use a colon or parentheses" },
];

let errors = 0;

for (const rel of files) {
  const text = readFileSync(resolve(root, rel), "utf8");
  const lines = text.split("\n");
  lines.forEach((line, i) => {
    for (const { re, msg } of banned) {
      re.lastIndex = 0;
      if (re.test(line)) {
        console.error(`✖ ${rel}:${i + 1}  ${msg}\n    ${line.trim()}`);
        errors++;
      }
    }
  });
}

if (errors) {
  console.error(`\n${errors} error(s). Changelog prose style: see CLAUDE.md.`);
  process.exit(1);
}
console.log("Changelog prose OK.");
