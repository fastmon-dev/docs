# fastmon docs

Fumadocs + Next.js static-export docs site. Bilingual EN/DE (`*.mdx` / `*.de.mdx`).
Commands: `make dev`, `make build`, `make test` (typecheck + lint + format + prose).

## Prose rules (every page, both languages)

Our docs are too long. Readers scan for one fact, they do not read. Every edit
must make a page shorter or leave it the same length; never longer without a
matching cut.

Short still means natural. Write the way an experienced colleague explains something
across the desk: complete sentences, plain words, a direct "you". No telegram style,
no headline-speak, no lists of noun stubs. Cut what is redundant, not the verbs and
articles.

**Hard limits**

- Sentence: about 20 words. One fact per sentence.
- Paragraph: three sentences. A fourth sentence starts a new paragraph or a bullet.
- Bullet: one or two sentences. A bullet that needs more is a subsection.
- Page opening: one or two sentences saying what the page covers. Then the content.
  No comparison with other pages, no "short version / long version", no roadmap of
  the page.
- A section on one setting, field, or endpoint: what it does, default, effect when
  on/off, one example. Under about 120 words. Everything else is a link.

**Cut on sight**

- Rationale the reader does not need to act: "because", "so that", "deliberately",
  "the reason is". Keep the rule, drop the justification.
- Editorial and marketing: "sensible", "substantial gain", "worth knowing",
  "privacy minefield", "we didn't build the more", "powerful", "robust", "seamlessly",
  "leverage", "It's worth noting", "Importantly".
- Rhetorical framing: quoted questions the page then answers, metaphors, asides that
  add a second fact in parentheses, "the X underneath everything else".
- Repetition. State a fact once, on the page that owns it, and link from elsewhere.
  Privacy caveats belong on the Privacy page, not repeated per setting.
- Hedged legal or design commentary longer than one sentence. One sentence, then a
  link to the section that owns the topic.
- Em-dashes (—), "not just X, but Y" / "nicht nur X", dashed appositives, trailing
  "…" in lists. `npm run lint:prose` gates the changelog; the rule holds everywhere.

**Prefer structure over prose**

- Settings, fields, presets, headers: a table. Prose only for what a table cannot
  carry.
- Several parallel facts: bullets with the scannable term in bold. Bold that term
  only, never whole clauses.
- Steps: a numbered list.
- Present tense, concrete values (`country = DE`, `sessionStorage._fms`), stable
  anchors on every section the app links to.

**German pages** follow the same limits and are translated sinngemäß, never word for
word: read the English section, understand what it means for the user, then write
that in German the way a German-speaking engineer would say it (see the
`german-tech-docs` skill). Sentence order, sentence count, and idioms may differ
from the English; the facts, the anchors, and the field names may not. Say "du",
use the German terms where they exist (Einstellung, Schwellenwert, Seitenaufruf) and
keep the English ones where the app shows them (Explorer, Web Vitals, Beacon).

## Changelog copy

`content/docs/changelog/index.mdx` + `index.de.mdx`. Draft entries with
`make draft-changelog`, then rewrite into house style; the tool scaffolds, it does not
write final copy. Mirror every entry in both languages.

- A small change: one paragraph, two or three sentences.
- Several distinct facts: one-sentence intro, one bullet per fact with the term in
  bold, closing `Docs: [Page → Section](/en/…)` line when a page covers it.
- Around 700 characters of body: bullet it or cut it. Never one long paragraph.
- One change, one entry. Fold fixes that only make a feature work into that feature's
  entry. Leave out internal or negligible tweaks. When in doubt, fewer entries.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
