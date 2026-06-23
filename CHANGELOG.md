# Changelog

## [Unreleased]

### Fix: Override `@babel/core` to clear OSV advisory GHSA-4x5r-pxfx-6jf8

- `@babel/core` 7.29.0 → 7.29.7 via `overrides` (CVSS 3.2, low; dev-only transitive dep through `eslint-config-next` → `eslint-plugin-react-hooks`). Babel only compiles our own source at build time, so it isn't reachable, but the override keeps the OSV-Scanner CI job green and resolves rather than suppresses. `npm audit` reports 0 vulnerabilities.

### Change: Sync docs with backend `visitors` rename + frontend filter bar / command palette (EN + DE)

Code-verified against backend `2026.6.45` and frontend `2026.6.11`. Scope was P0 (contradictions) + P1 (new features); OAuth app-login held back (see below).

- **`sessions` metric → `visitors` + identity (P0).** The backend replaced the `sessions` analytics metric with `visitors` counted along an identity axis: `stitch` (edge-derived, present in every mode including `anonymous`, the default) or `session` (consent-gated `session_id`). The reporting default is the site's new `preferred_identity` (default `stitch`), clamped to what the site collects.
  - `concepts/sessions.mdx` retitled to "Visitors and sessions" and reframed around the visitor/identity model (slug kept to preserve inbound links + nav). Field table rebuilt against `VisitorSummaryItem` (`id`, `identity`, `started_at`, `ended_at`, `duration_ms`, `page_count`, `country`, `browser`, `device_type`, `os`, `avg_lcp`, `avg_fcp`, `total_errors`). Per-visitor replay is documented as consent-gated to `identity=session` (explicit `stitch` → `422`).
  - `analytics.mdx`: "Sessions" section → "Visitors"; "sessions affected" → "visitors affected"; corrected the now-false "explorer stays empty by design" claim for `anonymous` sites (they count `stitch` visitors). `install/verify.mdx`, `privacy.mdx`, and `glossary.mdx` had their vocabulary aligned; glossary gains a **Visitor** entry.
  - `guides/notification-rules.mdx`: added the `visitors` metric (count-only) and the optional per-rule `identity`.
  - `concepts/sites.mdx`: added the `preferred_identity` field.
  - The per-endpoint `api/analytics/*` pages pick this up automatically (prod OpenAPI now serves `/analytics/visitors{,/detail}`; the `sessions` endpoints are gone).
- **Tag filtering claim corrected (P0).** The frontend removed the sidebar per-site tag filter (it never affected analytics). `concepts/sites.mdx` + `glossary.mdx` now describe tags as labels for organizing sites, with a cross-site analytics-by-tag scope noted as planned, not live.
- **Auth: removed the false single-token / roadmap claim (P0).** `api/authentication.mdx` no longer asserts "at most one active token at a time" or "multi-token on the enterprise roadmap." OAuth app-login + per-user `app_tokens` are **not** documented yet: those endpoints aren't in the production OpenAPI spec and the flow still carries a "remove before production" wildcard `redirect_uri`. Revisit once it ships.
- **New features documented (P1).** The ad-hoc filter bar and the `Cmd`/`Ctrl`+`K` command palette (`analytics.mdx`), and the Fetch/XHR + `Server-Timing` telemetry surface (`analytics.mdx` + `concepts/beacon.mdx`, including the `fetch_xhr_update` lifecycle and the `fetch_xhr_enabled` per-site toggle).
- **DE copy-edit.** Fixed four German grammar slips in the synced pages: `concepts/sessions.de.mdx` (the non-word "heraussingelt" → "herausgreift"; a number-agreement slip and a copula mismatch in the "common surprises" and "related" lists) and `concepts/sites.de.mdx` (the Denglisch "geclamped" → "begrenzt").

### Change: Dependency updates + fumadocs-openapi 10 → 11 migration

- **Routine bumps:** `fumadocs-core`/`fumadocs-ui` 16.9.3 → 16.10.2, `fumadocs-mdx` 15.0.11 → 15.0.12, `next` (+ `eslint-config-next`) 16.2.7 → 16.2.9, `@tailwindcss/postcss` 4.3.0 → 4.3.1, `prettier` 3.8.3 → 3.8.4.
- **fumadocs-openapi 10.10.3 → 11.0.3 (major, forced by the 16.10 bump).** fumadocs-core 16.10 dropped the `renderTranslation` export that `fumadocs-openapi` 10 imports, so the core/ui bump is only buildable on openapi 11. The v11 API redesign required code changes:
  - `createAPIPage(openapi, …)` → `createOpenAPIPage(…)`. v11 renders the operation UI as a client component, so the page factory and its render callbacks now live in `api-page.client.tsx` (`"use client"`); `api-page.tsx` is a thin server wrapper that resolves the bundled document (`openapi.getSchema`) and passes it in as the serializable `payload` prop (v11 no longer bakes the server instance into the factory).
  - `defineClientConfig` removed; its `storageKeyPrefix` folded into the page options.
  - OpenAPI i18n keys re-mapped in `lib/i18n.ts` (short keys like `send`/`query` → English-source-plus-context keys like `"Send(playground)"`); the v10 schema-constraint labels (`schemaMatch`, `schemaMultipleOf`, …) no longer exist and fall back to fumadocs' built-in copy.
  - `mdx.tsx` registers the same wrapper under both `APIPage` and `OpenAPIPage` (v11 emits `OpenAPIPage ?? APIPage` in generated MDX).
  - Tracked `content/docs/api/synthetic/*.mdx` regenerated into the v11 MDX layout format (format-only; operations and titles unchanged, no backend content drift).
- **`eslint` held at 9.39.4.** ESLint 10 currently breaks under `eslint-config-next@16.2.9` — its bundled plugins (`eslint-plugin-import`/`react`/`jsx-a11y`) still cap their peer range at `^9`, and a lint run crashes with `scopeManager.addGlobals is not a function`. Tracked upstream in vercel/next.js [#91710](https://github.com/vercel/next.js/pull/91710) (open, switches to `eslint-plugin-import-x`). Revisit once a v10-capable `eslint-config-next` ships; note ESLint 9.x EOL is 2026-08-06.

### Change: Drop legal claims and statute citations from the privacy/collection-modes pages (EN + DE)

The customer-facing docs now state the facts (storage-free, no cookies, no IP stored, EU-only, no banner needed, `stitch` minimised and switchable off) without arguing the law behind them. Removed every statute reference (TDDDG §25, ePrivacy Art. 5(3), GDPR Art. 6(1)(f)/Art. 4(1)) and legal-conclusion framing (legitimate-interest justification, "strictly necessary", Schrems II, "regulator permits", "GDPR posture"). The detailed legal reasoning lives in the internal `data_collection.md` and the DPA, not on the public page.

### Change: Document the per-site privacy levers and the error-frame fixability rule (EN + DE)

Carried over from backend `data_collection.md` (commit `57a51d6`, "error-frame paths + per-site stitch/session/domain controls").

- **Three new per-site settings documented** across `concepts/sites`, `privacy`, and `collection-modes` (both languages):
  - `store_stitch` (default `true`) — opt-out drops the edge-derived `stitch` in *every* mode, leaving a fully anonymous row at the cost of unique-visitor and session metrics.
  - `store_session` (default `true`) — opt-out makes the served `full`/`consent` bundle skip `sessionStorage` entirely and drops `sid`; full content telemetry, no cross-pageview session id.
  - `enforce_domain_match` (default `false`) — opt-in ingest guard that drops beacons whose reported page-URL host isn't `domain` or a subdomain (label-bounded); documented in `concepts/sites` next to `allowed_origins`.
- **Error-frame fixability rule corrected.** The without-consent wire no longer carries "type + count only": it now also ships every stack-frame's host plus the path + line/column of frames in the customer's own first-party external scripts (the location identifies the bug, not the visitor). Inline and third-party frame detail and the error message stay consent-only. Updated the Errors row in the collection-modes table, the `full` error bullet, the `privacy` "what we collect" entry, and the `beacon` observe table + `errs` field notes.

### Add: Feature pages for Analytics and Synthetic Monitoring (EN + DE)

- New top-level pages `analytics` and `synthetic` in a new "Features" sidebar section, plus landing-page cards in both languages. Both marked Beta (open to all org members), matching the backend/frontend release state.
- Analytics covers the dashboard (live visitors, headline metrics, breakdowns, campaigns, tech panel), Error Analytics (fingerprints, drill-down), the sessions explorer, and per-segment Experience Scores — including the collection-mode caveats (no sessions and no stack traces in `anonymous`).
- Synthetic covers the Commerce-Score-backed Lighthouse + TTFB lab tests: org-level opt-in (owner-only "External measurements", sub-processor note), page sources (manual / auto / one-shot) with per-plan quotas verified against `services/synthetic/constants.py`, schedules (24 h Lighthouse, ~5 min TTFB), cache bypass, lab-vs-field verdicts (≥50-sample guard), and the AI summaries (30/h org rate limit).
- German versions written natively per SKILL.md; UI terms taken from the frontend Lingui catalogs („Auto-Befüllung", „Wiederkehrende Lighthouse-Messung", „Cache umgehen", „Zu diesem Test fragen", „Erfassungsmodus").

### Change: API reference regenerated — synthetic tag added, stale pages dropped

- Regenerated from the production OpenAPI: new `synthetic` tag with 19 endpoint pages; added to the curated sidebar order in `generate-api-docs.mjs`. All other tags were already current.
- `api/index.mdx` endpoint cards: removed the dead Account card (`account` tag no longer exists in the spec), added Synthetic, Members, and Partners.
- Deleted stale route-colliding duplicates `api.mdx` / `concepts.mdx` (+ `.de` variants) — superseded by `api/index.mdx` / `concepts/index.mdx`, and the old `api.mdx` contradicted `api/authentication.mdx` on auth and undercounted the analytics endpoints.

### Fix: Code-verified content audit across all hand-written pages (EN + DE)

- **Notification rules guide rewritten to match the backend.** The documented "regresses against a release" condition type, `min_volume`, and `min_silence_minutes` don't exist (`ConditionType` is `absolute` | `relative_change`; the field is `re_notify_after_seconds`). Now documents the real model: site-or-tag scope, fixed window set (1 h–30 d), derived evaluation cadence (window/5 clamped to 1–15 min), edge-triggered firing with re-notify, and the six real presets. Echoes on the landing page, guides index, and web-vitals overview corrected too.
- **`allowed_origins` semantics corrected** (sites concept + install): empty list = no origin check (not "domain only"); when set, `domain` is *not* implicitly included; mismatches are silently dropped with `204` (not `403`). `collector_endpoint` default is `fastmon.site`, not `fastmon.eu`. Wildcard example removed.
- **Phantom APIs removed from the glossary**: `fastmon:consent` / `fastmon:revoke` events and `__fastmon_disabled` never existed; replaced with the real `window.__fastmon_consent()` and `__FASTMON_SAMPLE_RATE`. Glossary now defines Beacon as the payload and gains a proper Tracker entry (both languages).
- **Copy-pasteable curl fixed**: `POST /v1/account/api-token` → `/v1/account/api-key` (compare-releases, EN + DE).
- **Error-code reference synced with `ErrorCode`**: dropped `audio_quota_exceeded`, added `synthetic_disabled` and `feature_removed`.
- **Multi-beacon reality**: removed the "a single batched POST per page-view" claim from five pages (the tracker is multi-beacon: init/loaded/softnav/hidden/…); install/verify no longer promises non-zero *sessions* on a default (`anonymous`) site.
- Smaller fixes: `sid` is tab-scoped (not "multi-day"); geo is country-only (no "region"); served bundle names are `anonymous.js`/`full.js`; the `full`-mode pick-list no longer tells you to pick `full` when you want the consent gate; the Experience-Score page no longer suggests (non-existent) IP filtering; ~19 links now point at real targets instead of "moved" stubs; DE privacy paragraph re-synced with the current EN framing.

### Fix: Line-by-line language pass over both languages

- **DE** (~70 findings): grammar (congruence, missing commas before infinitive clauses, wrong genitive), translation artifacts („qualifiziert sich als", „unter DSGVO", „Regulatoren", „verhandeln HTTP/1.1"), SKILL.md violations — most commonly the tracker/beacon distinction (10 pages let „der Beacon" act), plus „man"-headings → substantive headings, du-form breaks, Deppenleerzeichen, „…"-quote style unified, der/das Tag and Release genus unified, UI label corrected to „Erfassungsmodus".
- **EN** (~50 findings): the same tracker/beacon subject fix across 8 pages, comma splices, missing serial commas, broken parallelism, garbled sentences ("No `released_at` defaults to…", "static HTML through Next.js"), wrong words ("three thresholds" → ranges, "faster again" → faster still, "counter-party" → counterparty), per-file pageview/page-view normalization, percent style normalized, and the architecture 30-s-buffer vs. flush-every-few-seconds contradiction reconciled (client buffer flushes ~2 s; the ~30 s comes from server-side insert batching).

### Add: Makefile (dev/build/test targets)

- `make dev` runs the Next.js dev server bound to `0.0.0.0` (devcontainer/LAN), mirroring the frontend Makefile. Also: `build`, `start`, `test` (typecheck + lint + format-check), `format`, `format-check`, `generate-api`. Help text as default target.

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
