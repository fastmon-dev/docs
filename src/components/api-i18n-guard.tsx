"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";

// The API reference is English-only (no .de.mdx pendants are generated for
// endpoint pages). When a visitor lands on /de/api/... — typically via a
// stale cross-link from German narrative docs — bounce them to the English
// equivalent and tag the redirect so EnglishOnlyBanner can explain why the
// URL just changed under them.
export function ApiI18nGuard() {
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (!pathname?.startsWith("/de/api")) return;
    const target = pathname.replace(/^\/de\//, "/en/");
    router.replace(`${target}?from=de`);
  }, [pathname, router]);

  return null;
}

export function EnglishOnlyBanner() {
  const sp = useSearchParams();
  if (sp.get("from") !== "de") return null;
  return (
    <div
      role="status"
      className="mb-4 rounded-md border border-fd-border bg-fd-muted px-4 py-3 text-sm text-fd-muted-foreground"
    >
      Die API-Dokumentation pflegen wir nur auf Englisch — du wurdest auf die englische Fassung
      weitergeleitet.
    </div>
  );
}
