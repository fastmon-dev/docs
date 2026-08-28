import { pageMetadata, source } from "@/lib/source";
import { DocsBody, DocsDescription, DocsPage, DocsTitle } from "fumadocs-ui/layouts/docs/page";
import { PageActions } from "@/components/page-actions";
import { notFound } from "next/navigation";
import { getMDXComponents } from "@/components/mdx";
import type { Metadata } from "next";
import { createRelativeLink } from "fumadocs-ui/mdx";

export default async function Page(props: PageProps<"/[lang]/changelog">) {
  const params = await props.params;
  const page = source.getPage(["changelog"], params.lang);
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

export async function generateMetadata(props: PageProps<"/[lang]/changelog">): Promise<Metadata> {
  const params = await props.params;
  const page = source.getPage(["changelog"], params.lang);
  if (!page) notFound();

  return pageMetadata(page);
}
