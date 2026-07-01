# fastmon docs

Fumadocs + Next.js static-export docs site. Bilingual EN/DE (`*.mdx` / `*.de.mdx`).
Commands: `make dev`, `make build`, `make test` (typecheck + lint + format + prose).

## Changelog copy

The changelog (`content/docs/changelog/index.mdx` + `index.de.mdx`) is user-facing
prose. Draft entries with `make draft-changelog`, then rewrite them into house style
before pasting — the tool scaffolds, it does not write final copy. Mirror every entry
in both languages (write the German natively, see the `german-tech-docs` skill — do
not translate word-for-word).

**Write plainly. Avoid the tells of machine-generated text:**

- **No em-dashes (—).** Use a full stop, a colon, a semicolon, or parentheses.
  This is enforced by `npm run lint:prose` and fails CI.
- **No "not just X, but Y" / "nicht nur X".** State what a thing covers directly:
  "for every metric with thresholds (the Core Web Vitals plus FCP, TTFB, Page Load)",
  not "for every metric with thresholds, not just the Core Web Vitals".
- **No dashed appositives** ("the picker — now shared — greys out…"). Put the aside in
  parentheses or make it its own sentence.
- **No trailing "…" inside lists** ("(LCP, FCP, CLS, …)"). List the items, or stop.
- **Don't over-bold.** Bold the one term a reader scans for, not every clause.
- **Cut throat-clearing** ("It's worth noting that", "Importantly", "seamlessly",
  "powerful", "robust", "leverage"). Say what changed and what it means for the user.

Keep the existing entries as the tone reference: one short paragraph, present tense,
concrete. Entries dated before 2026-06-26 are the good baseline.

**One change, one entry.** Fold bug-fixes that only make a feature work into that
feature's entry. Leave out purely internal or negligible tweaks (the changelog intro
says so). When in doubt, fewer entries.
