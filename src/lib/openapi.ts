import { createOpenAPI } from 'fumadocs-openapi/server';

// Reads the OpenAPI snapshot written by `npm run generate:api`. The
// generation script is the single point that talks to the backend; the
// runtime (Next.js build / SSG) only ever reads the local snapshot, so
// builds are reproducible and don't need network access at SSG time.
//
// Path is relative to the cwd at build time (docs/).
export const openapi = createOpenAPI({
  input: ['./.fastmon-openapi.json'],
});
