import { getDocsTree } from "@/lib/source";
import { DocsLayout } from "fumadocs-ui/layouts/docs";
import { baseOptions } from "@/lib/layout.shared";

export default async function Layout({ children, params }: LayoutProps<"/[lang]">) {
  const { lang } = await params;
  return (
    <DocsLayout
      tree={getDocsTree(lang)}
      // Three-tab section switcher rendered as a sidebar dropdown
      // (`tabMode: 'auto'` is the default → dropdown above the tree).
      // Docs and Changelog follow the active locale; API is English-only
      // because the auto-generated endpoint pages come from the
      // English OpenAPI document — no DE translation exists.
      tabs={[
        {
          title: lang === "de" ? "Dokumentation" : "Docs",
          url: `/${lang}`,
        },
        {
          title: "API Reference",
          url: "/en/api",
        },
        {
          title: "Changelog",
          url: `/${lang}/changelog`,
        },
      ]}
      {...baseOptions(lang)}
    >
      {children}
    </DocsLayout>
  );
}
