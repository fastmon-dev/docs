'use client';
import { defineClientConfig } from 'fumadocs-openapi/ui/client';

export default defineClientConfig({
  // Scope the playground's localStorage state so it doesn't collide with
  // any other Fumadocs-OpenAPI instance on the same domain.
  storageKeyPrefix: 'fastmon-api-',
});
