import { source } from "./source";
import { i18n } from "./i18n";

/** Sitemap generation, same shape as the marketing site (fastmon.eu):
 *
 *    /sitemap.xml     sitemap index, points at the two language files
 *    /sitemap-en.xml  every English page
 *    /sitemap-de.xml  every German page
 *
 *  The page set comes from the same fumadocs `source` the routes are generated
 *  from, so a new .mdx file is in the sitemap the moment it is in the nav. The
 *  locale-neutral page id pairs the languages, which is what lets every entry
 *  carry its full hreflang cluster (en + de + x-default), in both files.
 *
 *  The bare "/" is deliberately absent: it is a client-side language switch
 *  with no content of its own, and x-default already names the entry point. */

export const SITE = "https://docs.fastmon.eu";

const absolute = (url: string) => `${SITE}${url}`;

/** Locale-neutral page id -> its URL per language. */
function pagesByLanguage(): Map<string, Map<string, string>> {
  const byPage = new Map<string, Map<string, string>>();

  for (const lang of i18n.languages) {
    for (const page of source.getPages(lang)) {
      const key = page.slugs.join("/");
      const langs = byPage.get(key) ?? new Map<string, string>();
      langs.set(lang, page.url);
      byPage.set(key, langs);
    }
  }

  return byPage;
}

/** The <url> entries for one language, each with the full alternate cluster. */
export function urlsetXml(lang: string): string {
  const rows: string[] = [];

  for (const langs of pagesByLanguage().values()) {
    const own = langs.get(lang);
    if (!own) continue;

    const alternates = [...langs].map(
      ([l, url]) => `    <xhtml:link rel="alternate" hreflang="${l}" href="${absolute(url)}"/>`
    );
    const fallback = langs.get(i18n.defaultLanguage);
    if (fallback) {
      alternates.push(
        `    <xhtml:link rel="alternate" hreflang="x-default" href="${absolute(fallback)}"/>`
      );
    }

    rows.push(`  <url>\n    <loc>${absolute(own)}</loc>\n${alternates.join("\n")}\n  </url>`);
  }

  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">',
    ...rows,
    "</urlset>",
    "",
  ].join("\n");
}

/** The index that points at the per-language files. */
export function indexXml(): string {
  const rows = i18n.languages.map(
    (lang) => `  <sitemap><loc>${SITE}/sitemap-${lang}.xml</loc></sitemap>`
  );

  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...rows,
    "</sitemapindex>",
    "",
  ].join("\n");
}

/** Same headers for all three files. */
export const xmlResponse = (body: string) =>
  new Response(body, { headers: { "content-type": "application/xml; charset=utf-8" } });
