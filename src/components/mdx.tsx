import defaultMdxComponents from "fumadocs-ui/mdx";
import type { MDXComponents } from "mdx/types";
import { APIPage } from "@/components/api-page";

export function getMDXComponents(components?: MDXComponents) {
  return {
    ...defaultMdxComponents,
    // fumadocs-openapi 11 emits `OpenAPIPage ?? APIPage` in generated MDX;
    // register both names (same server wrapper) so either resolves.
    APIPage,
    OpenAPIPage: APIPage,
    ...components,
  } satisfies MDXComponents;
}

export const useMDXComponents = getMDXComponents;

declare global {
  type MDXProvidedComponents = ReturnType<typeof getMDXComponents>;
}
