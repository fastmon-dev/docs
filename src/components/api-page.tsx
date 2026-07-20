import { openapi } from "@/lib/openapi";
import type { OperationItem, WebhookItem } from "fumadocs-openapi/ui";
import { OpenAPIPage } from "./api-page.client";

// Props as emitted into the generated MDX by `npm run generate:api`, e.g.
//   <APIPage document={"./.fastmon-openapi.json"} operations={[…]} showDescription />
type APIPageProps = {
  document: string;
  operations?: OperationItem[];
  webhooks?: WebhookItem[];
  showTitle?: boolean;
  showDescription?: boolean;
};

// Server wrapper around the client `OpenAPIPage`. fumadocs-openapi 11 no longer
// bakes the OpenAPI server instance into the page factory, so we resolve the
// bundled document here (at SSG time, from the local snapshot) and hand it to
// the client component as the serializable `payload` prop.
export async function APIPage({ document, ...props }: APIPageProps) {
  const schema = await openapi.getSchema(document);
  return <OpenAPIPage {...props} payload={{ bundled: schema.bundled }} />;
}
