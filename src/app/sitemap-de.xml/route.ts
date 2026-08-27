import { urlsetXml, xmlResponse } from "@/lib/sitemap";

/** Every DE page, with its hreflang cluster. */
export const revalidate = false;

export function GET() {
  return xmlResponse(urlsetXml("de"));
}
