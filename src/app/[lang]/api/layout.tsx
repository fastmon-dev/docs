import type { HTMLAttributes } from "react";
import { Suspense } from "react";
import { getApiTree } from "@/lib/source";
import { DocsLayout } from "fumadocs-ui/layouts/docs";
import { baseOptions } from "@/lib/layout.shared";
import { ApiI18nGuard, EnglishOnlyBanner } from "@/components/api-i18n-guard";

// API section uses its own sidebar tree (only API endpoints + concepts) so the
// docs hierarchy disappears when the user is browsing the API reference. The
// English-only constraint comes from the auto-generated OpenAPI pages — no DE
// translation exists.
export default async function ApiLayout({ children, params }: LayoutProps<"/[lang]/api">) {
  const { lang } = await params;
  const { i18n: _i18n, ...rest } = baseOptions(lang);
  return (
    <DocsLayout
      tree={getApiTree(lang)}
      tabs={[
        { title: lang === "de" ? "Dokumentation" : "Docs", url: `/${lang}` },
        { title: "API Reference", url: "/en/api" },
        { title: "Changelog", url: `/${lang}/changelog` },
      ]}
      // Force-disable the language switcher: fumadocs auto-enables it when
      // multiple locales are registered with RootProvider, even without
      // passing `i18n`. The API tab is English-only.
      i18n={false}
      // Marker used by global.css to unset the article + prose width caps
      // for openapi pages (which set `full: true`). All other layout
      // dimensions match the Docs layout so the sidebar feels identical
      // between tabs.
      // Cast: `data-*` attributes aren't part of HTMLAttributes' static
      // shape in this @types/react version, even though React forwards
      // them at runtime.
      containerProps={{ "data-api-layout": "" } as HTMLAttributes<HTMLDivElement>}
      {...rest}
    >
      <Suspense fallback={null}>
        <ApiI18nGuard />
        <EnglishOnlyBanner />
      </Suspense>
      {children}
    </DocsLayout>
  );
}
