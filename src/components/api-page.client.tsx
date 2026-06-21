"use client";
import { createOpenAPIPage } from "fumadocs-openapi/ui";
import { defaultShikiFactory } from "fumadocs-core/highlight/shiki/full";
import { createCodeUsageGeneratorRegistry } from "fumadocs-openapi/requests/generators";
import { registerDefault } from "fumadocs-openapi/requests/generators/all";

// fumadocs-openapi 11 renders the operation UI as a client component, so the
// page factory and all of its render callbacks live in this `"use client"`
// module. The server wrapper in `api-page.tsx` only resolves the OpenAPI
// document and feeds it in as the serializable `payload` prop.

// Multi-language code samples (curl, JavaScript, Python, Go, Java, C#).
// Without this registry, the right-hand "API example" panel renders empty.
const codeUsages = createCodeUsageGeneratorRegistry();
registerDefault(codeUsages);

export const OpenAPIPage = createOpenAPIPage({
  // Code highlighter — needed for both schema TypeScript definitions and the
  // language-tab samples on the right side of every operation.
  shiki: defaultShikiFactory,
  shikiOptions: {
    themes: {
      light: "github-light",
      dark: "github-dark",
    },
  },
  codeUsages,
  // Render the full response schema, not just an example payload.
  showResponseSchema: true,
  // Drop the auto-generated "TypeScript Definitions" card. It only ever covers
  // one language and adds a heavy nested card around the response schema —
  // the schema itself (data*, meta*, …) already documents the response and
  // language-specific code samples live in the right-hand `apiExample` panel.
  generateTypeScriptDefinitions: false,
  // Two-column layout (Bunny / Stripe-style):
  //   Left:  header + description + auth + params + body + response schemas
  //   Right: URL bar + try-it playground + code examples + response samples
  // Right column uses a `clamp(...)` basis so it scales with viewport (rough
  // 45% of container, capped at 640px so it doesn't dwarf the description on
  // ultrawide screens, with a 420px floor so cURL snippets don't truncate
  // again on smaller laptops). `min-w-0` on both children lets long code
  // blocks scroll/wrap rather than pushing siblings off-screen.
  content: {
    renderOperationLayout: (slots) => (
      <div className="flex flex-col gap-x-6 gap-y-2 @4xl:flex-row @4xl:items-start">
        <div className="min-w-0 flex-1 [&>*]:my-0 [&>*+*]:mt-6">
          {slots.header}
          {slots.description}
          {slots.authSchemes}
          {slots.parameters}
          {slots.body}
          {slots.responses}
          {slots.callbacks}
        </div>
        <div className="@4xl:sticky @4xl:top-[calc(var(--fd-docs-row-1,2rem)+1rem)] @4xl:basis-[clamp(420px,45%,640px)] @4xl:shrink-0 min-w-0 flex flex-col gap-3">
          {slots.apiPlayground}
          {slots.apiExample}
        </div>
      </div>
    ),
  },
  // Native fumadocs playground (inline, design-system aware). The previous
  // Scalar-modal wrapper is gone — Scalar's modal couldn't be themed
  // consistently with the docs and shipped its own opinionated chrome.
  playground: { enabled: true },
  // Scope the playground's localStorage state so it doesn't collide with any
  // other Fumadocs-OpenAPI instance on the same domain. (In v10 this lived in
  // a separate `defineClientConfig`; v11 folds it into the page options.)
  storageKeyPrefix: "fastmon-api-",
});
