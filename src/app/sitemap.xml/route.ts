import { indexXml, xmlResponse } from "@/lib/sitemap";

/** Sitemap index, mirrors https://fastmon.eu/sitemap.xml. */
export const revalidate = false;

export function GET() {
  return xmlResponse(indexXml());
}
