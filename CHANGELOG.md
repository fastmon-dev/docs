# Changelog

## [Unreleased]

### Fix: Address security advisories surfaced by the new OSV-Scanner CI job

- Bump `next` 16.2.4 → 16.2.6 (and `eslint-config-next` to match) to clear 13 advisories on the next 16.2.4 line, including high-severity Middleware / Proxy bypasses, SSRF via WebSocket upgrades, cache poisoning, and XSS in App Router CSP-nonce + `beforeInteractive` scripts.
- `npm audit fix` picked up `brace-expansion` 5.0.5 → 5.0.6 (transitive via typescript-eslint), fixing GHSA-jxxr-4gwj-5jf2 (DoS via numeric range defeats `max` protection).
- `next` 16.2.6 still pins its bundled `postcss` to exact 8.4.31, which carries GHSA-qx2v-qp2m-jg93 (moderate, XSS via unescaped `</style>` in stringify output). Not reachable in our build: postcss runs at build time on our authored CSS only — MDX code samples are rendered as text by the syntax highlighter, never piped through postcss. Listed in `osv-scanner.toml` with that rationale; re-evaluate when next bumps its pin.

### Change: Align privacy / collection-modes / beacon docs with backend `data_collection.md`

- Retired device-hint fields (`navigator.deviceMemory` / `hardwareConcurrency`, `saveData` flag, `prefers-color-scheme`, `prefers-reduced-motion`) removed from the docs across EN + DE. Tracker no longer reads them (backend migration 030); the EDPB Guidelines 2/2023 broad reading of TDDDG §25(1) access variant made them legal-risky without analytics return.
- Documented the edge-derived `stitch` identifier: `HMAC-SHA256(rotating-24h-salt, IP | UA | collector_hash)` truncated to 128 bits, stored in every mode (incl. `anonymous`) under GDPR Art. 6(1)(f). Privacy posture revised: the "no cross-pageview identifier in anonymous" line is replaced by "bounded-lifetime, forward-secret cross-pageview identifier". Per-site scoping keeps the "no cross-site identifier" property intact.
- Added UTM + click-ID-label campaign attribution (`utm_source` / `utm_medium` / `utm_campaign` / `utm_term` / `utm_content` + `click_id_param`) to the field reference. Tracker stores the platform label only; the click-ID *value* itself is discarded. Customer-obligation entry added to privacy.mdx warning against PII in UTM parameters (the values are not pattern-scrubbed).
- Corrected referrer handling. Tracker pre-sanitizes `r` to origin + pathname; backend classifies into `referrer_source` / `referrer_medium` via the vendored snowplow referer-parser; raw `r` is dropped before any logging path. Bucketed source + medium are stored in all modes; the raw URL is never persisted, in any mode.
- Replaced the stale `?p=` request-flag framing with `window.__fastmon_consent(true|false)` as the CMP integration surface.

### Change: Em-dash reduction across all authored content (EN + DE)

- Em-dashes are a recognizable AI-writing tell. Swept ~770 occurrences out of authored MDX content across both languages. Definition-list bullets (`- **Term** —`, `` `field` — ``) converted to colon. Mid-prose dashes converted to comma / period / semicolon / parentheses depending on clause shape. Headings + frontmatter titles use colons.
- `content/docs/api/` (generated from the backend OpenAPI spec via `scripts/generate-api-docs.mjs`) intentionally untouched: those em-dashes originate in Pydantic field descriptions in the backend and need a fix at the source.

### Add: CI parity with frontend (dependabot + security audit + prettier)

- `.github/dependabot.yml` covers npm, docker (for `.devcontainer/`), and github-actions. Weekly Mon 06:00 UTC; minor+patch npm updates grouped; all github-actions updates grouped; semver-major cooldown 7 days.
- `.github/workflows/security.yml` runs `npm audit --audit-level=high` plus OSV-Scanner on PR + push, with a weekly Mon cron to catch advisories published since the last run. `osv-scanner.toml` at the repo root carries documented per-vuln ignores (currently the next-bundled postcss case above).
- `ci.yml` + `deploy.yml` bumped to `actions/checkout@v6` / `actions/setup-node@v6` / Node 24 (matching the devcontainer Dockerfile, which was already on Node 24).
- Prettier 3.8.3 added as devDep with config mirroring frontend (`semi`, double quotes, 2-space, `printWidth: 100`, LF). New `format` + `format:check` scripts; `format:check` wired into the lint job in CI. `.prettierignore` excludes `content/`, `node_modules`, `.next`, `out`, `public`, `package-lock.json`, `tsconfig.tsbuildinfo`. Existing `src/` + `scripts/` reformatted in this commit so CI starts green.
