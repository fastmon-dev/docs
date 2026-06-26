"use client";

import { useEffect } from "react";
import Link from "next/link";

// The bare "/" entry point. Production is a static export (no server to read
// Accept-Language), so language detection happens client-side here: we read the
// browser's preferred languages and replace into /de or /en. Any explicit path
// (/en/…, /de/…) bypasses this page entirely, so only the root is auto-routed.
// Languages mirror src/lib/i18n.ts (kept inline to avoid pulling the i18n-UI
// module into the client bundle).
const SUPPORTED = ["en", "de"];
const DEFAULT = "en";

export default function RootRedirect() {
  useEffect(() => {
    const prefs = navigator.languages?.length ? navigator.languages : [navigator.language];
    const match = prefs
      .map((l) => l.toLowerCase().split("-")[0])
      .find((l) => SUPPORTED.includes(l));
    window.location.replace(`/${match ?? DEFAULT}`);
  }, []);

  // No-JS fallback: meta-refresh to the default language, plus explicit links.
  return (
    <noscript>
      <meta httpEquiv="refresh" content={`0; url=/${DEFAULT}`} />
      <p style={{ fontFamily: "system-ui, sans-serif", padding: "2rem" }}>
        Continue to the documentation: <Link href="/en">English</Link> ·{" "}
        <Link href="/de">Deutsch</Link>
      </p>
    </noscript>
  );
}
