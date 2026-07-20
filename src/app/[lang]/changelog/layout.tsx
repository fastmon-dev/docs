import { getChangelogTree } from "@/lib/source";
import { DocsLayout } from "fumadocs-ui/layouts/docs";
import { InstallConfigLauncher } from "@/components/install-config";
import { baseOptions } from "@/lib/layout.shared";

// Changelog is its own hoisted section (like the API reference) with its own
// sidebar tree, so the full docs hierarchy disappears while browsing release
// notes. Unlike the API section it is fully bilingual — entries are authored
// by hand in EN + DE — so the language switcher stays enabled.
export default async function ChangelogLayout({
  children,
  params,
}: LayoutProps<"/[lang]/changelog">) {
  const { lang } = await params;
  return (
    <DocsLayout
      // The install values apply on every page, so the control that sets
      // them lives in the sidebar footer rather than only in the guide.
      sidebar={{ footer: <InstallConfigLauncher /> }}
      tree={getChangelogTree(lang)}
      // The changelog is a single rolling feed. The sidebar tree is populated
      // (via the section `meta.json`) with "jump to month" anchor links into
      // the feed, so the section switcher dropdown stays consistent with
      // Docs/API and the sidebar is never empty. The in-page chips filter by
      // area; the sidebar covers the time axis.
      tabs={[
        { title: lang === "de" ? "Dokumentation" : "Docs", url: `/${lang}` },
        { title: "API Reference", url: "/en/api" },
        { title: "Changelog", url: `/${lang}/changelog` },
      ]}
      {...baseOptions(lang)}
    >
      {children}
    </DocsLayout>
  );
}
