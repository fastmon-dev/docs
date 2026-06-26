"use client";

import { Children, isValidElement, useEffect, useMemo, useState, type ReactNode } from "react";
import { cn } from "@/lib/cn";

// A dated changelog feed with an area filter. Entries are authored as MDX
// <ChangelogEntry> children; this client wrapper derives the set of areas
// present and lets the reader narrow the feed (the Tracker area is documented
// exhaustively, so the filter is the way to read just tracker changes).

export type ChangelogArea = "dashboard" | "api" | "tracker" | "platform";
export type ChangelogType = "new" | "changed" | "fixed" | "removed";

type EntryProps = {
  date: string;
  type: ChangelogType;
  area: ChangelogArea;
  title: string;
  /** Optional explicit anchor; defaults to a slug of the title. */
  id?: string;
  children?: ReactNode;
};

// Labels are resolved per-locale by the page; defaults are English. Authors
// pass `labels` on <Changelog> to translate the chrome (filter + badges)
// without touching the entries.
type Labels = {
  all: string;
  areas: Record<ChangelogArea, string>;
  types: Record<ChangelogType, string>;
  /** Month names, January-first, used for the "Month YYYY" group headings. */
  months: string[];
};

const DEFAULT_LABELS: Labels = {
  all: "All",
  areas: { dashboard: "Dashboard", api: "API", tracker: "Tracker", platform: "Platform" },
  types: { new: "New", changed: "Changed", fixed: "Fixed", removed: "Removed" },
  months: [
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
  ],
};

// "2026-06-25" -> "2026-06"; the id used for the month anchor + sidebar link.
function monthKey(date: string): string {
  return date.slice(0, 7);
}

function monthLabel(key: string, months: string[]): string {
  const [year, month] = key.split("-");
  return `${months[Number(month) - 1] ?? month} ${year}`;
}

const TYPE_STYLES: Record<ChangelogType, string> = {
  new: "bg-emerald-500/12 text-emerald-700 dark:text-emerald-300",
  changed: "bg-sky-500/12 text-sky-700 dark:text-sky-300",
  fixed: "bg-amber-500/12 text-amber-700 dark:text-amber-300",
  removed: "bg-rose-500/12 text-rose-700 dark:text-rose-300",
};

const AREA_ORDER: ChangelogArea[] = ["dashboard", "api", "tracker", "platform"];

function slugify(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export function ChangelogEntry({
  date,
  type,
  area,
  title,
  id,
  children,
  labels,
}: EntryProps & { labels?: Labels }) {
  const l = labels ?? DEFAULT_LABELS;
  const anchor = id ?? slugify(title);
  return (
    <article
      id={anchor}
      className="scroll-mt-24 border-t border-fd-border py-6 first:border-t-0 first:pt-0"
    >
      <div className="mb-2 flex flex-wrap items-center gap-2 text-xs">
        <span className={cn("rounded-full px-2 py-0.5 font-medium", TYPE_STYLES[type])}>
          {l.types[type]}
        </span>
        <span className="rounded-full border border-fd-border px-2 py-0.5 text-fd-muted-foreground">
          {l.areas[area]}
        </span>
        <time className="ml-auto font-mono text-fd-muted-foreground" dateTime={date}>
          {date}
        </time>
      </div>
      <a href={`#${anchor}`} className="group no-underline">
        <h3 className="!mt-0 !mb-2 text-lg font-semibold tracking-tight">
          {title}
          <span className="ml-2 text-fd-muted-foreground opacity-0 transition-opacity group-hover:opacity-100">
            #
          </span>
        </h3>
      </a>
      <div className="text-sm text-fd-muted-foreground [&_a]:text-fd-foreground [&>:first-child]:mt-0 [&>:last-child]:mb-0">
        {children}
      </div>
    </article>
  );
}

export function Changelog({ children, labels }: { children: ReactNode; labels?: Labels }) {
  const l = labels ?? DEFAULT_LABELS;
  const [active, setActive] = useState<ChangelogArea | "all">("all");

  // Keep the filter in sync with the URL hash so the sidebar area links
  // (`/changelog#tracker`) drive the feed. An empty hash (or "#all") resets to
  // all; an unrelated hash (e.g. a per-entry anchor) leaves the filter alone.
  useEffect(() => {
    const apply = () => {
      const h = decodeURIComponent(window.location.hash.replace(/^#/, ""));
      if (h === "" || h === "all") setActive("all");
      else if ((AREA_ORDER as string[]).includes(h)) setActive(h as ChangelogArea);
    };
    apply();
    window.addEventListener("hashchange", apply);
    return () => window.removeEventListener("hashchange", apply);
  }, []);

  const select = (key: ChangelogArea | "all") => {
    setActive(key);
    // Reflect the choice in the URL (shareable) without scrolling the page.
    if (typeof window !== "undefined") {
      history.replaceState(null, "", key === "all" ? window.location.pathname : `#${key}`);
    }
  };

  // Flatten MDX children to the ChangelogEntry elements, dropping whitespace.
  const entries = useMemo(
    () =>
      Children.toArray(children).filter(
        (c): c is React.ReactElement<EntryProps> =>
          isValidElement(c) && "area" in (c.props as object)
      ),
    [children]
  );

  // Only show chips for areas that actually have entries, in a stable order.
  const present = useMemo(() => {
    const counts = new Map<ChangelogArea, number>();
    for (const e of entries) {
      const a = e.props.area;
      counts.set(a, (counts.get(a) ?? 0) + 1);
    }
    return AREA_ORDER.filter((a) => counts.has(a)).map((a) => ({ area: a, count: counts.get(a)! }));
  }, [entries]);

  const visible = active === "all" ? entries : entries.filter((e) => e.props.area === active);

  const chip = (key: ChangelogArea | "all", label: string, count: number) => (
    <button
      key={key}
      type="button"
      aria-pressed={active === key}
      onClick={() => select(key)}
      className={cn(
        "rounded-full border px-3 py-1 text-sm transition-colors",
        active === key
          ? "border-fd-primary bg-fd-primary/10 text-fd-primary"
          : "border-fd-border text-fd-muted-foreground hover:bg-fd-accent"
      )}
    >
      {label}
      <span className="ml-1.5 text-xs opacity-60">{count}</span>
    </button>
  );

  return (
    <div className="not-prose">
      <div className="mb-6 flex flex-wrap gap-2">
        {chip("all", l.all, entries.length)}
        {present.map((p) => chip(p.area, l.areas[p.area], p.count))}
      </div>
      <div>
        {(() => {
          // Insert a month heading (with an anchor id the sidebar links to)
          // before the first visible entry of each month. Entries are authored
          // newest-first, so a simple running key works.
          let lastMonth = "";
          const out: ReactNode[] = [];
          for (const e of visible) {
            const key = monthKey(e.props.date);
            if (key !== lastMonth) {
              lastMonth = key;
              out.push(
                <h2
                  key={`m-${key}`}
                  id={key}
                  className="scroll-mt-24 !mt-10 !mb-4 border-b border-fd-border pb-2 text-sm font-semibold uppercase tracking-wider text-fd-muted-foreground first:!mt-0"
                >
                  {monthLabel(key, l.months)}
                </h2>
              );
            }
            out.push(<ChangelogEntry key={e.props.id ?? e.props.title} {...e.props} labels={l} />);
          }
          return out;
        })()}
      </div>
    </div>
  );
}
