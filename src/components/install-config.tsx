"use client";

import { useEffect, useLayoutEffect, useState, useSyncExternalStore } from "react";
import { usePathname } from "next/navigation";
import { SlidersHorizontal } from "lucide-react";
import { DynamicCodeBlock } from "fumadocs-ui/components/dynamic-codeblock";
import { cn } from "@/lib/cn";

/* ---------------------------------------------------------------------------
 * Shared install config: source/collector hash, collector mode, 1P/3P.
 *
 * The app deep-links here with the real values so every snippet on the page is
 * copy-paste ready instead of showing `{source_hash}` placeholders. The query
 * keys are spelled out rather than abbreviated, so a link is readable on its
 * own:
 *
 *   ?source_hash=…&collector_hash=…&collector_mode=…&collector_host=…&party=…
 *
 * Readers who arrive without params can type their own values into the panel.
 *
 * State lives in a module-level store rather than React context: MDX renders
 * <InstallConfigPanel> and each <InstallSnippet> as unrelated siblings, so
 * there is no common provider to hang a context on. `useSyncExternalStore`
 * gives every instance the same snapshot and re-renders them together.
 * ------------------------------------------------------------------------ */

export type CollectorMode = "default" | "relative" | "custom";
/** Whether the collector shares the page's registrable domain. The app knows
 *  the site's domain and works this out for us; the docs can't derive it. */
export type CollectorParty = "first" | "third";

export interface InstallConfig {
  sourceHash: string;
  collectorHash: string;
  mode: CollectorMode;
  /** Custom collector host (no protocol); only meaningful for mode="custom". */
  host: string;
  /** Passed by the app; "" when it couldn't be determined (e.g. a custom
   *  collector on a multi-domain application). */
  party: CollectorParty | "";
}

const FASTMON_COLLECTOR = "https://fastmon.site";
const STORAGE_KEY = "fastmon-install-config";
const EMPTY: InstallConfig = {
  sourceHash: "",
  collectorHash: "",
  mode: "default",
  host: "",
  party: "",
};

let state: InstallConfig = EMPTY;
const listeners = new Set<() => void>();

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}
const getSnapshot = () => state;
// SSR renders placeholders, so hydration can't mismatch; the URL/localStorage
// read happens in a layout effect right after, before the browser paints.
const getServerSnapshot = () => EMPTY;

function isParty(v: string | null): v is CollectorParty {
  return v === "first" || v === "third";
}

export function setInstallConfig(patch: Partial<InstallConfig>) {
  state = { ...state, ...patch };
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    /* private mode / storage disabled — in-memory state still works */
  }
  listeners.forEach((l) => l());
}

let initialized = false;
function initFromEnvironment() {
  if (initialized) return;
  initialized = true;

  // A copy, never EMPTY itself: the URL params below are assigned in place, and
  // aliasing the module constant would both corrupt it and make the
  // change-detection below compare `state` against itself.
  let next: InstallConfig = { ...EMPTY };
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored) next = { ...next, ...(JSON.parse(stored) as Partial<InstallConfig>) };
  } catch {
    /* ignore unreadable/corrupt storage */
  }

  // URL params win over stored values — a fresh deep link from the app should
  // always show that application's hashes.
  const params = new URLSearchParams(window.location.search);
  for (const field of FIELDS) {
    const raw = params.get(field.param)?.trim();
    if (!raw) continue;
    // A select only accepts one of its own values; anything else is a stale or
    // hand-edited link and would put the config into a state the UI can't show.
    if (field.input === "select" && !field.options.some((o) => o.value === raw)) continue;
    // The registry guarantees key/value agree; TS can't see that through the union.
    (next as Record<EditableKey, string>)[field.key] = raw;
  }
  const party = params.get("party");
  if (isParty(party)) next.party = party;

  if (JSON.stringify(next) !== JSON.stringify(state)) setInstallConfig(next);
}

// Layout effects run after DOM mutation but *before* the browser paints, so the
// values from the URL are already in place on the first frame — no flash of
// `{source_hash}` placeholders at the top of the page. Falls back to useEffect
// during prerender, where layout effects don't run (and would warn).
const useIsomorphicLayoutEffect = typeof window === "undefined" ? useEffect : useLayoutEffect;

export function useInstallConfig(): InstallConfig {
  const config = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  useIsomorphicLayoutEffect(() => {
    initFromEnvironment();
  }, []);
  return config;
}

/** Base URL the snippets load from. "" for relative (same-origin /s/ and /c/). */
export function snippetBase(config: InstallConfig): string {
  if (config.mode === "relative") return "";
  if (config.mode === "custom") {
    const host = config.host
      .trim()
      .replace(/^https?:\/\//i, "")
      .replace(/\/+$/, "");
    return host ? `https://${host}` : "https://your-collector.example.com";
  }
  return FASTMON_COLLECTOR;
}

const sourceOf = (c: InstallConfig) => c.sourceHash.trim() || "{source_hash}";
const collectorOf = (c: InstallConfig) => c.collectorHash.trim() || "{collector_hash}";

/* --------------------------------- i18n --------------------------------- */

const STRINGS = {
  en: {
    title: "Your snippet",
    intro:
      "Opened from the app, these are filled in with your application's real values. Otherwise, paste them here and every snippet on this page updates.",
    sourceHash: "Source hash",
    collectorHash: "Collector hash",
    mode: "Collector",
    modeDefault: "fastmon (default)",
    modeRelative: "Same-origin (relative)",
    modeCustom: "Custom domain",
    host: "Collector domain",
    partyFirst: "First-party",
    partyThird: "Third-party",
    partyFirstHint:
      "Script and beacons come from your own domain, so content blockers treat them like your own resources.",
    partyThirdHint:
      "Script and beacons come from another domain, so a strict content blocker can block them and undercount visits.",
    whereFrom: "Find both hashes in the app under Applications → ··· → IDs & hashes.",
    launcher: "Your install values",
    close: "Close",
  },
  de: {
    title: "Dein Snippet",
    intro:
      "Aus der App geöffnet stehen hier die echten Werte deiner Application. Sonst trage sie hier ein, dann aktualisieren sich alle Snippets auf dieser Seite.",
    sourceHash: "Source-Hash",
    collectorHash: "Collector-Hash",
    mode: "Collector",
    modeDefault: "fastmon (Standard)",
    modeRelative: "Gleiche Origin (relativ)",
    modeCustom: "Eigene Domain",
    host: "Collector-Domain",
    partyFirst: "First-Party",
    partyThird: "Third-Party",
    partyFirstHint:
      "Script und Beacons kommen von deiner eigenen Domain, Content-Blocker behandeln sie also wie deine eigenen Ressourcen.",
    partyThirdHint:
      "Script und Beacons kommen von einer anderen Domain, ein strikter Content-Blocker kann sie also blockieren und Besuche untererfassen.",
    whereFrom: "Beide Hashes findest du in der App unter Applications → ··· → IDs & Hashes.",
    launcher: "Deine Install-Werte",
    close: "Schließen",
  },
} as const;

function useStrings() {
  const pathname = usePathname();
  return pathname?.startsWith("/de") ? STRINGS.de : STRINGS.en;
}

/* ----------------------------- field registry ---------------------------- */

/**
 * The editable fields, described once. Reading them from the URL and rendering
 * the panel both derive from this list, so adding a value means adding an entry
 * here plus its label in STRINGS (and the key on InstallConfig/EMPTY) rather
 * than touching the parser and the form separately.
 *
 * `party` is deliberately absent: the app computes it and the docs only display
 * it, so it is not an input.
 */
type LabelKey = keyof (typeof STRINGS)["en"];
/** Fields the panel can edit; `party` is display-only. */
type EditableKey = "sourceHash" | "collectorHash" | "mode" | "host";

interface FieldBase {
  key: EditableKey;
  /** Query-string key the app deep-links with. */
  param: string;
  label: LabelKey;
  /** Hide until the rest of the config makes this field meaningful. */
  when?: (config: InstallConfig) => boolean;
}
type Field =
  | (FieldBase & { input: "text"; placeholder: string })
  | (FieldBase & { input: "select"; options: readonly { value: string; label: LabelKey }[] });

const FIELDS: readonly Field[] = [
  {
    key: "sourceHash",
    param: "source_hash",
    label: "sourceHash",
    input: "text",
    placeholder: "{source_hash}",
  },
  {
    key: "collectorHash",
    param: "collector_hash",
    label: "collectorHash",
    input: "text",
    placeholder: "{collector_hash}",
  },
  {
    key: "mode",
    param: "collector_mode",
    label: "mode",
    input: "select",
    options: [
      { value: "default", label: "modeDefault" },
      { value: "relative", label: "modeRelative" },
      { value: "custom", label: "modeCustom" },
    ],
  },
  {
    key: "host",
    param: "collector_host",
    label: "host",
    input: "text",
    placeholder: "metrics.example.com",
    when: (config) => config.mode === "custom",
  },
];

/* ------------------------------- snippets ------------------------------- */

export type SnippetKind =
  "script" | "noscript" | "bootstrap" | "consent" | "nginx" | "verify-beacon";

// Shiki grammar per snippet, so each block is highlighted like the rest of the
// docs. Lazy-loaded by fumadocs' highlighter; all of these ship with shiki.
const SNIPPET_LANG: Record<SnippetKind, string> = {
  script: "html",
  noscript: "html",
  bootstrap: "html",
  consent: "js",
  nginx: "nginx",
  "verify-beacon": "http",
};

export function snippetFor(kind: SnippetKind, config: InstallConfig): string {
  const base = snippetBase(config);
  switch (kind) {
    case "script":
      return `<script defer src="${base}/s/${sourceOf(config)}.js"></script>`;
    case "noscript":
      return `<noscript><img src="${base}/c/${collectorOf(config)}.gif" alt="" width="1" height="1" referrerpolicy="no-referrer-when-downgrade" /></noscript>`;
    case "bootstrap":
      return `<script>
  window.__fastmon = window.__fastmon || { q: [] };
  (function (q) {
    function h(k) {
      return function (e) {
        q.push([k, e, Date.now()]);
      };
    }
    addEventListener("error", h("e"), true);
    addEventListener("unhandledrejection", h("r"));
  })(window.__fastmon.q);
</script>`;
    case "consent":
      return `// In your cookie banner's "Accept" callback, and on every page load
// while consent is granted (most consent managers do this for you):
window.fastmon && window.fastmon.grantConsent && window.fastmon.grantConsent();`;
    case "nginx": {
      const host = FASTMON_COLLECTOR.replace(/^https?:\/\//, "");
      return `location ~ ^/(s|c)/ {
    proxy_pass ${FASTMON_COLLECTOR};
    proxy_set_header Host ${host};
    proxy_set_header X-Forwarded-For $remote_addr;
}`;
    }
    // What the reader should find in DevTools → Network, not something to copy.
    case "verify-beacon":
      return `POST ${base}/c/${collectorOf(config)}     204`;
  }
}

/* ------------------------------ inline values ---------------------------- */

/** A single resolved value for use mid-sentence, where a whole snippet would
 *  be too much. Falls back to the `{source_hash}` style placeholders, so a
 *  reader who arrives without a deep link sees exactly what they saw before. */
export type InstallValueOf = "script-url" | "collector-url" | "source-hash" | "collector-hash";

export function installValue(of: InstallValueOf, config: InstallConfig): string {
  const base = snippetBase(config);
  switch (of) {
    case "script-url":
      return `${base}/s/${sourceOf(config)}.js`;
    case "collector-url":
      return `${base}/c/${collectorOf(config)}`;
    case "source-hash":
      return sourceOf(config);
    case "collector-hash":
      return collectorOf(config);
  }
}

/** Inline `<code>` carrying the reader's own value. Use in prose; for a whole
 *  block use <InstallSnippet>. */
export function InstallValue({ of }: { of: InstallValueOf }) {
  const config = useInstallConfig();
  return <code>{installValue(of, config)}</code>;
}

/**
 * A copy-paste ready snippet, rendered with the current hashes/collector.
 * Uses fumadocs' DynamicCodeBlock so it gets the same Shiki highlighting, copy
 * button and theming as the static ```code``` fences elsewhere in the docs, and
 * re-highlights whenever the config panel changes the values.
 */
export function InstallSnippet({ kind }: { kind: SnippetKind }) {
  const config = useInstallConfig();
  const code = snippetFor(kind, config);
  return (
    <div className="my-4">
      <DynamicCodeBlock lang={SNIPPET_LANG[kind]} code={code} />
    </div>
  );
}

/* --------------------------------- panel -------------------------------- */

const inputClass =
  "w-full rounded-md border border-fd-border bg-fd-card px-2.5 py-1.5 font-mono text-[13px] text-fd-foreground outline-none focus:border-fd-primary";
const labelClass = "mb-1 block text-xs font-medium text-fd-muted-foreground";

/** Editable panel that drives every <InstallSnippet> on the page. */
export function InstallConfigPanel() {
  const config = useInstallConfig();
  const s = useStrings();

  return (
    <div className="my-6 rounded-lg border border-fd-border bg-fd-card p-4">
      <p className="text-sm font-semibold text-fd-foreground">{s.title}</p>
      <p className="mt-1 text-xs text-fd-muted-foreground">{s.intro}</p>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        {FIELDS.filter((field) => field.when?.(config) ?? true).map((field) => {
          const id = `fm-${field.param}`;
          // The registry pairs each key with a string value; the union hides that.
          const value = (config as Record<EditableKey, string>)[field.key];
          const onChange = (v: string) =>
            setInstallConfig({ [field.key]: v } as Partial<InstallConfig>);

          return (
            <div key={field.key}>
              <label className={labelClass} htmlFor={id}>
                {s[field.label]}
              </label>
              {field.input === "select" ? (
                <select
                  id={id}
                  className={cn(inputClass, "font-sans")}
                  value={value}
                  onChange={(e) => onChange(e.target.value)}
                >
                  {field.options.map((option) => (
                    <option key={option.value} value={option.value}>
                      {s[option.label]}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  id={id}
                  className={inputClass}
                  value={value}
                  onChange={(e) => onChange(e.target.value)}
                  placeholder={field.placeholder}
                  spellCheck={false}
                />
              )}
            </div>
          );
        })}
      </div>

      {config.party && (
        <p className="mt-3 flex flex-wrap items-center gap-2 text-xs text-fd-muted-foreground">
          <span
            className={cn(
              "rounded-full border px-2 py-0.5 font-medium",
              config.party === "first"
                ? "border-green-500/30 bg-green-500/10 text-green-700 dark:text-green-400"
                : "border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-400"
            )}
          >
            {config.party === "first" ? s.partyFirst : s.partyThird}
          </span>
          <span>{config.party === "first" ? s.partyFirstHint : s.partyThirdHint}</span>
        </p>
      )}

      <p className="mt-3 text-xs text-fd-muted-foreground">{s.whereFrom}</p>
    </div>
  );
}

/* ------------------------------ sidebar launcher ------------------------- */

/**
 * Sidebar-footer entry that opens the config in a dialog. The values apply to
 * every page that renders <InstallSnippet> / <InstallValue>, so the control to
 * change them has to be reachable from every page too, not just the install
 * guide that happens to embed the panel.
 */
export function InstallConfigLauncher() {
  const config = useInstallConfig();
  const s = useStrings();
  const [open, setOpen] = useState(false);
  const hasValues = Boolean(config.sourceHash.trim() || config.collectorHash.trim());

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="mt-2 inline-flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-start text-xs text-fd-muted-foreground transition-colors hover:bg-fd-accent hover:text-fd-accent-foreground"
      >
        <SlidersHorizontal className="size-4 shrink-0" />
        <span className="truncate">{s.launcher}</span>
        {hasValues && (
          <span className="ms-auto size-1.5 shrink-0 rounded-full bg-fd-primary" aria-hidden />
        )}
      </button>

      {open && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={s.title}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
        >
          {/* A real button, so dismissing by backdrop is keyboard- and
              screen-reader-reachable rather than a click-only <div>. */}
          <button
            type="button"
            aria-label={s.close}
            onClick={() => setOpen(false)}
            className="absolute inset-0 cursor-default bg-black/50"
          />
          <div className="relative z-10 max-h-[85vh] w-full max-w-2xl overflow-y-auto rounded-lg bg-fd-popover p-4 shadow-lg">
            <InstallConfigPanel />
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="mt-2 w-full rounded-md border border-fd-border px-3 py-1.5 text-sm text-fd-muted-foreground transition-colors hover:text-fd-foreground"
            >
              {s.close}
            </button>
          </div>
        </div>
      )}
    </>
  );
}
