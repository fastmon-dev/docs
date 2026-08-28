# fastmon Docs

Source of [docs.fastmon.eu](https://docs.fastmon.eu), the documentation for
[fastmon](https://fastmon.eu). Built with [Fumadocs](https://fumadocs.dev) on
Next.js as a static export; no Node runtime in production.

## Contributing

Spotted a mistake? Use the "Edit on GitHub" button at the top of any page, or
file an issue with the
[Documentation error](https://github.com/fastmon-dev/docs/issues/new?template=docs-error.yml)
template. [CONTRIBUTING.md](CONTRIBUTING.md) has the house rules (both
languages, plain wording, no em-dashes).

## Stack

- Next.js 16 (Turbopack, `output: 'export'`)
- Fumadocs UI + MDX
- Tailwind v4
- Client-side search via zbsearch (i18n-aware: English + German tokenizers)
- API reference generated at build time from the public OpenAPI document
  (`scripts/generate-api-docs.mjs`)

## Languages

`en` (default) and `de`. Content lives in `content/docs/`:

- `index.mdx`: English (default)
- `index.de.mdx`: Deutsch

Add a new locale by extending `src/lib/i18n.ts` and creating `<slug>.<locale>.mdx`
files alongside the defaults.

## Develop

```bash
npm install
make dev             # http://localhost:3000, bound to 0.0.0.0
make test            # typecheck + lint + format check + prose check
make build           # regenerate the API reference and export to ./out
make start           # preview ./out locally
```

Visit `/en` or `/de`. The root `/` redirects to the browser language, with
fallback to `en`.

`make build` fetches `https://api.fastmon.eu/v1/openapi.json`. Without network
access the build fails on purpose; `make dev` works offline for content pages.

## Notes

- Fonts are self-hosted from `public/fonts/`; nothing is loaded from Google at
  runtime.
- No third-party services in the runtime path. The build pulls from npm only.
- Search runs client-side; no external search service.

## License

- Site code (`src/`, `scripts/`, config): [MIT](LICENSE)
- Documentation content (`content/`): [CC BY 4.0](LICENSE-CONTENT.md)
- Fonts (`public/fonts/`): SIL Open Font License 1.1, see the `OFL.txt` next to
  each font
- The fastmon name and logos are trademarks and not covered by these licenses
