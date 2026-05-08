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
};

export default withMDX(config);
