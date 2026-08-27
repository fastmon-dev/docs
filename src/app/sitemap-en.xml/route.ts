import { urlsetXml, xmlResponse } from "@/lib/sitemap";

/** Every EN page, with its hreflang cluster. */
export const revalidate = false;

export function GET() {
  return xmlResponse(urlsetXml("en"));
}
