import { pageMetadata, source } from "@/lib/source";
import { DocsBody, DocsDescription, DocsPage, DocsTitle } from "fumadocs-ui/layouts/docs/page";
import { PageActions } from "@/components/page-actions";
import { notFound } from "next/navigation";
import { getMDXComponents } from "@/components/mdx";
import type { Metadata } from "next";
import { createRelativeLink } from "fumadocs-ui/mdx";

export default async function Page(props: PageProps<"/[lang]/api/[...slug]">) {
  const params = await props.params;
  const page = source.getPage(["api", ...params.slug], params.lang);
  if (!page) notFound();

  const MDX = page.data.body;

  return (
    <DocsPage toc={page.data.toc} full={page.data.full}>
      <DocsTitle>{page.data.title}</DocsTitle>
      <DocsDescription className="mb-0">{page.data.description}</DocsDescription>
      <PageActions page={page} lang={params.lang} />
      <DocsBody>
        <MDX
          components={getMDXComponents({
            a: createRelativeLink(source, page),
          })}
        />
      </DocsBody>
    </DocsPage>
  );
}

export async function generateStaticParams() {
  return source
    .generateParams("slug", "lang")
    .filter((p) => Array.isArray(p.slug) && p.slug[0] === "api" && p.slug.length > 1)
    .map((p) => ({ ...p, slug: (p.slug as string[]).slice(1) }));
}

export async function generateMetadata(
  props: PageProps<"/[lang]/api/[...slug]">
): Promise<Metadata> {
  const params = await props.params;
  const page = source.getPage(["api", ...params.slug], params.lang);
  if (!page) notFound();

  return pageMetadata(page);
}
