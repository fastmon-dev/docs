# fastmon Docs

Documentation site built with [Fumadocs](https://fumadocs.dev) on Next.js.
Static-export only — no Node runtime in production.

## Stack

- Next.js 16 (Turbopack, `output: 'export'`)
- Fumadocs UI + MDX
- Tailwind v4
- Client-side search via zbsearch (i18n-aware: English + German tokenizers)

## Languages

`en` (default) and `de`. Content lives in `content/docs/`:

- `index.mdx` → English (default)
- `index.de.mdx` → Deutsch

Add a new locale by extending `src/lib/i18n.ts` and creating `<slug>.<locale>.mdx`
files alongside the defaults.

## Develop

```bash
npm install
npm run dev          # http://localhost:3000
```

Visit `/en` or `/de`. Root `/` redirects to the user's preferred language (with
fallback to `en`).

## Build

```bash
npm run build        # → ./out (static HTML, ready to ship)
npm run start        # local preview via `serve out`
```

## Deploy (bare-metal, Caddy)

The `out/` directory is fully static. Push it to the server and let Caddy serve it.

```bash
# from your dev machine
npm run build
rsync -av --delete ./out/ deploy@docs.fastmon.eu:/var/www/fastmon-docs/
```

`Caddyfile` in this repo is the production config — copy to
`/etc/caddy/sites/fastmon-docs.caddy` (or include from the main Caddyfile),
adjust the host, and reload Caddy.

### nginx alternative

```nginx
server {
  listen 443 ssl http2;
  server_name docs.fastmon.eu;
  root /var/www/fastmon-docs;

  location / {
    try_files $uri $uri.html $uri/index.html =404;
  }

  location /_next/static/ {
    add_header Cache-Control "public, max-age=31536000, immutable";
  }
}
```

## Notes

- No Google Fonts at runtime: `next/font/google` self-hosts at build time.
- No US-jurisdiction services in the runtime path. The build pulls from npm only.
- Search runs client-side via zbsearch; no external search service.

## Contributing

Spotted a mistake? Edit the page on GitHub and open a pull request, or file an
issue with the "Documentation error" template. See [CONTRIBUTING.md](CONTRIBUTING.md)
for the house rules (both languages, plain wording, no em-dashes).

## License

- Site code (`src/`, `scripts/`, config): [MIT](LICENSE)
- Documentation content (`content/`): [CC BY 4.0](LICENSE-CONTENT.md)
- Fonts (`public/fonts/`): SIL Open Font License 1.1, see the `OFL.txt` next to each font
- The fastmon name and logos are trademarks and not covered by these licenses
