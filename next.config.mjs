import { createMDX } from 'fumadocs-mdx/next';

const withMDX = createMDX();

/** @type {import('next').NextConfig} */
const config = {
  // `output: 'export'` enforces strict static-path validation everywhere,
  // including in `next dev`, which makes any navigation to an unknown URL
  // (404s, dead links, in-progress refactors) crash the page. Only enable
  // it for the production build — `npm run build` sets NODE_ENV=production
  // automatically.
  output: process.env.NODE_ENV === 'production' ? 'export' : undefined,
  reactStrictMode: true,
  experimental: {
    // Cap the static-generation workers. Next defaults to cores-1 (11 here),
    // which pins every core for the ~11s generation phase. Measured on a
    // 12-core box: 11 workers → 37s wall, 4 workers → 34s, i.e. no meaningful
    // penalty, because most of the build (the `generate:api` step and the
    // Next compile) doesn't use these workers at all. Keeps the machine
    // usable while a build runs, and behaves on shared CI runners.
    cpus: 4,
  },
};

export default withMDX(config);
