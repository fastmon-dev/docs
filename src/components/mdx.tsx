import defaultMdxComponents from "fumadocs-ui/mdx";
import type { MDXComponents } from "mdx/types";
import { APIPage } from "@/components/api-page";
import { Changelog, ChangelogEntry } from "@/components/changelog";

export function getMDXComponents(components?: MDXComponents) {
  return {
    ...defaultMdxComponents,
    // fumadocs-openapi 11 emits `OpenAPIPage ?? APIPage` in generated MDX;
    // register both names (same server wrapper) so either resolves.
    APIPage,
    OpenAPIPage: APIPage,
    // Changelog feed (dated entries + area filter).
    Changelog,
    ChangelogEntry,
    ...components,
  } satisfies MDXComponents;
}

export const useMDXComponents = getMDXComponents;

declare global {
  type MDXProvidedComponents = ReturnType<typeof getMDXComponents>;
}
