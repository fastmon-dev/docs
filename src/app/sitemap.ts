import type { MetadataRoute } from "next";
import { source } from "@/lib/source";
import { i18n } from "@/lib/i18n";

/** XML sitemap for docs.fastmon.eu.
 *
 *  The page set comes from the same fumadocs `source` the routes are generated
 *  from, so a new .mdx file is in the sitemap the moment it is in the nav. The
 *  locale-neutral page id pairs the languages, which is what lets every entry
 *  carry its full hreflang cluster (en + de + x-default).
 *
 *  The bare "/" is deliberately absent: it is a client-side language switch
 *  with no content of its own, and x-default already names the entry point.
 *
 *  Static export writes this to out/sitemap.xml at build time. */
export const revalidate = false;

const SITE = "https://docs.fastmon.eu";
const DEFAULT_LANG = i18n.defaultLanguage;

const absolute = (url: string) => `${SITE}${url}`;

export default function sitemap(): MetadataRoute.Sitemap {
  // Group the pages by their locale-neutral path, so the two languages of one
  // page end up in the same entry instead of two unrelated ones.
  const byPage = new Map<string, Map<string, string>>();

  for (const lang of i18n.languages) {
    for (const page of source.getPages(lang)) {
      const key = page.slugs.join("/");
      const langs = byPage.get(key) ?? new Map<string, string>();
      langs.set(lang, page.url);
      byPage.set(key, langs);
    }
  }

  const entries: MetadataRoute.Sitemap = [];

  for (const langs of byPage.values()) {
    const languages = Object.fromEntries([...langs].map(([lang, url]) => [lang, absolute(url)]));
    const fallback = langs.get(DEFAULT_LANG);
    const alternates = {
      languages: {
        ...languages,
        ...(fallback ? { "x-default": absolute(fallback) } : {}),
      },
    };

    // One <url> per language, each carrying the same alternate cluster. Search
    // engines need the entry for the URL they are looking at, not only for the
    // default language.
    for (const url of langs.values()) {
      entries.push({ url: absolute(url), alternates });
    }
  }

  return entries;
}
