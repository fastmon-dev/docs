import { getLLMText, getPageMarkdownUrl, source } from '@/lib/source';
import { i18n } from '@/lib/i18n';
import { notFound } from 'next/navigation';

export const revalidate = false;

export async function GET(_req: Request, { params }: RouteContext<'/llms.mdx/docs/[[...slug]]'>) {
  const { slug } = await params;
  // segments = [locale, ...pageSlug, "content.md"] (see getPageMarkdownUrl)
  const segments = slug ?? [];
  const lang = segments[0];
  if (!lang || !i18n.languages.includes(lang)) notFound();
  const page = source.getPage(segments.slice(1, -1), lang);
  if (!page) notFound();

  return new Response(await getLLMText(page), {
    headers: {
      'Content-Type': 'text/markdown',
    },
  });
}

export function generateStaticParams() {
  // One content route per (language, page) so both EN and DE resolve correctly.
  return i18n.languages.flatMap((lang) =>
    source.getPages(lang).map((page) => ({
      slug: getPageMarkdownUrl(page).segments,
    }))
  );
}
